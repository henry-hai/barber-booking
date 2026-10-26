#!/usr/bin/env bash
#
# Builds the site and the dashboard against one stage's API and publishes
# them to that stage's buckets, then invalidates both distributions.
#
#   infra/scripts/deploy_static.sh test
#   infra/scripts/deploy_static.sh prod
#
# Run after `sam deploy`, which is what creates the buckets and prints the
# API URL this bakes into both builds. Needs a signed-in AWS CLI (aws login)
# and node_modules in web/ and client/.
#
# Cache headers: hashed assets (Next's _next/static and the pre-rendered
# photos) are immutable for a year, everything else is revalidated on every
# request, and the invalidation makes the new index.html visible at once.

set -euo pipefail

STAGE="${1:?usage: deploy_static.sh <test|prod>}"
STACK="barber-${STAGE}"
REGION="${AWS_REGION:-us-west-2}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

output() {
  aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}

API_URL="$(output ApiUrl)"
SITE_BUCKET="$(output SiteBucketName)"
DASHBOARD_BUCKET="$(output DashboardBucketName)"
SITE_DISTRIBUTION="$(output SiteDistributionId)"
DASHBOARD_DISTRIBUTION="$(output DashboardDistributionId)"

if [[ -z "$API_URL" || "$API_URL" == "None" ]]; then
  echo "Stack ${STACK} has no ApiUrl output. Run sam deploy --config-env ${STAGE} first." >&2
  exit 1
fi

echo "==> Building the site against ${API_URL}"
(cd "${ROOT}/web" && NEXT_PUBLIC_API_BASE_URL="$API_URL" npm run build:static)

echo "==> Building the dashboard against ${API_URL}"
(cd "${ROOT}/client" && DASHBOARD_API_BASE_URL="$API_URL" npm run build)

echo "==> Publishing the site to s3://${SITE_BUCKET}"
aws s3 sync "${ROOT}/web/out" "s3://${SITE_BUCKET}" --region "$REGION" --delete \
  --exclude "*" --include "_next/static/*" --include "img/_r/*" \
  --cache-control "public, max-age=31536000, immutable"
aws s3 sync "${ROOT}/web/out" "s3://${SITE_BUCKET}" --region "$REGION" --delete \
  --exclude "_next/static/*" --exclude "img/_r/*" \
  --cache-control "public, max-age=0, must-revalidate"

echo "==> Publishing the dashboard to s3://${DASHBOARD_BUCKET}"
aws s3 sync "${ROOT}/client/dist" "s3://${DASHBOARD_BUCKET}" --region "$REGION" --delete \
  --cache-control "public, max-age=0, must-revalidate"

echo "==> Invalidating CloudFront"
aws cloudfront create-invalidation --distribution-id "$SITE_DISTRIBUTION" --paths "/*" --query Invalidation.Id --output text
aws cloudfront create-invalidation --distribution-id "$DASHBOARD_DISTRIBUTION" --paths "/*" --query Invalidation.Id --output text

echo
echo "Site:      $(output SiteUrl)"
echo "Dashboard: $(output DashboardUrl)"
echo "API:       ${API_URL}"
