/*
 * The A..L sheet contract, tested end to end.
 *
 * This reads the jsCode out of the committed n8n workflow export and runs it,
 * unmodified, against notification bodies this server actually produces. It is
 * the closest thing to running the pipeline without touching Gmail or Sheets:
 * if the email format and the workflow ever drift apart, this fails.
 *
 * server/src/Appointments.ts reads the resulting row back, so the assertions
 * here about column order and the "N/A" convention are what keep the dashboard
 * working.
 */

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildBookingPayload } from "../src/Booking";
import { renderOwnerNotification } from "../src/BookingEmails";
import {
  COLUMN_KEYS,
  SUBMITTED_AT,
  SUBMITTED_DATE_LA,
  SUBMITTED_TIME_LA,
  singleSlotBooking,
  validBooking
} from "./fixtures";

const WORKFLOW_PATH = path.join(__dirname, "../../automation/Barber_Log.json");

interface IWorkflowNode {
  type: string;
  parameters: { jsCode?: string, columns?: { value?: Record<string, string> } };
}

const workflow = JSON.parse(fs.readFileSync(WORKFLOW_PATH, "utf8")) as {
  nodes: IWorkflowNode[]
};

const codeNode = workflow.nodes.find((node) => node.type === "n8n-nodes-base.code");
const sheetsNode = workflow.nodes.find((node) => node.type === "n8n-nodes-base.googleSheets");

/* Runs the workflow's Code node body the way n8n does: as a function whose only
   free variable is $json, returning one object per item. */
function runCodeNode(json: { text: string, date: string }): Record<string, string> {
  const jsCode = codeNode?.parameters.jsCode;
  if (jsCode === undefined) { throw new Error("No Code node in the workflow export"); }
  return new Function("$json", jsCode)(json) as Record<string, string>;
}

/* An email as the Gmail node would hand it over: decoded plain-text part plus
   the message's received date. */
function notificationFor(booking = validBooking) {
  const payload = buildBookingPayload(booking, SUBMITTED_AT);
  const email = renderOwnerNotification(payload, "jordan@example.com");
  return { payload, email, gmail: { text: email.text, date: SUBMITTED_AT.toISOString() } };
}

describe("n8n workflow export", () => {

  it("still has the four nodes wired Gmail -> get -> code -> sheets", () => {
    expect(workflow.nodes).toHaveLength(4);
    expect(codeNode).toBeDefined();
    expect(sheetsNode).toBeDefined();
  });

  it("maps exactly twelve sheet columns", () => {
    expect(Object.keys(sheetsNode?.parameters.columns?.value ?? {})).toHaveLength(12);
  });

  it("parses with one JSON.parse and no label anchors", () => {
    /* Comments stripped first: they mention the old anchors by name while
       explaining why they are gone. */
    const code = (codeNode?.parameters.jsCode ?? "")
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("//"))
      .join("\n");

    expect(code.match(/JSON\.parse\(/g)).toHaveLength(1);
    for (const anchor of ["Phone #", "Preferred Date", "Availability for Date", "Best wishes"]) {
      expect(code).not.toContain(anchor);
    }
  });

  it("keeps the America/Los_Angeles timestamp formatting", () => {
    expect(codeNode?.parameters.jsCode).toContain("America/Los_Angeles");
  });

});

describe("the Code node against real notification emails", () => {

  it("produces the twelve columns in A..L order", () => {
    const row = runCodeNode(notificationFor().gmail);
    expect(Object.keys(row)).toEqual(COLUMN_KEYS);
  });

  it("produces a row identical to the payload the server sent", () => {
    const { payload, gmail } = notificationFor();
    expect(runCodeNode(gmail)).toEqual(payload);
  });

  it("carries the America/Los_Angeles timestamp into columns B and C", () => {
    const row = runCodeNode(notificationFor().gmail);
    expect(row.date).toBe(SUBMITTED_DATE_LA);
    expect(row.time).toBe(SUBMITTED_TIME_LA);
  });

  it("keeps N/A for slots the client skipped", () => {
    const { payload, gmail } = notificationFor(singleSlotBooking);
    const row = runCodeNode(gmail);
    expect(row).toEqual(payload);
    expect([row.date2, row.avail2, row.date3, row.avail3])
      .toEqual(["N/A", "N/A", "N/A", "N/A"]);
  });

  it("handles text that would have broken the old label parser", () => {
    const { payload, gmail } = notificationFor({
      ...validBooking,
      name: 'Renée "Ren" O\'Brien-Smith',
      availability1: "Phone #: 555, Preferred Date 1: whenever",
      description: "Skin fade <no eyebrows> & a line-up\nSecond line. Best wishes"
    });
    expect(runCodeNode(gmail)).toEqual(payload);
  });

  it("handles a maximum-length description", () => {
    const { payload, gmail } = notificationFor({
      ...validBooking, description: "A ".repeat(999) + "end"
    });
    expect(runCodeNode(gmail)).toEqual(payload);
  });

  it("falls back to the email's received date when the payload has no timestamp", () => {
    /* Guards the path for any sender that predates the server-side timestamp. */
    const legacy = JSON.stringify({
      name: "Old Sender", phone: "408-555-0000",
      date1: "2026-08-05", avail1: "Afternoon",
      date2: "N/A", avail2: "N/A", date3: "N/A", avail3: "N/A",
      description: "Fade"
    }, null, 2);

    const row = runCodeNode({
      text: `---BOOKING_JSON_START---\n${legacy}\n---BOOKING_JSON_END---`,
      date: SUBMITTED_AT.toISOString()
    });

    expect(row.date).toBe(SUBMITTED_DATE_LA);
    expect(row.time).toBe(SUBMITTED_TIME_LA);
    expect(Object.keys(row)).toEqual(COLUMN_KEYS);
  });

  it("fails loudly on an email with no sentinel block", () => {
    /* Better a failed execution n8n surfaces than a garbage row in the sheet. */
    expect(() => runCodeNode({
      text: "Just a normal email, nothing to see.",
      date: SUBMITTED_AT.toISOString()
    })).toThrow(/BOOKING_JSON_START/);
  });

  it("fails loudly on a truncated block rather than parsing what follows", () => {
    const { email } = notificationFor();
    const truncated =
      `${email.text.split("---BOOKING_JSON_END---")[0]}\n\nSignature text.`;
    expect(() => runCodeNode({ text: truncated, date: SUBMITTED_AT.toISOString() }))
      .toThrow(/BOOKING_JSON_END/);
  });

  it("keeps the subject prefix the Gmail trigger filters on", () => {
    const { email } = notificationFor();
    expect(email.subject.startsWith("Appointment Request from")).toBe(true);
  });

});

/*
 * The range Appointments.ts asks Google for has to reach the last column the
 * workflow writes. This is here because getting it wrong fails silently:
 * requesting A:K from a sheet holding twelve columns returns eleven, the
 * reader finds nothing at row[11], and the field never appears. No error, no
 * log line, nothing to search for. The email column shipped with the config
 * still pinned to A:K and looked, from the dashboard, exactly like a bug in
 * the code.
 */
describe("the configured sheet range", () => {

  /* "Sheet1!A:L" -> "L" */
  const endColumn = (range: string): string =>
    (range.split("!").pop() ?? "").split(":").pop() ?? "";

  const columnNumber = (letter: string): number =>
    letter.toUpperCase().charCodeAt(0) - 64;

  it("reaches at least as far right as the last column written", () => {
    const example = JSON.parse(fs.readFileSync(
      path.join(__dirname, "../serverInfo.example.json"), "utf8"
    ));

    const end = endColumn(example.sheets.range);
    expect(columnNumber(end)).toBeGreaterThanOrEqual(COLUMN_KEYS.length);
  });

  /* Guards the arithmetic above, so a broken helper cannot make the real
     assertion pass by accident. */
  it("reads the end column out of an A1 range", () => {
    expect(endColumn("Sheet1!A:L")).toBe("L");
    expect(columnNumber("A")).toBe(1);
    expect(columnNumber("L")).toBe(12);
  });

});
