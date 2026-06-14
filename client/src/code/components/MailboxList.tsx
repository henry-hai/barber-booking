import React from "react";
import Chip from "@mui/material/Chip";

/* Renders a clickable Chip for each mailbox in state.mailboxes.
   The currently selected mailbox is filled with the brand color; the rest
   are outlined so the active folder stands out. */
const MailboxList = ({ state }: { state: any }) => (
  <React.Fragment>
    <div className="panelHeading">Mailboxes</div>
    { state.mailboxes.map((value: any) => {
      const selected: boolean = state.currentMailbox === value.path;
      return (
        <Chip key={ value.path }
          label={ value.name }
          onClick={ () => state.setCurrentMailbox(value.path) }
          color="primary"
          variant={ selected ? "filled" : "outlined" }
          style={{ width: "100%", marginBottom: 8, justifyContent: "flex-start" }}
        />
      );
    }) }
  </React.Fragment>
);

export default MailboxList;