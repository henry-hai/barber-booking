"""
Assertions about template.yaml that the code depends on.

In the spirit of the server's sheet-range test: configuration that lives
outside the code can drift from it with no error anywhere, so the suite reads
the template and checks the things the handlers assume. CORS is the clearest
case. The functions emit no CORS headers because the API does, and if the
API's allow list ever dropped Authorization the dashboard would break with
nothing in any log.
"""

import importlib
import re
from pathlib import Path

import pytest

from support import INFRA, load_template

TEMPLATE = load_template()
RESOURCES = TEMPLATE["Resources"]
FUNCTIONS = {name: res for name, res in RESOURCES.items() if res["Type"] == "AWS::Serverless::Function"}
TABLES = {name: res for name, res in RESOURCES.items() if res["Type"] == "AWS::DynamoDB::Table"}


def statements(function):
    for policy in function["Properties"]["Policies"]:
        yield from policy["Statement"]


def listed(value):
    return value if isinstance(value, list) else [value]


class TestCors:

    def test_the_api_owns_cors_and_allows_what_the_clients_send(self):
        cors = RESOURCES["Api"]["Properties"]["CorsConfiguration"]
        assert cors["AllowOrigins"] == ["*"]
        assert {"GET", "POST", "DELETE", "OPTIONS"} <= set(cors["AllowMethods"])
        # Content-Type for the booking form, Authorization and X-Requested-With
        # for the dashboard's own sign-in.
        assert {"Content-Type", "Authorization", "X-Requested-With"} <= set(cors["AllowHeaders"])

    def test_the_api_throttles(self):
        settings = RESOURCES["Api"]["Properties"]["DefaultRouteSettings"]
        assert settings["ThrottlingBurstLimit"] > 0
        assert settings["ThrottlingRateLimit"] > 0


class TestRoutes:

    EXPECTED = {
        ("POST", "/booking"), ("GET", "/healthz"),
        ("GET", "/appointments"), ("GET", "/contacts"), ("POST", "/contacts"), ("DELETE", "/contacts/{id}"),
    }

    def test_declares_exactly_the_routes_the_handlers_serve(self):
        declared = set()
        for function in FUNCTIONS.values():
            for event in function["Properties"]["Events"].values():
                assert event["Type"] == "HttpApi"
                declared.add((event["Properties"]["Method"], event["Properties"]["Path"]))
        assert declared == self.EXPECTED

    def test_each_route_key_appears_in_its_handler_source(self):
        for name, function in FUNCTIONS.items():
            module = function["Properties"]["Handler"].split(".")[0]
            source = (INFRA / "src" / f"{module}.py").read_text()
            for event in function["Properties"]["Events"].values():
                key = f'{event["Properties"]["Method"]} {event["Properties"]["Path"]}'
                assert f'"{key}"' in source, f"{name} does not dispatch on {key}"

    def test_handlers_resolve(self):
        for function in FUNCTIONS.values():
            module_name, attribute = function["Properties"]["Handler"].split(".")
            assert callable(getattr(importlib.import_module(module_name), attribute))


class TestLeastPrivilege:

    def test_no_wildcard_actions_or_resources(self):
        for name, function in FUNCTIONS.items():
            for statement in statements(function):
                for action in listed(statement["Action"]):
                    assert "*" not in action, f"{name}: {action}"
                for resource in listed(statement["Resource"]):
                    text = resource["Fn::Sub"] if isinstance(resource, dict) and "Fn::Sub" in resource else str(resource)
                    assert text != "*" and not text.endswith("/*"), f"{name}: {resource}"

    def test_the_booking_function_cannot_read_the_table(self):
        actions = {a for s in statements(FUNCTIONS["BookingFunction"]) for a in listed(s["Action"])}
        assert "dynamodb:Scan" not in actions
        assert "dynamodb:Query" not in actions
        assert "dynamodb:GetItem" not in actions
        assert {"dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem"} <= actions

    def test_the_dashboard_function_cannot_write_bookings(self):
        for statement in statements(FUNCTIONS["DashboardFunction"]):
            resource = statement["Resource"]
            if isinstance(resource, dict) and resource.get("Fn::GetAtt") == ["BookingsTable", "Arn"]:
                assert listed(statement["Action"]) == ["dynamodb:Scan"]

    def test_each_function_reads_only_its_own_parameters(self):
        for name, function in FUNCTIONS.items():
            for statement in statements(function):
                if "ssm:GetParameter" not in listed(statement["Action"]):
                    continue
                for resource in listed(statement["Resource"]):
                    text = resource["Fn::Sub"]
                    assert ":parameter/barber/${Stage}/" in text
                    if name == "BookingFunction":
                        assert text.endswith("/resend/api-key")
                    else:
                        assert "/dashboard/" in text

    def test_no_secret_values_in_the_template(self):
        text = (INFRA / "template.yaml").read_text()
        assert not re.search(r"re_[A-Za-z0-9]{20,}", text)
        for key in ("DASHBOARD_PASSWORD", "RESEND_API_KEY"):
            assert key not in text


class TestTables:

    def test_are_retained_when_a_stack_is_deleted(self):
        for name, table in TABLES.items():
            assert table["DeletionPolicy"] == "Retain", name
            assert table["UpdateReplacePolicy"] == "Retain", name

    def test_ttl_attribute_is_the_one_the_code_writes(self):
        from barber import duplicates, ratelimit
        ttl = TABLES["BookingsTable"]["Properties"]["TimeToLiveSpecification"]
        assert ttl == {"AttributeName": "expiresAt", "Enabled": True}
        for module in (duplicates, ratelimit):
            assert "expiresAt" in Path(module.__file__).read_text()

    def test_both_stages_fit_the_always_free_capacity(self):
        reads = writes = 0
        for table in TABLES.values():
            props = table["Properties"]
            assert props["BillingMode"] == "PROVISIONED"
            reads += props["ProvisionedThroughput"]["ReadCapacityUnits"]
            writes += props["ProvisionedThroughput"]["WriteCapacityUnits"]
            for index in props.get("GlobalSecondaryIndexes", []):
                reads += index["ProvisionedThroughput"]["ReadCapacityUnits"]
                writes += index["ProvisionedThroughput"]["WriteCapacityUnits"]
        assert reads * 2 <= 25 and writes * 2 <= 25

    def test_the_date_index_exists_with_the_keys_the_items_carry(self):
        [index] = TABLES["BookingsTable"]["Properties"]["GlobalSecondaryIndexes"]
        assert index["IndexName"] == "date-index"
        assert [(k["AttributeName"], k["KeyType"]) for k in index["KeySchema"]] == [("date", "HASH"), ("submittedAt", "RANGE")]


class TestStaticHosting:

    @pytest.mark.parametrize("bucket", ["SiteBucket", "DashboardBucket"])
    def test_buckets_block_all_public_access(self, bucket):
        block = RESOURCES[bucket]["Properties"]["PublicAccessBlockConfiguration"]
        assert all(block.values())

    @pytest.mark.parametrize("distribution", ["SiteDistribution", "DashboardDistribution"])
    def test_distributions_use_origin_access_control_and_https(self, distribution):
        config = RESOURCES[distribution]["Properties"]["DistributionConfig"]
        [origin] = config["Origins"]
        # The short form parses as "OriginAccessControl.Id", the long form as a list.
        reference = origin["OriginAccessControlId"]["Fn::GetAtt"]
        assert reference in ("OriginAccessControl.Id", ["OriginAccessControl", "Id"])
        assert config["DefaultCacheBehavior"]["ViewerProtocolPolicy"] == "redirect-to-https"

    def test_runtime_is_the_one_the_prompt_asked_for(self):
        assert TEMPLATE["Globals"]["Function"]["Runtime"] == "python3.13"
