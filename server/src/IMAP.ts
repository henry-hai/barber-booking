/*
 * Handles inbound email via Gmail's IMAP server using imapflow,
 * a modern, maintained, promise-based IMAP client with proper TLS.
 * Exports three interfaces and a Worker class with four methods:
 * listMailboxes(), listMessages(), getMessageBody(), deleteMessage().
 */

/* imapflow is the IMAP client. simpleParser (mailparser) turns a raw
   RFC822 message buffer into structured fields (subject, from, text...). */
import { ImapFlow } from "imapflow";
import { ParsedMail, simpleParser } from "mailparser";

/* IServerInfo provides the IMAP connection credentials from ServerInfo.ts. */
import { IServerInfo } from "./ServerInfo";

/* Only the most recent messages are fetched per mailbox. Fetching every
   message ("1:*") on a real Gmail account pulls thousands of envelopes and
   makes the UI hang -- this cap keeps the message list fast and responsive. */
const MAX_MESSAGES = 50;

/* ICallOptions is passed to listMessages(), getMessageBody(), deleteMessage().
   mailbox is always required. id is the message UID, only needed when
   targeting a specific message. */
export interface ICallOptions {
  mailbox: string,
  id?: number
}

/* IMessage describes a single email entry.
   body is optional -- listMessages() omits it to save bandwidth.
   getMessageBody() returns it separately on demand. */
export interface IMessage {
  id: string, date: string,
  from: string,
  subject: string, body?: string
}

/* IMailbox describes a mailbox/folder entry.
   name is the display label, path is the identifier used in IMAP calls. */
export interface IMailbox { name: string, path: string }

/* Worker class instantiated by main.ts for all IMAP operations. */
export class Worker {

  /* Static field holds the server config for the lifetime of the class. */
  private static serverInfo: IServerInfo;

  constructor(inServerInfo: IServerInfo) {
    Worker.serverInfo = inServerInfo;
  }

  /* Creates and connects an ImapFlow client. Called internally by all four
     Worker methods. imapflow validates Gmail's TLS certificate by default,
     so no global certificate-verification override is needed.
     logger: false suppresses imapflow's verbose connection logging. */
  private async connectToServer(): Promise<ImapFlow> {
    const client: ImapFlow = new ImapFlow({
      host: Worker.serverInfo.imap.host,
      port: Worker.serverInfo.imap.port,
      secure: true,
      auth: {
        user: Worker.serverInfo.imap.auth.user,
        pass: Worker.serverInfo.imap.auth.pass
      },
      logger: false
    });
    await client.connect();
    return client;
  }

  /* Returns a flat array of all selectable mailboxes in the account.
     imapflow's list() already returns a flat array of mailbox objects.
     Mailboxes flagged "\Noselect" (e.g. Gmail's "[Gmail]" container) are
     namespace parents that hold no messages and cannot be opened, so they
     are filtered out -- clicking one would otherwise error. */
  public async listMailboxes(): Promise<IMailbox[]> {
    const client: ImapFlow = await this.connectToServer();
    try {
      const list = await client.list();
      return list
        .filter((mb) => !(mb.flags && mb.flags.has("\\Noselect")))
        .map((mb) => ({ name: mb.name, path: mb.path }));
    } finally {
      await client.logout();
    }
  }

  /* Returns message headers for the newest MAX_MESSAGES messages in the
     specified mailbox, newest first. A mailbox lock guarantees exclusive
     access while fetching. Returns an empty array for an empty mailbox. */
  public async listMessages(inCallOptions: ICallOptions): Promise<IMessage[]> {
    const client: ImapFlow = await this.connectToServer();
    try {
      const lock = await client.getMailboxLock(inCallOptions.mailbox);
      try {
        const total: number =
          typeof client.mailbox === "object" ? client.mailbox.exists : 0;
        if (total === 0) { return []; }

        /* Fetch by sequence number: from the newest MAX_MESSAGES up to the
           last message. "*" is the highest sequence number in the mailbox. */
        const start: number = Math.max(1, total - MAX_MESSAGES + 1);
        const finalMessages: IMessage[] = [];
        for await (const msg of client.fetch(`${start}:*`,
          { uid: true, envelope: true })) {
          const envelope = msg.envelope;
          if (!envelope) { continue; }
          const from = envelope.from && envelope.from[0];
          finalMessages.push({
            id: String(msg.uid),
            date: envelope.date ? envelope.date.toISOString() : "",
            from: from ? (from.address || from.name || "") : "",
            subject: envelope.subject || "(no subject)"
          });
        }
        /* fetch() yields oldest-first; reverse so newest appears at the top. */
        return finalMessages.reverse();
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  /* Retrieves the full plain-text body of a specific message by UID.
     { uid: true } tells imapflow the id is a unique identifier, not a
     sequence position. simpleParser extracts the plain text body. */
  public async getMessageBody(inCallOptions: ICallOptions): Promise<string> {
    const client: ImapFlow = await this.connectToServer();
    try {
      const lock = await client.getMailboxLock(inCallOptions.mailbox);
      try {
        const message = await client.fetchOne(String(inCallOptions.id),
          { source: true }, { uid: true });
        if (!message || !message.source) { return ""; }
        const parsed: ParsedMail = await simpleParser(message.source);
        return parsed.text || "";
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  /* Deletes a specific message by UID from the specified mailbox.
     { uid: true } identifies the message by unique id, not position. */
  public async deleteMessage(inCallOptions: ICallOptions): Promise<void> {
    const client: ImapFlow = await this.connectToServer();
    try {
      const lock = await client.getMailboxLock(inCallOptions.mailbox);
      try {
        await client.messageDelete(String(inCallOptions.id), { uid: true });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

}