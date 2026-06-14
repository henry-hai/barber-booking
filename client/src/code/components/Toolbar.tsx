import React from "react";
import Button from "@mui/material/Button";
import EmailIcon from "@mui/icons-material/Email";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ContentCutIcon from "@mui/icons-material/ContentCut";

/* Functional component: no state or lifecycle needed.
   Renders the branded wordmark on the left and the primary actions on the
   right. The parent .toolbar div lays these two groups out with space-between. */
const Toolbar = ({ state }: { state: any }) => (
  <React.Fragment>
    {/* Shop wordmark. ContentCut (scissors) ties it to the barbershop brand. */}
    <div className="brand">
      <ContentCutIcon style={{ color: "#00b9ff" }} />
      <span className="brand-name">Henry Hai's Barbershop</span>
      <span className="brand-tag">Mailroom</span>
    </div>

    {/* Primary actions. */}
    <div>
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
  </React.Fragment>
);

export default Toolbar;