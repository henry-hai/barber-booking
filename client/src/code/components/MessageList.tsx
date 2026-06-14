import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

/* Formats an ISO date string for the list. Falls back gracefully if the
   envelope had no parseable date. */
const formatDate = (raw: string): string => {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
};

/* Renders a table of messages in the selected mailbox (newest first).
   Clicking a row calls showMessage(), which fetches and displays the body.
   Shows a prompt when no mailbox is selected and an empty notice when the
   selected mailbox has no messages. */
const MessageList = ({ state }: { state: any }) => {

  if (!state.currentMailbox) {
    return (
      <div className="emptyState" style={{ padding: 24 }}>
        <p>Select a mailbox to view its messages.</p>
      </div>
    );
  }

  if (state.messages.length === 0) {
    return (
      <div className="emptyState" style={{ padding: 24 }}>
        <p>No messages in this mailbox.</p>
      </div>
    );
  }

  return (
    <Table stickyHeader padding="none">
      <TableHead>
        <TableRow>
          <TableCell style={{ width: 110, fontWeight: 700 }}>Date</TableCell>
          <TableCell style={{ width: 280, fontWeight: 700 }}>From</TableCell>
          <TableCell style={{ fontWeight: 700 }}>Subject</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        { state.messages.map((message: any) => {
          const selected: boolean = state.messageID === message.id &&
            state.currentView === "message";
          return (
            <TableRow key={ message.id }
              className={ `messageRow${selected ? " selected" : ""}` }
              onClick={ () => state.showMessage(message) }>
              <TableCell>{ formatDate(message.date) }</TableCell>
              <TableCell>{ message.from }</TableCell>
              <TableCell>{ message.subject }</TableCell>
            </TableRow>
          );
        }) }
      </TableBody>
    </Table>
  );
};

export default MessageList;