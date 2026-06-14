import React from "react";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

/* Branded empty state shown in the center area before a message is opened. */
const WelcomeView = () => (
  <div className="emptyState">
    <MarkEmailReadIcon className="emptyIcon" />
    <h2>Welcome to the Mailroom</h2>
    <p>Pick a mailbox and open a message, or start a new one from the top bar.</p>
  </div>
);

export default WelcomeView;