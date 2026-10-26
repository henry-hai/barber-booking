import { AxiosResponse } from "axios";
import { api } from "./api";

export interface IContact {
  _id?: string,
  name: string,
  email: string
}

export class Worker {

  /* Fetches all contacts from the server. */
  public async listContacts(): Promise<IContact[]> {
    const response: AxiosResponse = await api.get("/contacts");
    return Array.isArray(response.data) ? response.data : [];
  }

  /* Posts a new contact to the server and returns the saved object with _id. */
  public async addContact(inContact: IContact): Promise<IContact> {
    const response: AxiosResponse = await api.post("/contacts", inContact);
    return response.data;
  }

  /* Sends a DELETE request for a specific contact by its _id. */
  public async deleteContact(inID: string | null | undefined): Promise<void> {
    await api.delete(`/contacts/${inID}`);
  }

}
