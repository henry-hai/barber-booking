"""
Basic auth on the dashboard routes. A port of server/tests/auth.test.ts.
"""

import base64

import dashboard_handler
from barber.auth import Credentials, credentials_match, parse_basic_auth
from conftest import DASHBOARD_PASSWORD, DASHBOARD_USER
from support import api_event, body_of


def basic(user: str, password: str) -> str:
    return "Basic " + base64.b64encode(f"{user}:{password}".encode()).decode()


class TestParseBasicAuth:

    def test_parses_a_well_formed_header(self):
        assert parse_basic_auth(basic("henry", "pw")) == Credentials("henry", "pw")

    def test_is_case_insensitive_on_the_scheme(self):
        assert parse_basic_auth(basic("henry", "pw").replace("Basic", "basic")) == Credentials("henry", "pw")

    def test_splits_on_the_first_colon_only(self):
        assert parse_basic_auth(basic("henry", "a:b:c")) == Credentials("henry", "a:b:c")

    def test_rejects_other_schemes_and_junk(self):
        assert parse_basic_auth("Bearer abc") is None
        assert parse_basic_auth("Basic !!!not-base64!!!") is None
        assert parse_basic_auth("Basic " + base64.b64encode(b"no-colon").decode()) is None
        assert parse_basic_auth(None) is None
        assert parse_basic_auth("") is None


class TestCredentialsMatch:

    def test_requires_both_halves(self):
        expected = Credentials("henry", "pw")
        assert credentials_match(Credentials("henry", "pw"), expected) is True
        assert credentials_match(Credentials("henry", "PW"), expected) is False
        assert credentials_match(Credentials("Henry", "pw"), expected) is False
        assert credentials_match(None, expected) is False


class TestDashboardGuard:

    def test_refuses_without_credentials_and_challenges(self, dashboard_rt):
        response = dashboard_handler.handler(api_event("GET", "/appointments"))
        assert response["statusCode"] == 401
        assert response["headers"]["WWW-Authenticate"].startswith('Basic realm="Henry Hai Studio appointments"')

    def test_refuses_wrong_credentials(self, dashboard_rt):
        response = dashboard_handler.handler(api_event(
            "GET", "/appointments", headers={"authorization": basic(DASHBOARD_USER, "wrong")}
        ))
        assert response["statusCode"] == 401

    def test_skips_the_browser_challenge_for_the_dashboards_own_requests(self, dashboard_rt):
        response = dashboard_handler.handler(api_event(
            "GET", "/appointments", headers={"x-requested-with": "dashboard"}
        ))
        assert response["statusCode"] == 401
        assert "WWW-Authenticate" not in response["headers"]

    def test_lets_the_right_credentials_through(self, dashboard_rt):
        response = dashboard_handler.handler(api_event(
            "GET", "/appointments", headers={"Authorization": basic(DASHBOARD_USER, DASHBOARD_PASSWORD)}
        ))
        assert response["statusCode"] == 200
        assert body_of(response) == []

    def test_fails_closed_when_no_credentials_are_configured(self, dashboard_rt):
        dashboard_rt.expected = None
        response = dashboard_handler.handler(api_event(
            "GET", "/appointments", headers={"Authorization": basic(DASHBOARD_USER, DASHBOARD_PASSWORD)}
        ))
        assert response["statusCode"] == 503
        assert body_of(response)["message"] == "The dashboard is not configured on this stage."

    def test_guards_before_routing_so_unknown_paths_do_not_leak(self, dashboard_rt):
        assert dashboard_handler.handler(api_event("GET", "/secret"))["statusCode"] == 401
