"""
HTML and plain-text bodies for the two booking emails.

Ported from server/src/BookingEmails.ts, string for string, so an email sent
from Lambda is indistinguishable from one sent by the Express route. Written
for Gmail, which is the constraint that shapes all of it: table-based layout
because Gmail strips float and drops most of flexbox and grid, inline styles
on every element because Gmail strips <style> blocks in some clients, no
media queries relied on for correctness, no web fonts. Colors match the
site's palette.

The owner notification's HTML part is decorative only. The machine-readable
payload rides in the plain-text part, between the sentinels in booking.py.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Mapping, Optional

from .booking import ISO_DATE, NA, serialize_booking_block

# The site's palette, so an email reads as coming from the same place. The
# accent is the darker cyan: the bright value is for a mark sitting on a
# photograph, and on a pale ground at small sizes it stops being readable.
COLORS = {
    "brand": "#0b6f85",
    "ink": "#1b2436",
    "body": "#4b5563",
    "muted": "#6f7683",
    "hairline": "#e2ddd5",
    "panel": "#efebe5",
    "page": "#f5f2ee",
}

FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"


@dataclass(frozen=True)
class RenderedEmail:
    subject: str
    text: str
    html: str


def escape_html(value: str) -> str:
    """Escapes the five characters that would otherwise break out of HTML
    context. Every value below is client-supplied, so all of it goes through
    here."""
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def display(value: str) -> str:
    """"N/A" reads as a placeholder in a table but as noise in a sentence."""
    return "Not provided" if value == NA else value


def offered_slots(payload: Mapping[str, str]) -> list[dict[str, str]]:
    """The three preferred slots, minus the ones the client left blank."""
    slots = [
        {"label": "Option 1", "date": payload["date1"], "availability": payload["avail1"]},
        {"label": "Option 2", "date": payload["date2"], "availability": payload["avail2"]},
        {"label": "Option 3", "date": payload["date3"], "availability": payload["avail3"]},
    ]
    return [slot for slot in slots if slot["date"] != NA or slot["availability"] != NA]


def long_date(value: str) -> str:
    """Renders YYYY-MM-DD as "Wednesday, August 5, 2026". Falls back to the
    raw value if it is anything else, so nothing is ever lost to formatting."""
    if not ISO_DATE.match(value):
        return display(value)
    try:
        parsed = date.fromisoformat(value)
    except ValueError:
        return value
    return f"{parsed:%A}, {parsed:%B} {parsed.day}, {parsed.year}"


def wrap(title: str, inner: str) -> str:
    """Outer shell: a centered, max-width table on a tinted page background."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape_html(title)}</title>
</head>
<body style="margin:0; padding:0; background-color:{COLORS['page']}; font-family:{FONT}; color:{COLORS['body']}; -webkit-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{COLORS['page']}; padding:24px 12px;">
<tr>
<td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:8px; border:1px solid {COLORS['hairline']};">
{inner}
</table>
</td>
</tr>
</table>
</body>
</html>"""


def header(heading: str) -> str:
    """Brand-colored header bar with the shop name."""
    return f"""<tr>
<td style="background-color:{COLORS['ink']}; padding:24px; border-radius:8px 8px 0 0;">
<h1 style="margin:0; font-family:{FONT}; font-size:20px; line-height:28px; font-weight:bold; color:#ffffff;">{escape_html(heading)}</h1>
<p style="margin:4px 0 0 0; font-family:{FONT}; font-size:12px; line-height:20px; letter-spacing:2px; text-transform:uppercase; color:#7fd3e4;">Henry Hai Studio</p>
</td>
</tr>"""


def footer() -> str:
    return f"""<tr>
<td style="padding:16px 24px 24px 24px; border-top:1px solid {COLORS['hairline']};">
<p style="margin:0; font-family:{FONT}; font-size:12px; line-height:18px; color:{COLORS['muted']};">Henry Hai Studio, Milpitas &amp; Irvine, CA</p>
</td>
</tr>"""


def detail_row(label: str, value: str) -> str:
    """One label/value row of the details table."""
    return f"""<tr>
<td style="padding:8px 0; border-bottom:1px solid {COLORS['hairline']}; font-family:{FONT}; font-size:14px; line-height:20px; color:{COLORS['muted']}; width:38%; vertical-align:top;">{escape_html(label)}</td>
<td style="padding:8px 0; border-bottom:1px solid {COLORS['hairline']}; font-family:{FONT}; font-size:14px; line-height:20px; color:{COLORS['ink']}; vertical-align:top;">{escape_html(value)}</td>
</tr>"""


def slot_cards(payload: Mapping[str, str]) -> str:
    """A card per preferred slot, used by both emails."""
    slots = offered_slots(payload)
    if not slots:
        return ""
    return "\n".join(
        f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px 0; background-color:{COLORS['panel']}; border-radius:6px;">
<tr>
<td style="padding:12px 16px;">
<p style="margin:0; font-family:{FONT}; font-size:12px; line-height:16px; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; color:{COLORS['brand']};">{escape_html(slot['label'])}</p>
<p style="margin:4px 0 0 0; font-family:{FONT}; font-size:15px; line-height:22px; font-weight:bold; color:{COLORS['ink']};">{escape_html(long_date(slot['date']))}</p>
<p style="margin:2px 0 0 0; font-family:{FONT}; font-size:14px; line-height:20px; color:{COLORS['body']};">{escape_html(display(slot['availability']))}</p>
</td>
</tr>
</table>"""
        for slot in slots
    )


def slot_lines(payload: Mapping[str, str]) -> str:
    """Same slots as plain text."""
    slots = offered_slots(payload)
    if not slots:
        return "  (none provided)"
    return "\n".join(
        f"  {slot['label']}: {long_date(slot['date'])}\n    Availability: {display(slot['availability'])}"
        for slot in slots
    )


def render_client_confirmation(payload: Mapping[str, str]) -> RenderedEmail:
    """Client confirmation. Echoes the name back and lists every slot the
    client offered, so they have a record of what they asked for."""
    subject = "Appointment request received - Henry Hai Studio"

    html = wrap(subject, f"""{header("Your request is in")}
<tr>
<td style="padding:24px;">
<p style="margin:0 0 16px 0; font-family:{FONT}; font-size:16px; line-height:24px; color:{COLORS['ink']};">Hi {escape_html(payload['name'])},</p>
<p style="margin:0 0 20px 0; font-family:{FONT}; font-size:15px; line-height:23px; color:{COLORS['body']};">Thanks for booking with me. I&#39;ve received your request and I&#39;ll be in touch shortly to confirm one of the times below. Nothing is locked in until I reply.</p>

<p style="margin:0 0 12px 0; font-family:{FONT}; font-size:14px; line-height:20px; font-weight:bold; color:{COLORS['ink']};">The times you offered</p>
{slot_cards(payload)}

<p style="margin:20px 0 12px 0; font-family:{FONT}; font-size:14px; line-height:20px; font-weight:bold; color:{COLORS['ink']};">What you asked for</p>
<p style="margin:0 0 20px 0; font-family:{FONT}; font-size:15px; line-height:23px; color:{COLORS['body']};">{escape_html(display(payload['description']))}</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
{detail_row("Name", display(payload['name']))}
{detail_row("Phone", display(payload['phone']))}
{detail_row("Submitted", f"{payload['date']} at {payload['time']} (Pacific)")}
</table>

<p style="margin:20px 0 0 0; font-family:{FONT}; font-size:14px; line-height:21px; color:{COLORS['muted']};">If any of this looks wrong, just reply to this email and I&#39;ll sort it out.</p>
</td>
</tr>
{footer()}""")

    text = f"""Hi {payload['name']},

Thanks for booking with me. I've received your request and I'll be in touch
shortly to confirm one of the times below. Nothing is locked in until I reply.

THE TIMES YOU OFFERED
{slot_lines(payload)}

WHAT YOU ASKED FOR
  {display(payload['description'])}

YOUR DETAILS
  Name: {display(payload['name'])}
  Phone: {display(payload['phone'])}
  Submitted: {payload['date']} at {payload['time']} (Pacific)

If any of this looks wrong, just reply to this email and I'll sort it out.

--
Henry Hai Studio
Milpitas & Irvine, CA
"""

    return RenderedEmail(subject=subject, text=text, html=html)


def render_owner_notification(
    payload: Mapping[str, str], client_email: Optional[str] = None
) -> RenderedEmail:
    """Owner notification.

    The subject line keeps starting with "Appointment Request from". Every
    request going back to 2024 is filed under it, so it is what makes the
    mailbox searchable as a history.

    The plain-text part ends with the sentinel-wrapped JSON payload, the only
    machine-readable copy of a request outside the table. Everything above it,
    and the whole HTML part, is for reading.
    """
    subject = f"Appointment Request from {payload['name']}"

    contact_rows = "\n".join([
        detail_row("Phone", display(payload["phone"])),
        detail_row("Email", client_email) if client_email else "",
        detail_row("Submitted", f"{payload['date']} at {payload['time']} (Pacific)"),
    ])

    html = wrap(subject, f"""{header(f"New request from {payload['name']}")}
<tr>
<td style="padding:24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
{detail_row("Name", display(payload['name']))}
{contact_rows}
</table>

<p style="margin:0 0 12px 0; font-family:{FONT}; font-size:14px; line-height:20px; font-weight:bold; color:{COLORS['ink']};">Preferred times</p>
{slot_cards(payload)}

<p style="margin:20px 0 12px 0; font-family:{FONT}; font-size:14px; line-height:20px; font-weight:bold; color:{COLORS['ink']};">Haircut / comments</p>
<p style="margin:0; font-family:{FONT}; font-size:15px; line-height:23px; color:{COLORS['body']};">{escape_html(display(payload['description']))}</p>
</td>
</tr>
{footer()}""")

    email_line = f"\n  Email: {client_email}" if client_email else ""
    text = f"""New appointment request from {payload['name']}.

  Name: {display(payload['name'])}
  Phone: {display(payload['phone'])}{email_line}
  Submitted: {payload['date']} at {payload['time']} (Pacific)

PREFERRED TIMES
{slot_lines(payload)}

HAIRCUT / COMMENTS
  {display(payload['description'])}

The block below is this request in machine-readable form, kept so the row can
be rebuilt if it never reached the sheet. Leave it alone.

{serialize_booking_block(payload)}
"""

    return RenderedEmail(subject=subject, text=text, html=html)
