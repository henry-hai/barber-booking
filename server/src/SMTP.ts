/*
 * Handles outbound email via Gmail's SMTP server using nodemailer.
 * Exports a Worker class with a sendMessage() method.
 */

/* nodemailer imports:
   - Mail: type for a nodemailer transport object.
   - SendMailOptions: describes a message (to, from, subject, text).
   - SentMessageInfo: response object returned after sending. */
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import * as nodemailer from "nodemailer";
import { SendMailOptions, SentMessageInfo } from "nodemailer";

/* IServerInfo provides the SMTP connection credentials from ServerInfo.ts. */
import { IServerInfo } from "./ServerInfo";

/* Worker class instantiated by main.ts to send email. */
export class Worker {

  /* Static field holds the server config for the lifetime of the class.
     Static belongs to class itself rather than any one instance. */
  private static serverInfo: IServerInfo;

  /* Receives server credentials and stores them in the static field. */
  constructor(inServerInfo: IServerInfo) {
    Worker.serverInfo = inServerInfo;
  }

  /* Sends an email using the SMTP credentials from serverInfo.
     inOptions must contain to, from, subject, and text fields.
     Returns Promise<string> so main.ts can call it with async/await.
     nodemailer's API is callback-based, so it is wrapped in a Promise
     to make it compatible with async/await. */
  public sendMessage(inOptions: SendMailOptions):
    Promise<string> {
    return new Promise((inResolve, inReject) => {

      /* Creates a transport - an active connection to the SMTP server.
         Passes the smtp block from serverInfo (host, port, auth).

         family: 4 forces IPv4. smtp.gmail.com resolves to both A and AAAA
         records, and Node will happily pick the IPv6 one. Render's containers
         have no IPv6 route, so that attempt fails with ENETUNREACH and the
         booking request hangs until the connection times out. Locally the same
         code works, because a normal machine can reach both. Pinning to IPv4
         is the smallest fix that behaves the same on every host. */
      /* Cast because nodemailer's Options type does not declare `family`,
         though it forwards it straight to net.connect, where it is honoured.
         The alternative, setting a process-wide DNS result order, would reach
         further than this one connection needs to. */
      const options = {
        ...Worker.serverInfo.smtp,
        family: 4,
        /* Fail in seconds rather than minutes if the connection cannot be
           made. A booking that cannot send should return an error to the
           form, not leave the visitor watching a spinner. */
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
      } as SMTPTransport.Options;

      const transport: Mail = nodemailer.createTransport(options);

      // Sends the email. Callback receives either an Error or success info.
      transport.sendMail(inOptions,
        (inError: Error | null, inInfo: SentMessageInfo) => {
          if (inError) {
            inReject(inError);
          } else {
            inResolve("");
          }
        }
      );
    });
  }

}
