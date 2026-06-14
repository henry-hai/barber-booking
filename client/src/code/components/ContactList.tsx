import React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Person from "@mui/icons-material/Person";

/* Renders a clickable row for each contact in state.contacts.
   Each item shows a Person avatar and the contact's name; clicking it calls
   showContact() to display the contact in the center view. */
const ContactList = ({ state }: { state: any }) => (
  <React.Fragment>
    <div className="panelHeading">Contacts</div>
    { state.contacts.length === 0 &&
      <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 6px" }}>
        No contacts yet.
      </p>
    }
    <List disablePadding>
      { state.contacts.map((value: any) => (
        <ListItemButton key={ value._id } sx={{ borderRadius: 1 }}
          onClick={ () => state.showContact(value._id, value.name, value.email) }>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: "#00b9ff" }}><Person /></Avatar>
          </ListItemAvatar>
          <ListItemText primary={ value.name } />
        </ListItemButton>
      )) }
    </List>
  </React.Fragment>
);

export default ContactList;