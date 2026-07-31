/*
 * Shape of a booking request and the client-side checks run before it is sent.
 *
 * These checks exist to give immediate feedback in the form. They are not a
 * security boundary -- the Express /booking endpoint validates every field
 * again on arrival and is the only validation that actually counts.
 */

export interface IBookingForm {
  name: string;
  email: string;
  phone: string;
  date1: string;
  availability1: string;
  date2: string;
  availability2: string;
  date3: string;
  availability3: string;
  description: string;
  policiesAccepted: boolean;
  /* Honeypot. Hidden from real users, so anything here came from a bot. The
     server answers 200 and silently drops the request when it is filled. */
  website: string;
}

export const emptyBookingForm: IBookingForm = {
  name: "",
  email: "",
  phone: "",
  date1: "",
  availability1: "",
  date2: "",
  availability2: "",
  date3: "",
  availability3: "",
  description: "",
  policiesAccepted: false,
  website: ""
};

/* Field-level limits, kept in sync with the server's own limits. */
export const limits = {
  name: 100,
  email: 254,
  phone: 32,
  availability: 500,
  description: 2000
} as const;

export type BookingErrors = Partial<Record<keyof IBookingForm, string>>;

/* A phone number is accepted if it carries at least 7 digits once formatting
   characters are stripped. Deliberately loose: clients type these by hand. */
export const countDigits = (value: string): number =>
  (value.match(/\d/g) ?? []).length;

/* Dates arrive from <input type="date"> as YYYY-MM-DD. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/* Matches the server's check: one @, something either side, a dot in the
   domain, no whitespace. Anything stricter rejects valid addresses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBookingForm(form: IBookingForm): BookingErrors {
  const errors: BookingErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const description = form.description.trim();

  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length > limits.name) {
    errors.name = `Please keep your name under ${limits.name} characters.`;
  }

  if (!email) {
    errors.email = "Please enter an email address so I can send your confirmation.";
  } else if (email.length > limits.email || !EMAIL.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!phone) {
    errors.phone = "Please enter a phone number.";
  } else if (countDigits(phone) < 7) {
    errors.phone = "Please enter a phone number with at least 7 digits.";
  } else if (phone.length > limits.phone) {
    errors.phone = "That phone number looks too long.";
  }

  if (!form.date1) {
    errors.date1 = "Please choose a first preferred date.";
  } else if (!ISO_DATE.test(form.date1)) {
    errors.date1 = "Please choose a valid date.";
  }

  if (!form.availability1.trim()) {
    errors.availability1 = "Please describe your availability for the first date.";
  }

  /* Dates 2 and 3 are optional, but an availability note without a date (or a
     date without a note) would reach the sheet half-filled, so pair them up. */
  for (const index of [2, 3] as const) {
    const dateKey = `date${index}` as "date2" | "date3";
    const availabilityKey = `availability${index}` as "availability2" | "availability3";
    const date = form[dateKey];
    const availability = form[availabilityKey].trim();

    if (date && !ISO_DATE.test(date)) {
      errors[dateKey] = "Please choose a valid date.";
    }
    if (availability && !date) {
      errors[dateKey] = `Please choose preferred date ${index} to go with this availability.`;
    }
    if (date && !availability) {
      errors[availabilityKey] = `Please describe your availability for date ${index}.`;
    }
  }

  for (const key of ["availability1", "availability2", "availability3"] as const) {
    if (form[key].trim().length > limits.availability) {
      errors[key] = `Please keep this under ${limits.availability} characters.`;
    }
  }

  if (!description) {
    errors.description = "Please describe the haircut you would like.";
  } else if (description.length > limits.description) {
    errors.description = `Please keep this under ${limits.description} characters.`;
  }

  if (!form.policiesAccepted) {
    errors.policiesAccepted = "Please accept the booking policies.";
  }

  return errors;
}

export const isValidBookingForm = (form: IBookingForm): boolean =>
  Object.keys(validateBookingForm(form)).length === 0;
