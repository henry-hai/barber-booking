import React from "react";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Dashboard from "./Dashboard";

/* Top-level shell: a branded app bar over the appointments dashboard.
 *
 * This app used to carry a second view, a Gmail mail client, behind a
 * Dashboard/Mailroom toggle in the bar below. The dashboard is the piece that
 * earns its keep day to day, and it is the only one worth exposing on a
 * deployed host, so the toggle is gone and the dashboard renders directly.
 *
 * The mail client itself has not been deleted. BaseLayout and the Toolbar,
 * MailboxList, MessageList, MessageView, ContactList and ContactView
 * components are all still in this directory, as are their IMAP, SMTP and
 * Contacts API modules and the Express endpoints behind them. Nothing here
 * imports BaseLayout any more, which is what makes the mail client
 * unreachable: webpack follows imports, so it drops out of the bundle rather
 * than shipping as dead weight behind a hidden route.
 *
 * Restoring it is the reverse of this commit: import BaseLayout, put the view
 * state and the second nav button back.
 */
const AppShell = () => (
  <div className="appShell">
    <div className="appBar">
      {/* Shop wordmark. */}
      <div className="brand">
        <ContentCutIcon style={{ color: "#00b9ff" }} />
        <span className="brand-name">Henry Hai's Barbershop</span>
      </div>

      {/* One destination, so this reads as a title rather than a control. */}
      <nav className="appNav">
        <span className="navTab active">
          <DashboardIcon fontSize="small" /> Appointments
        </span>
      </nav>
    </div>

    <div className="appBody">
      <Dashboard />
    </div>
  </div>
);

export default AppShell;
