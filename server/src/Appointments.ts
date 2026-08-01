/*
 * Reads booking requests from the Google Sheet that the n8n "Barber Log"
 * workflow appends to (Gmail booking email -> JS transform -> Sheets append).
 * Authenticates with a read-only service account and normalizes each row
 * into a structured IBookingRequest for the dashboard.
 */

import path from "path";
import { google } from "googleapis";
import { IServerInfo } from "./ServerInfo";

/* A single preferred slot the client offered (one of up to three). */
export interface IPreferredSlot { date: string, availability: string }

/* One booking request, normalized from a sheet row. */
export interface IBookingRequest {
  name: string,
  submittedDate: string,
  submittedTime: string,
  phone: string,
  preferred: IPreferredSlot[],
  notes: string,
  /* Column L, appended after A..K were already in use. Rows written before it
     existed have nothing there, so this is "" for them rather than missing. */
  email: string
}

/* Service account key file. Gitignored; the user drops their downloaded
   key here. Resolved relative to server/ (one level up from dist/). */
const KEY_PATH = path.join(__dirname, "../serviceAccount.json");

/* Trims a cell and treats the workflow's "N/A" placeholder as empty. */
const clean = (value: any): string => {
  const s = (value === undefined || value === null) ? "" : String(value).trim();
  return s === "N/A" ? "" : s;
};

export class Worker {

  private static serverInfo: IServerInfo;

  constructor(inServerInfo: IServerInfo) {
    Worker.serverInfo = inServerInfo;
  }

  /* Fetches all booking requests from the configured sheet, newest first.
     Returns [] if no sheets config is present or the sheet is empty. */
  public async listAppointments(): Promise<IBookingRequest[]> {
    const sheetsConfig = Worker.serverInfo.sheets;
    if (!sheetsConfig || !sheetsConfig.spreadsheetId) { return []; }

    /* Service-account auth, read-only scope. */
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetsConfig.spreadsheetId,
      range: sheetsConfig.range
    });

    const rows: any[][] = response.data.values || [];
    if (rows.length <= 1) { return []; }

    /* Row 0 is the header; map the rest by the fixed 12-column order the
       Barber Log workflow writes (A..L). Sheets truncates trailing empty
       cells, so a row written before column L existed simply has no index 11
       and clean() turns that into "". */
    const requests: IBookingRequest[] = rows.slice(1).map((row) => {
      const preferred: IPreferredSlot[] = [
        { date: clean(row[4]), availability: clean(row[5]) },
        { date: clean(row[6]), availability: clean(row[7]) },
        { date: clean(row[8]), availability: clean(row[9]) }
      ].filter((slot) => slot.date !== "" || slot.availability !== "");

      return {
        name: clean(row[0]),
        submittedDate: clean(row[1]),
        submittedTime: clean(row[2]),
        phone: clean(row[3]),
        preferred: preferred,
        notes: clean(row[10]),
        email: clean(row[11])
      };
    });

    /* Sheet rows are appended oldest-first; reverse so newest shows on top. */
    return requests.reverse();
  }

}