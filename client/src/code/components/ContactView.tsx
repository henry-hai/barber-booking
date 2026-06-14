import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailIcon from "@mui/icons-material/Email";
import SaveIcon from "@mui/icons-material/Save";

/* Shows a contact for viewing or adding, inside a branded card.
   currentView "contact": fields disabled, with Delete and Send Email actions.
   currentView "contactAdd": fields editable, with a Save action. */
const ContactView = ({ state }: { state: any }) => {
  const viewing: boolean = state.currentView === "contact";

  return (
    <form className="viewCard" style={{ maxWidth: 560 }}>
      {/* Name: disabled when viewing an existing contact. */}
      <TextField margin="dense" id="contactName" label="Name" fullWidth
        value={ state.contactName || "" }
        variant="outlined"
        disabled={ viewing }
        InputProps={ viewing ? { className: "messageInfoField" } : undefined }
        onChange={ state.fieldChangeHandler } />

      {/* Email: same pattern as the name field. */}
      <TextField margin="dense" id="contactEmail" label="Email" fullWidth
        value={ state.contactEmail || "" }
        variant="outlined"
        disabled={ viewing }
        InputProps={ viewing ? { className: "messageInfoField" } : undefined }
        onChange={ state.fieldChangeHandler } />

      <div style={{ marginTop: 14 }}>
        {/* Save: only when adding a new contact. */}
        { state.currentView === "contactAdd" &&
          <Button variant="contained" color="primary"
            startIcon={ <SaveIcon /> }
            onClick={ state.saveContact }>
            Save
          </Button>
        }

        {/* Delete + Send Email: only when viewing an existing contact. */}
        { viewing &&
          <Button variant="contained" color="primary"
            startIcon={ <EmailIcon /> }
            style={{ marginRight: 10 }}
            onClick={ () => state.showComposeMessage("contact") }>
            Send Email
          </Button>
        }
        { viewing &&
          <Button variant="outlined" color="secondary"
            startIcon={ <DeleteIcon /> }
            onClick={ state.deleteContact }>
            Delete
          </Button>
        }
      </div>
    </form>
  );
};

export default ContactView;