/*
 * Entry point for the Express server. Sets up middleware and
 * defines all REST endpoints. Each endpoint instantiates the
 * appropriate Worker and delegates the real work to it.
 * Start the server: node dist/main.js
 */

import path from "path";                                              // Node built-in: constructs file paths
import express, { Express, NextFunction, Request, Response } from "express"; // Express app and its TypeScript types
import { serverInfo } from "./ServerInfo";                            // parsed Gmail credentials
import * as IMAP from "./IMAP";                                       // IMAP Worker + interfaces
import * as SMTP from "./SMTP";                                       // SMTP Worker
import * as Contacts from "./contacts";                               // Contacts Worker
import { IContact } from "./contacts";                                // IContact type used in endpoint handlers
import * as Appointments from "./Appointments";                       // Appointments Worker (Google Sheets)
import * as Booking from "./Booking";                                 // Booking handler (validation, rate limits, the two emails)

const app: Express = express();                                       // creates the Express application instance

/* Trust one layer of reverse proxy so req.ip is the caller's address rather
   than the proxy's. The booking rate limiter keys off it. */
app.set("trust proxy", 1);

/* Cap the request body. The booking endpoint's own field limits add up to a
   few KB; anything near this is not a real booking. */
app.use(express.json({ limit: "64kb" }));                             // parses incoming JSON request bodies into JS objects

app.use("/",
  express.static(path.join(__dirname, "../../client/dist"))
);

/* CORS middleware: runs on every request before any endpoint handler.
   Sets headers that tell the browser to allow cross-origin requests. */
app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction) {
  inResponse.header("Access-Control-Allow-Origin", "*");             // allow requests from any origin
  inResponse.header("Access-Control-Allow-Methods",                  // allow these HTTP methods
    "GET,POST,DELETE,OPTIONS"
  );
  inResponse.header("Access-Control-Allow-Headers",                  // allow these request headers
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  inNext();                                                           // passes control to the next middleware or endpoint
});

/* GET /mailboxes
   Returns a JSON array of all mailbox names and paths in the account. */
app.get("/mailboxes", async (inRequest: Request, inResponse: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);     // instantiate IMAP Worker with Gmail credentials
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes(); // fetch flat list of mailboxes
    inResponse.json(mailboxes);                                       // send result as JSON
  } catch (inError) {
    inResponse.send("error");                                         // send plain text error if anything fails
  }
});

/* GET /mailboxes/:mailbox
   Returns a JSON array of message headers for all messages in the named mailbox. */
app.get("/mailboxes/:mailbox", async (inRequest: Request, inResponse: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const messages: IMAP.IMessage[] = await imapWorker.listMessages({
      mailbox: inRequest.params.mailbox as string                      // :mailbox from the URL becomes a string parameter; cast needed for Express 5
    });
    inResponse.json(messages);
  } catch (inError) {
    inResponse.send("error");
  }
});

/* GET /messages/:mailbox/:id
   Returns the plain text body of a specific message. */
app.get("/messages/:mailbox/:id", async (inRequest: Request, inResponse: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const messageBody: string = await imapWorker.getMessageBody({
      mailbox: inRequest.params.mailbox as string,
      id: parseInt(inRequest.params.id as string, 10)                // parseInt converts the URL string param to a whole number
    });
    inResponse.send(messageBody);                                     // send as plain text, not JSON
  } catch (inError) {
    inResponse.send("error");
  }
});

/* DELETE /messages/:mailbox/:id
   Deletes a specific message from the named mailbox. */
app.delete("/messages/:mailbox/:id", async (inRequest: Request, inResponse: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    await imapWorker.deleteMessage({
      mailbox: inRequest.params.mailbox as string,
      id: parseInt(inRequest.params.id as string, 10)                // convert string param to number for IMAP Worker
    });
    inResponse.send("ok");
  } catch (inError) {
    inResponse.send("error");
  }
});

/* POST /messages
   Sends an email. Request body must contain to, from, subject, text.
   express.json() middleware already parsed the body into inRequest.body. */
app.post("/messages", async (inRequest: Request, inResponse: Response) => {
  try {
    const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);     // instantiate SMTP Worker with Gmail credentials
    await smtpWorker.sendMessage(inRequest.body);                     // pass the parsed request body directly to nodemailer
    inResponse.send("ok");
  } catch (inError) {
    inResponse.send("error");
  }
});

/* POST /booking
   Public endpoint behind the appointment form on the marketing site. Validates
   every field, rate limits by IP, then sends the owner notification (which the
   n8n Barber Log workflow parses into the Google Sheet) and a confirmation to
   the client. The handler is built in Booking.ts so the end-to-end tests can
   mount the same one with a recording mailer. */
app.post("/booking", Booking.createBookingHandler(serverInfo));

/* GET /appointments
   Returns a JSON array of booking requests from the Google Sheet that the
   n8n Barber Log workflow writes to. Returns [] if sheets is unconfigured. */
app.get("/appointments", async (inRequest: Request, inResponse: Response) => {
  try {
    const appointmentsWorker: Appointments.Worker =
      new Appointments.Worker(serverInfo);
    const appointments: Appointments.IBookingRequest[] =
      await appointmentsWorker.listAppointments();
    inResponse.json(appointments);
  } catch (inError) {
    console.error("GET /appointments error:", inError);
    inResponse.status(500).json([]);
  }
});

/* GET /contacts
   Returns a JSON array of all saved contacts. */
app.get("/contacts", async (inRequest: Request, inResponse: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();   // no serverInfo needed; contacts are stored locally
    const contacts: IContact[] = await contactsWorker.listContacts();
    inResponse.json(contacts);
  } catch (inError) {
    inResponse.send("error");
  }
});

/* POST /contacts
   Adds a new contact. Returns the saved contact including its auto-generated _id. */
app.post("/contacts", async (inRequest: Request, inResponse: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    const contact: IContact = await contactsWorker.addContact(inRequest.body); // body contains name and email
    inResponse.json(contact);                                         // return saved contact with _id so client can display it
  } catch (inError) {
    console.error("POST /contacts error:", inError);
    inResponse.send("error");
  }
});

/* DELETE /contacts/:id
   Deletes a contact by its NeDB-generated _id. */
app.delete("/contacts/:id", async (inRequest: Request, inResponse: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    await contactsWorker.deleteContact(inRequest.params.id as string); // :id from the URL is the NeDB _id string
    inResponse.send("ok");
  } catch (inError) {
    inResponse.send("error");
  }
});

app.listen(8080, () => {                                              // starts the server on port 8080
  console.log("Server listening on port 8080");
});
