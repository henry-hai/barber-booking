import React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ReplyIcon from "@mui/icons-material/Reply";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";

/* Shows a message (currentView "message") or compose screen (currentView "compose").
   When viewing: date and From are shown read-only with Reply and Delete actions.
   When composing: To and Subject are editable with a Send action. The whole form
   sits inside a branded card. */
const MessageView = ({ state }: { state: any }) => {
  const viewing: boolean = state.currentView === "message";
  const composing: boolean = state.currentView === "compose";

  return (
    <form className="viewCard">
      {/* Date: read-only, only shown when viewing a message. */}
      { viewing &&
        <TextField margin="dense" variant="outlined" fullWidth label="Date"
          value={ state.messageDate ? new Date(state.messageDate).toLocaleString() : "" }
          disabled
          InputProps={{ className: "messageInfoField" }} />
      }

      {/* From: read-only, only shown when viewing a message. */}
      { viewing &&
        <TextField margin="dense" variant="outlined" fullWidth label="From"
          value={ state.messageFrom || "" }
          disabled
          InputProps={{ className: "messageInfoField" }} />
      }

      {/* To: editable, only shown when composing. */}
      { composing &&
        <TextField margin="dense" id="messageTo" variant="outlined" fullWidth label="To"
          value={ state.messageTo || "" }
          onChange={ state.fieldChangeHandler } />
      }

      {/* Subject: editable when composing, read-only when viewing. */}
      <TextField margin="dense" id="messageSubject" label="Subject"
        variant="outlined" fullWidth
        value={ state.messageSubject || "" }
        disabled={ viewing }
        InputProps={ viewing ? { className: "messageInfoField" } : undefined }
        onChange={ state.fieldChangeHandler } />

      {/* Body: multiline. Editable when composing, read-only when viewing. */}
      <TextField margin="dense" id="messageBody" variant="outlined"
        fullWidth multiline rows={ 12 }
        value={ state.messageBody || "" }
        disabled={ viewing }
        InputProps={ viewing ? { className: "messageInfoField" } : undefined }
        onChange={ state.fieldChangeHandler } />

      <div style={{ marginTop: 14 }}>
        {/* Compose action. */}
        { composing &&
          <Button variant="contained" color="primary"
            startIcon={ <SendIcon /> }
            onClick={ state.sendMessage }>
            Send
          </Button>
        }

        {/* Viewing actions. */}
        { viewing &&
          <Button variant="contained" color="primary"
            startIcon={ <ReplyIcon /> }
            style={{ marginRight: 10 }}
            onClick={ () => state.showComposeMessage("reply") }>
            Reply
          </Button>
        }
        { viewing &&
          <Button variant="outlined" color="secondary"
            startIcon={ <DeleteIcon /> }
            onClick={ state.deleteMessage }>
            Delete
          </Button>
        }
      </div>
    </form>
  );
};

export default MessageView;