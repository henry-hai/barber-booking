import axios, { AxiosResponse } from "axios";
import { config } from "./config";

/* One preferred slot a client offered when requesting a booking. */
export interface IPreferredSlot { date: string, availability: string }

/* A booking request as returned by the server's /appointments endpoint
   (sourced from the Google Sheet the n8n Barber Log workflow writes to). */
export interface IBookingRequest {
  name: string,
  submittedDate: string,
  submittedTime: string,
  phone: string,
  preferred: IPreferredSlot[],
  notes: string
}

export class Worker {

  /* Gets all booking requests from the server (newest first). Guards against
     a non-array response so the dashboard never crashes on an error. */
  public async listAppointments(): Promise<IBookingRequest[]> {
    const response: AxiosResponse = await axios.get(
      `${config.serverAddress}/appointments`
    );
    return Array.isArray(response.data) ? response.data : [];
  }

}