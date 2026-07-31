/*
 * The two booking emails.
 *
 * The HTML parts are checked for the things Gmail actually cares about (inline
 * styles, table layout, no external assets) and for escaping, rather than for
 * exact markup -- the whole point of the sentinel block is that the HTML can be
 * redesigned freely.
 */

import { describe, expect, it } from "vitest";
import { buildBookingPayload } from "../src/Booking";
import {
  escapeHtml,
  renderClientConfirmation,
  renderOwnerNotification
} from "../src/BookingEmails";
import {
  SUBMITTED_DATE_LA,
  SUBMITTED_TIME_LA,
  SUBMITTED_AT,
  singleSlotBooking,
  validBooking
} from "./fixtures";

const payload = buildBookingPayload(validBooking, SUBMITTED_AT);
const confirmation = renderClientConfirmation(payload);
const notification = renderOwnerNotification(payload, validBooking.email);

describe("escapeHtml", () => {

  it("escapes the characters that would break out of HTML context", () => {
    expect(escapeHtml(`<script>alert("x") & 'y'</script>`))
      .toBe("&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;");
  });

});

describe("client confirmation", () => {

  it("echoes the client's name", () => {
    expect(confirmation.text).toContain("Jordan Reyes");
    expect(confirmation.html).toContain("Jordan Reyes");
  });

  it("lists all three preferred slots with their availability", () => {
    for (const part of [confirmation.text, confirmation.html]) {
      expect(part).toContain("August 5, 2026");
      expect(part).toContain("After 4pm");
      expect(part).toContain("August 7, 2026");
      expect(part).toContain("Mornings only");
      expect(part).toContain("August 9, 2026");
      expect(part).toContain("Any time Saturday");
    }
  });

  it("omits slots the client skipped rather than showing N/A", () => {
    const single = renderClientConfirmation(
      buildBookingPayload(singleSlotBooking, SUBMITTED_AT)
    );
    expect(single.text).toContain("Option 1");
    expect(single.text).not.toContain("Option 2");
    expect(single.html).not.toContain("Option 3");
    expect(single.text).not.toContain("N/A");
  });

  it("shows the submitted time in Pacific", () => {
    expect(confirmation.text).toContain(`${SUBMITTED_DATE_LA} at ${SUBMITTED_TIME_LA}`);
  });

  it("carries no machine-readable block", () => {
    /* Only the owner notification feeds the pipeline. */
    expect(confirmation.text).not.toContain("BOOKING_JSON_START");
    expect(confirmation.html).not.toContain("BOOKING_JSON_START");
  });

});

describe("owner notification", () => {

  it("keeps the subject prefix the Gmail trigger filters on", () => {
    expect(notification.subject).toBe("Appointment Request from Jordan Reyes");
  });

  it("puts the sentinel block in the text part only", () => {
    expect(notification.text).toContain("---BOOKING_JSON_START---");
    expect(notification.text).toContain("---BOOKING_JSON_END---");
    expect(notification.html).not.toContain("BOOKING_JSON");
  });

  it("includes the client's email for replying, outside the payload", () => {
    expect(notification.text).toContain("jordan@example.com");
    expect(notification.html).toContain("jordan@example.com");
    const block = notification.text
      .split("---BOOKING_JSON_START---")[1]?.split("---BOOKING_JSON_END---")[0] ?? "";
    expect(block).not.toContain("jordan@example.com");
  });

});

describe.each([
  ["client confirmation", confirmation],
  ["owner notification", notification]
])("%s renders for Gmail", (_label, email) => {

  it("has a plain-text alternative part", () => {
    expect(email.text.trim().length).toBeGreaterThan(0);
  });

  it("lays out with tables, not flexbox or grid", () => {
    expect(email.html).toContain("<table");
    expect(email.html).not.toMatch(/display:\s*(flex|grid)/);
    expect(email.html).not.toMatch(/\bfloat:\s*(left|right)/);
  });

  it("styles inline rather than in a stylesheet", () => {
    expect(email.html).not.toContain("<style");
    expect(email.html).not.toContain("<link");
    expect(email.html).toContain("style=");
  });

  it("loads nothing from a third party", () => {
    expect(email.html).not.toMatch(/https?:\/\//);
    expect(email.html).not.toContain("<script");
  });

  it("sets a viewport and a max-width so it collapses on a phone", () => {
    expect(email.html).toContain("width=device-width");
    expect(email.html).toContain("max-width:600px");
  });

  it("uses the site's brand color", () => {
    expect(email.html).toContain("#00b9ff");
  });

  it("escapes client-supplied values", () => {
    const hostile = buildBookingPayload({
      ...validBooking,
      name: '<img src=x onerror="alert(1)">',
      description: "5 < 6 & 7 > 4"
    }, SUBMITTED_AT);

    const rendered = _label === "client confirmation"
      ? renderClientConfirmation(hostile)
      : renderOwnerNotification(hostile, validBooking.email);

    expect(rendered.html).not.toContain("<img src=x");
    expect(rendered.html).toContain("&lt;img src=x");
    expect(rendered.html).toContain("5 &lt; 6 &amp; 7 &gt; 4");
  });

});
