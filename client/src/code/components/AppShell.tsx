import React, { useEffect, useState } from "react";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ContactsIcon from "@mui/icons-material/Contacts";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ContactsPanel from "./ContactsPanel";
import Dashboard from "./Dashboard";
import SignIn from "./SignIn";
import { UNAUTHORIZED_EVENT, crossOrigin, loadCredentials } from "../api";

/* Top-level shell: a branded app bar over the appointments dashboard and the
 * contacts list.
 *
 * This app used to carry a Gmail mail client behind a Dashboard/Mailroom
 * toggle in the bar below. The dashboard is the piece that earns its keep
 * day to day, so that toggle went. Contacts came back as a tab of their own
 * once the API started serving them from DynamoDB.
 *
 * The mail client itself has not been deleted. BaseLayout and the Toolbar,
 * MailboxList, MessageList, MessageView, ContactList and ContactView
 * components are all still in this directory, as are their IMAP and SMTP
 * modules and the Express endpoints behind them. Nothing here imports
 * BaseLayout, which is what makes the mail client unreachable: webpack
 * follows imports, so it drops out of the bundle rather than shipping as
 * dead weight behind a hidden route. Restoring it is the reverse: import
 * BaseLayout and put the view state and the nav button back.
 *
 * Sign-in only appears when the API is on another origin. See api.ts.
 */
type View = "appointments" | "contacts";

const AppShell = () => {
  const [view, setView] = useState<View>("appointments");
  const [signedIn, setSignedIn] = useState<boolean>(!crossOrigin() || loadCredentials() !== null);
  const [signInMessage, setSignInMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const onUnauthorized = () => {
      setSignInMessage("Those details were not accepted. Please try again.");
      setSignedIn(false);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const tab = (target: View, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      className={ `navTab${view === target ? " active" : ""}` }
      aria-current={ view === target ? "page" : undefined }
      onClick={ () => setView(target) }
    >
      { icon } { label }
    </button>
  );

  return (
    <div className="appShell">
      <div className="appBar">
        {/* Shop wordmark. */}
        <div className="brand">
          <ContentCutIcon style={{ color: "#00b9ff" }} />
          <span className="brand-name">Henry Hai's Barbershop</span>
        </div>

        <nav className="appNav">
          { tab("appointments", "Appointments", <DashboardIcon fontSize="small" />) }
          { tab("contacts", "Contacts", <ContactsIcon fontSize="small" />) }
        </nav>
      </div>

      <div className="appBody">
        { !signedIn && <SignIn message={ signInMessage } onSignedIn={ () => setSignedIn(true) } /> }
        {/* Keyed on the view so each panel fetches afresh when switched to. */}
        { signedIn && view === "appointments" && <Dashboard key="appointments" /> }
        { signedIn && view === "contacts" && <ContactsPanel key="contacts" /> }
      </div>
    </div>
  );
};

export default AppShell;
