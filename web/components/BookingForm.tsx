"use client";

/*
 * Appointment request form. Same fields as the old static site; the submit
 * path now POSTs JSON to the Express API instead of calling EmailJS from the
 * browser, and validation failures render inline instead of in an alert().
 */

import { useState } from "react";
import { bookingEndpoint } from "@/lib/api";
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

const inputClasses = "w-full p-2 border border-gray-300 rounded-md";

function FieldError({ message }: { message?: string }) {
  if (!message) { return null; }
  return <p role="alert" className="mt-1 text-sm text-red-600">{message}</p>;
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
      <div className="md:w-2/3 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Request received</h2>
        <p className="text-gray-700">
          Thank you, {submitState.name}! Your appointment request has been received.
          A confirmation email with the dates you offered is on its way, and
          I&apos;ll be in touch to lock one in.
        </p>
        <button
          type="button"
          className="mt-6 text-white px-4 py-2 rounded-md bg-brand hover:bg-brand-dark transition-colors duration-300"
          onClick={() => setSubmitState({ status: "idle" })}
        >
          Book another appointment
        </button>
      </div>
    );
  }

  return (
    <div className="md:w-2/3 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Book an Appointment</h2>

      <form id="appointment-form" onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-600 mb-1">Name</label>
          <input
            type="text" id="name" name="name" className={inputClasses}
            maxLength={limits.name}
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
          <FieldError message={errors.name} />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-600 mb-1">Email</label>
          <input
            type="email" id="email" name="email" className={inputClasses}
            maxLength={limits.email}
            autoComplete="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">
            Your confirmation goes here.
          </p>
          <FieldError message={errors.email} />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-gray-600 mb-1">Phone Number</label>
          <input
            type="tel" id="phone" name="phone" className={inputClasses}
            maxLength={limits.phone}
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
          <FieldError message={errors.phone} />
        </div>

        {([1, 2, 3] as const).map((index) => {
          const dateKey = `date${index}` as "date1" | "date2" | "date3";
          const availabilityKey =
            `availability${index}` as "availability1" | "availability2" | "availability3";
          const optional = index > 1 ? " (Optional)" : "";

          return (
            <div className="mb-4" key={dateKey}>
              <label htmlFor={dateKey} className="block text-gray-600 mb-1">
                Preferred Date {index}{optional}
              </label>
              <input
                type="date" id={dateKey} name={dateKey} className={inputClasses}
                value={form[dateKey]}
                onChange={(event) => update(dateKey, event.target.value)}
              />
              <FieldError message={errors[dateKey]} />

              <label htmlFor={availabilityKey} className="block text-gray-600 mt-2">
                Availability
              </label>
              <textarea
                id={availabilityKey} name={availabilityKey} className={inputClasses}
                placeholder="Please describe your availability"
                maxLength={limits.availability}
                value={form[availabilityKey]}
                onChange={(event) => update(availabilityKey, event.target.value)}
              />
              <FieldError message={errors[availabilityKey]} />
            </div>
          );
        })}

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-600 mb-1">
            Description of Haircut / Other Comments
          </label>
          <textarea
            id="description" name="description" className={inputClasses}
            maxLength={limits.description}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
          <FieldError message={errors.description} />
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox" name="policiesAccepted" className="form-checkbox text-gray-600"
              checked={form.policiesAccepted}
              onChange={(event) => update("policiesAccepted", event.target.checked)}
            />
            <span className="ml-2 text-gray-600">I accept the booking policies</span>
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
          <p role="alert" className="mb-4 text-sm text-red-600">{submitState.message}</p>
        )}

        <button
          type="submit"
          disabled={submitState.status === "sending"}
          className="text-white px-4 py-2 rounded-md bg-brand hover:bg-brand-dark transition-colors duration-300 disabled:opacity-60"
        >
          {submitState.status === "sending" ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
