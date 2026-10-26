"""
The booking platform's Lambda code.

Ported from server/src on 2026-10-24 so the booking path could leave Render's
free tier, where the Express process slept after fifteen idle minutes and the
first request after that paid a measured 51.3 s cold start.

One module per concern, mirroring the TypeScript files they came from:

  booking.py     validation, the A..L payload, the sentinel JSON block
  emails.py      the two booking emails
  duplicates.py  the ten minute duplicate guard, as a DynamoDB conditional write
  ratelimit.py   the per address and global fixed windows, in DynamoDB
  resend.py      outbound email over Resend's HTTPS API
  auth.py        basic auth for the dashboard routes
  secrets.py     Parameter Store reads, once per cold start
  store.py       the bookings and contacts tables
  http.py        request parsing and responses for API Gateway's HTTP API
"""
