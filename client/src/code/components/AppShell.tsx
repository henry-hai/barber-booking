import React, { useState } from "react";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MailIcon from "@mui/icons-material/Mail";
import Dashboard from "./Dashboard";
import BaseLayout from "./BaseLayout";

type View = "dashboard" | "mailroom";

/* Top-level shell: a branded app bar with a Dashboard/Mailroom toggle, and a
   body that swaps between the appointments dashboard and the mail client. */
const AppShell = () => {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="appShell">
      <div className="appBar">
        {/* Shop wordmark. */}
        <div className="brand">
          <ContentCutIcon style={{ color: "#00b9ff" }} />
          <span className="brand-name">Henry Hai's Barbershop</span>
        </div>

        {/* View toggle. */}
        <nav className="appNav">
          <button
            className={ `navTab${view === "dashboard" ? " active" : ""}` }
            onClick={ () => setView("dashboard") }>
            <DashboardIcon fontSize="small" /> Dashboard
          </button>
          <button
            className={ `navTab${view === "mailroom" ? " active" : ""}` }
            onClick={ () => setView("mailroom") }>
            <MailIcon fontSize="small" /> Mailroom
          </button>
        </nav>
      </div>

      <div className="appBody">
        { view === "dashboard" ? <Dashboard /> : <BaseLayout /> }
      </div>
    </div>
  );
};

export default AppShell;