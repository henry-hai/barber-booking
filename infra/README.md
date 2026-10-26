# infra

The booking platform on AWS. One SAM stack per stage, `barber-test` and
`barber-prod`, in us-west-2.

Why it exists: the Express API on Render's free tier slept after fifteen idle
minutes, and on 2026-10-22 the first request after that took 51.3 s. The form
sat on "Sending..." with no timeout, the booking went through behind it, and
the visitor left thinking it had failed. Nothing here sleeps.

## What runs where

| Service | What it does here |
|---|---|
| API Gateway (HTTP API) | One API. Answers CORS preflights itself, throttles everyone together, logs every request to CloudWatch. |
| Lambda, `barber-booking-<stage>` | `POST /booking` and `GET /healthz`. Validates, rate limits, guards against duplicates, saves, sends both emails, then answers. Python 3.13 on arm64. |
| Lambda, `barber-dashboard-<stage>` | `GET /appointments` and `GET`, `POST`, `DELETE /contacts`, behind basic auth. |
| DynamoDB, `barber-bookings-<stage>` | Every booking, plus the short-lived duplicate guard and rate limit items, which expire by TTL. GSI `date-index` on the Pacific calendar day. |
| DynamoDB, `barber-contacts-<stage>` | The contacts list that used to live in a NeDB file. |
| S3, `barber-site-<stage>-<account>` | The static export of `web/`. Private. |
| S3, `barber-dashboard-<stage>-<account>` | The built dashboard from `client/`. Private. |
| CloudFront, two distributions | Serve the two buckets over HTTPS through origin access control. The only way into either bucket. |
| Parameter Store | `/barber/<stage>/resend/api-key`, `/barber/<stage>/dashboard/user`, `/barber/<stage>/dashboard/password`. SecureString. Read once per cold start. |
| CloudWatch Logs | API access log and both function logs, 30 day retention. |
| Budgets (`account.yaml`) | $5 a month, emails at 80%, 100% and a 100% forecast. Account-wide, deployed once from us-east-1. |

Provisioned DynamoDB capacity across both stages is 16 read and 16 write
units, inside the always-free 25 and 25. Everything else sits inside its
always-free allowance at fifty bookings a month. See the cost estimate in the
project context file.

## Deploy

First time on a machine:

```
aws login                                   # browser sign-in, 12 hour session
aws sts get-caller-identity                 # should name the deploy user
```

First time in an account:

```
aws cloudformation deploy --region us-east-1 --stack-name barber-account \
  --template-file infra/account.yaml --parameter-overrides Email=henryhaistudio@gmail.com
```

Then the secrets, once per stage. Create these in the console (Systems
Manager, Parameter Store, Create parameter, type SecureString) or from a
terminal you own, never from a script in the repo:

```
/barber/test/resend/api-key
/barber/test/dashboard/user
/barber/test/dashboard/password
```

Then the stack and the static sites:

```
cd infra
sam build
sam deploy --config-env test               # prints the API, site and dashboard URLs
scripts/deploy_static.sh test              # builds web/ and client/ against that API and uploads
```

`sam deploy` is safe to repeat. It makes a change set and applies the
difference. The test stage applies without asking. Prod shows the change set
and waits for a yes.

The first deploy of a stage takes about ten minutes, almost all of it
CloudFront. Later ones take one or two.

## Roll back

Everything is in git, so rolling back is deploying an older commit.

| What went wrong | What to do |
|---|---|
| A function or the template | `git checkout <good commit> -- infra/src infra/template.yaml`, then `sam build && sam deploy --config-env <stage>`. CloudFormation keeps the tables either way. |
| The site or the dashboard | `git checkout <good commit> -- web client`, then `scripts/deploy_static.sh <stage>`. The bucket sync and the invalidation put the old build back in a minute or two. |
| A deploy that failed halfway | CloudFormation already rolled the stack back to its last good state. Fix the template and deploy again. |
| Everything, back to Render | Nothing on Render was touched. Point the domain back at Vercel and the form at the Render API. Both are Henry's call and not done by any script here. |

Deleting a stack leaves its two tables behind on purpose
(`DeletionPolicy: Retain`). Delete those by hand if they are really not wanted.

## Secrets

No secret appears in the template, the code, the repo or the browser bundle.
The functions read Parameter Store at cold start and each role may read only
its own names: the booking function the Resend key, the dashboard function the
two credentials. Decryption uses the account's default `aws/ssm` key, so no
KMS grant is needed.

The dashboard asks for the credentials in its own form when it is served from
CloudFront, because a browser will not send basic-auth credentials to another
origin. They are held in the tab's sessionStorage and sent as an
`Authorization` header on each call. Served from Render, on the same origin as
Express, the browser's own prompt still covers it and the form never shows.

## Importing the history

`scripts/import_sheet.py` copies the booking sheet into the test table. It
reads columns A:C and F:L only, never D or E, so imported rows have no phone
and no first preferred date. It opens the sheet read-only, keys each item on a
hash of its cells so it can be re-run, and does nothing without `--apply`.

```
uv run infra/scripts/import_sheet.py             # dry run
uv run infra/scripts/import_sheet.py --apply
```

`scripts/import_contacts.py` does the same for a NeDB `contacts.db` file, if
one ever turns up. None exists on this machine and Render's copy was on an
ephemeral disk.

## Tests

```
cd infra && uv run pytest
```

Everything runs against moto. The tables are created from `template.yaml`
itself, so a key schema change the code does not handle fails here before it
reaches AWS. `test_template.py` reads the template for the things the code
assumes but cannot see: the CORS allow list, the throttle, the TTL attribute,
and that each function's policy names specific resources and nothing with a
wildcard.

Resend is replaced by a recorder. No test sends email or reaches AWS.

## Logs

```
sam logs --config-env test --name BookingFunction --tail
aws logs tail /barber/test/api-access --follow
```

A booking that failed to save still shows up in the owner notification with
its JSON block, which is how a row gets rebuilt by hand.
