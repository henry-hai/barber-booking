import React from "react";
import Button from "@mui/material/Button";
import EmailIcon from "@mui/icons-material/Email";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

/* Mailroom sub-toolbar: just the primary actions, right-aligned. The shop
   wordmark and view toggle live in the AppShell app bar above this. */
const Toolbar = ({ state }: { state: any }) => (
  <div className="toolbarActions">
    <Button variant="contained" color="primary" size="small"
      startIcon={ <EmailIcon /> }
      style={{ marginRight: 10 }}
      onClick={ () => state.showComposeMessage("new") }>
      New Message
    </Button>
    <Button variant="contained" color="primary" size="small"
      startIcon={ <PersonAddIcon /> }
      onClick={ state.showAddContact }>
      New Contact
    </Button>
  </div>
);

export default Toolbar;