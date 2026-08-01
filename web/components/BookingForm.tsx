"use client";

/*
 * Appointment request form.
 *
 * The submit path POSTs JSON to the Express API, which revalidates every field
 * and sends both emails. Client-side validation exists only to give faster
 * feedback; it is not a security boundary.
 *
 * Label text is deliberately unchanged from the first build. The unit tests and
 * the Playwright end-to-end spec both query by these exact strings, and they
 * are the labels a client reads, so restyling should not touch them.
 *
 * The booking policies now sit inside the form, immediately above the box that
 * accepts them, rather than in a separate panel beside it. An acceptance
 * checkbox is worth little if what is being accepted is somewhere else.
 */

import { useState } from "react";
import { bookingEndpoint } from "@/lib/api";
import { SERIF } from "@/lib/fonts";
import { bookingPolicies } from "@/lib/site";
import {
  emptyBookingForm,
  limits,
  validateBookingForm,
  type BookingErrors,
  type IBookingForm
} from "@/lib/booking";

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent"; name: string }
  | { status: "error"; message: string };

const field =
  "w-full border-b border-neutral-400 bg-transparent pb-2.5 pt-1 text-[15px] text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-900";
const labelClass = "font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-600";

/* Marks a field the server will reject if left empty.
 *
 * The form used to label only what was optional, which meant a client
 * discovered the required ones by being turned away after submitting.
 *
 * aria-hidden on the glyph, with the requirement carried by aria-required on
 * the input instead: a screen reader announcing "asterisk" is noise, while
 * "required" is the actual information. */
function Required() {
  return <span aria-hidden="true" className="text-neutral-400"> *</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) { return null; }
  return <p role="alert" className="mt-2 text-[13px] text-red-700">{message}</p>;
}

export default function BookingForm() {
  const [form, setForm] = useState<IBookingForm>(emptyBookingForm);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const update = <K extends keyof IBookingForm>(key: K, value: IBookingForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) { return current; }
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const found = validateBookingForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSubmitState({ status: "idle" });
      return;
    }

    setSubmitState({ status: "sending" });
    try {
      const response = await fetch(bookingEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? "Your request could not be sent.");
      }

      setSubmitState({ status: "sent", name: form.name.trim() });
      setForm(emptyBookingForm);
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "Your request could not be sent."
      });
    }
  };

  if (submitState.status === "sent") {
    return (
      <div className="max-w-xl">
        <h3 className="text-[28px] tracking-tight text-neutral-900" style={{ fontFamily: SERIF }}>
          Request received
        </h3>
        <p className="mt-4 text-[16px] leading-relaxed text-neutral-700">
          Thank you, {submitState.name}. A confirmation is on its way with every
          time you offered, and I will be in touch soon to lock one in.
        </p>
        <button
          type="button"
          className="group relative mt-8 overflow-hidden bg-neutral-900 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.25em] text-white"
          onClick={() => setSubmitState({ status: "idle" })}
        >
          <span className="relative z-10">Book another appointment</span>
          <span className="absolute inset-0 -translate-x-full bg-[#0be6f9] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
        </button>
      </div>
    );
  }

  return (
    <form id="appointment-form" onSubmit={handleSubmit} noValidate className="space-y-10">
      {/* A bare asterisk means nothing on its own, so say what it marks. */}
      <p className="text-[13px] text-neutral-500">
        Fields marked <span aria-hidden="true">*</span> are required.
      </p>

      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <label htmlFor="name" className={labelClass}>Name<Required /></label>
          <input
            type="text" id="name" name="name" className={`${field} mt-2`}
            aria-required="true"
            maxLength={limits.name}
            autoComplete="name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
          <FieldError message={errors.name} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email<Required /></label>
          <input
            type="email" id="email" name="email" className={`${field} mt-2`}
            aria-required="true"
            maxLength={limits.email}
            autoComplete="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
          <p className="mt-2 text-[13px] text-neutral-500">Your confirmation goes here.</p>
          <FieldError message={errors.email} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number<Required /></label>
          <input
            type="tel" id="phone" name="phone" className={`${field} mt-2`}
            aria-required="true"
            maxLength={limits.phone}
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
          <FieldError message={errors.phone} />
        </div>
      </div>

      {/* All three slots. Two and three are optional, but each is a pair: a date
          without its availability, or the reverse, lands half-filled in the
          sheet, so the server rejects it. */}
      <div className="space-y-8">
        {([1, 2, 3] as const).map((index) => {
          const dateKey = `date${index}` as "date1" | "date2" | "date3";
          const availabilityKey =
            `availability${index}` as "availability1" | "availability2" | "availability3";
          const optional = index > 1 ? " (Optional)" : "";

          return (
            <div className="grid gap-8 sm:grid-cols-3" key={dateKey}>
              <div>
                <label htmlFor={dateKey} className={labelClass}>
                  Preferred Date {index}{optional}{index === 1 && <Required />}
                </label>
                <input
                  type="date" id={dateKey} name={dateKey} className={`${field} mt-2`}
                  value={form[dateKey]}
                  onChange={(event) => update(dateKey, event.target.value)}
                />
                <FieldError message={errors[dateKey]} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={availabilityKey} className={labelClass}>
                  Availability{index === 1 && <Required />}
                </label>
                <input
                  type="text" id={availabilityKey} name={availabilityKey}
                  className={`${field} mt-2`}
                  placeholder="Please describe your availability"
                  maxLength={limits.availability}
                  value={form[availabilityKey]}
                  onChange={(event) => update(availabilityKey, event.target.value)}
                />
                <FieldError message={errors[availabilityKey]} />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description of Haircut / Other Comments<Required />
        </label>
        <textarea
          id="description" name="description" rows={3}
          className={`${field} mt-2 resize-none`}
          maxLength={limits.description}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
        />
        <FieldError message={errors.description} />
      </div>

      <div className="border-t border-neutral-300 pt-8">
        <p className={labelClass}>Booking policies</p>
        <ul className="mt-4 space-y-2">
          {bookingPolicies.map((policy) => (
            <li key={policy} className="flex gap-3 text-[13px] leading-relaxed text-neutral-600">
              <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-neutral-500" />
              {policy}
            </li>
          ))}
        </ul>

        <label className="mt-6 inline-flex cursor-pointer items-center">
          <input
            type="checkbox" name="policiesAccepted"
            className="h-4 w-4 accent-neutral-900"
            aria-required="true"
            checked={form.policiesAccepted}
            onChange={(event) => update("policiesAccepted", event.target.checked)}
          />
          <span className="ml-3 text-[14px] text-neutral-800">
            I accept the booking policies<Required />
          </span>
        </label>
        <FieldError message={errors.policiesAccepted} />
      </div>

      {/* Honeypot. Positioned off-screen rather than display:none, since some
          bots skip hidden inputs but not ones they can still "see". Real
          users never reach it: it is out of the tab order and unlabelled. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          type="text" id="website" name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      {submitState.status === "error" && (
        <p role="alert" className="text-[13px] text-red-700">{submitState.message}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitState.status === "sending"}
          className="group relative overflow-hidden bg-neutral-900 px-10 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="relative z-10">
            {submitState.status === "sending" ? "Sending..." : "Submit"}
          </span>
          <span className="absolute inset-0 -translate-x-full bg-[#0be6f9] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-enabled:group-hover:translate-x-0" />
        </button>
        <p className="mt-5 text-[13px] text-neutral-600">
          You will get a confirmation by email, and I will be in touch soon.
        </p>
      </div>
    </form>
  );
}
