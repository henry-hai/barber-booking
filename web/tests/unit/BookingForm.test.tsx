import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingForm from "@/components/BookingForm";

/* Fills every required field. Returns the values used so tests can assert on
   what should have been posted. */
async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  const values = {
    name: "Jordan Reyes",
    email: "jordan@example.com",
    phone: "(408) 555-0147",
    date1: "2026-08-05",
    availability1: "After 4pm",
    description: "Mid fade, scissor top"
  };

  await user.type(screen.getByLabelText("Name"), values.name);
  await user.type(screen.getByLabelText("Email"), values.email);
  await user.type(screen.getByLabelText("Phone Number"), values.phone);
  await user.type(screen.getByLabelText("Preferred Date 1"), values.date1);
  await user.type(screen.getAllByLabelText("Availability")[0], values.availability1);
  await user.type(
    screen.getByLabelText("Description of Haircut / Other Comments"),
    values.description
  );
  await user.click(screen.getByLabelText("I accept the booking policies"));

  return values;
}

const submit = async (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: "Submit" }));

describe("BookingForm", () => {

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
    ));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders all three preferred date slots", () => {
    render(<BookingForm />);
    expect(screen.getByLabelText("Preferred Date 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred Date 2 (Optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred Date 3 (Optional)")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Availability")).toHaveLength(3);
  });

  it("shows inline errors and sends nothing when the form is empty", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    await submit(user);

    expect(await screen.findByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Please accept the booking policies.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("clears a field's error once it is corrected", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    await submit(user);
    expect(await screen.findByText("Please enter your name.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "Jordan");
    await waitFor(() =>
      expect(screen.queryByText("Please enter your name.")).not.toBeInTheDocument()
    );
  });

  it("rejects an invalid email without sending", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    await fillRequiredFields(user);
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await submit(user);

    expect(await screen.findByText("Please enter a valid email address."))
      .toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts the booking and confirms on success", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    const values = await fillRequiredFields(user);
    await submit(user);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toMatch(/\/booking$/);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      name: values.name,
      email: values.email,
      phone: values.phone,
      date1: values.date1,
      availability1: values.availability1,
      description: values.description,
      policiesAccepted: true
    });
    /* Untouched optional slots go out empty, not as "N/A" -- the server owns
       that substitution, so the sheet convention lives in exactly one place. */
    expect(body.date2).toBe("");
    expect(body.availability2).toBe("");
    expect(body.website).toBe("");

    expect(await screen.findByText("Request received")).toBeInTheDocument();
    expect(screen.getByText(/Thank you, Jordan Reyes/)).toBeInTheDocument();
  });

  it("includes the honeypot field, hidden from users", () => {
    render(<BookingForm />);
    const honeypot = screen.getByLabelText("Website");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot.closest("div")).toHaveAttribute("aria-hidden", "true");
  });

  it("surfaces the server's message when the request is rejected", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          ok: false,
          message: "Too many booking requests. Please try again shortly."
        })
      })
    ));

    const user = userEvent.setup();
    render(<BookingForm />);
    await fillRequiredFields(user);
    await submit(user);

    expect(await screen.findByText("Too many booking requests. Please try again shortly."))
      .toBeInTheDocument();
    expect(screen.queryByText("Request received")).not.toBeInTheDocument();
  });

  it("surfaces a network failure without losing the form", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network down"))));

    const user = userEvent.setup();
    render(<BookingForm />);
    await fillRequiredFields(user);
    await submit(user);

    expect(await screen.findByText("Network down")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Jordan Reyes");
  });

});
