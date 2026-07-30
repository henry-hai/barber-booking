/* Client-side booking validation. These checks only exist to give the form
   faster feedback -- the server revalidates everything -- but they need to agree
   with the server, so the cases here mirror server/tests/booking.test.ts. */

import { describe, expect, it } from "vitest";
import {
  emptyBookingForm,
  isValidBookingForm,
  validateBookingForm,
  type IBookingForm
} from "@/lib/booking";

const valid: IBookingForm = {
  ...emptyBookingForm,
  name: "Jordan Reyes",
  email: "jordan@example.com",
  phone: "(408) 555-0147",
  date1: "2026-08-05",
  availability1: "After 4pm",
  description: "Mid fade, scissor top",
  policiesAccepted: true
};

describe("validateBookingForm", () => {

  it("accepts a booking with only the required fields", () => {
    expect(validateBookingForm(valid)).toEqual({});
    expect(isValidBookingForm(valid)).toBe(true);
  });

  it("accepts a booking with all three slots filled", () => {
    const errors = validateBookingForm({
      ...valid,
      date2: "2026-08-07", availability2: "Mornings",
      date3: "2026-08-09", availability3: "Any time"
    });
    expect(errors).toEqual({});
  });

  it("rejects an empty form and names every missing field", () => {
    const errors = validateBookingForm(emptyBookingForm);
    expect(Object.keys(errors).sort()).toEqual([
      "availability1", "date1", "description", "email", "name",
      "phone", "policiesAccepted"
    ]);
  });

  it.each([
    ["missing", ""],
    ["no at sign", "jordanexample.com"],
    ["no domain dot", "jordan@example"],
    ["containing a space", "jordan smith@example.com"]
  ])("rejects an email address %s", (_label, email) => {
    expect(validateBookingForm({ ...valid, email })).toHaveProperty("email");
  });

  it("accepts a plus-addressed email", () => {
    expect(validateBookingForm({ ...valid, email: "jordan+cuts@example.co.uk" }))
      .toEqual({});
  });

  it("accepts phone numbers however they are punctuated", () => {
    for (const phone of ["4085550147", "408-555-0147", "(408) 555-0147", "+1 408 555 0147"]) {
      expect(validateBookingForm({ ...valid, phone })).toEqual({});
    }
  });

  it("rejects a phone number with fewer than seven digits", () => {
    expect(validateBookingForm({ ...valid, phone: "555-014" })).toHaveProperty("phone");
  });

  it("rejects a first date that is not YYYY-MM-DD", () => {
    expect(validateBookingForm({ ...valid, date1: "08/05/2026" })).toHaveProperty("date1");
  });

  it("requires a date alongside an availability note for slots 2 and 3", () => {
    expect(validateBookingForm({ ...valid, availability2: "Evenings" }))
      .toHaveProperty("date2");
    expect(validateBookingForm({ ...valid, availability3: "Evenings" }))
      .toHaveProperty("date3");
  });

  it("requires an availability note alongside a date for slots 2 and 3", () => {
    expect(validateBookingForm({ ...valid, date2: "2026-08-07" }))
      .toHaveProperty("availability2");
    expect(validateBookingForm({ ...valid, date3: "2026-08-09" }))
      .toHaveProperty("availability3");
  });

  it("requires the policies checkbox", () => {
    expect(validateBookingForm({ ...valid, policiesAccepted: false }))
      .toHaveProperty("policiesAccepted");
  });

  it("treats whitespace-only input as empty", () => {
    const errors = validateBookingForm({
      ...valid, name: "   ", description: "\n\t ", availability1: "  "
    });
    expect(errors).toHaveProperty("name");
    expect(errors).toHaveProperty("description");
    expect(errors).toHaveProperty("availability1");
  });

  it("rejects fields past their length caps", () => {
    expect(validateBookingForm({ ...valid, name: "a".repeat(101) }))
      .toHaveProperty("name");
    expect(validateBookingForm({ ...valid, description: "a".repeat(2001) }))
      .toHaveProperty("description");
    expect(validateBookingForm({ ...valid, availability1: "a".repeat(501) }))
      .toHaveProperty("availability1");
  });

  it("ignores the honeypot field, which the server handles", () => {
    expect(validateBookingForm({ ...valid, website: "http://spam.example" }))
      .toEqual({});
  });

});
