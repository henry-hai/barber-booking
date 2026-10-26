import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import * as Contacts from "../Contacts";

/*
 * The contacts list: everyone saved, a row to add one, a button to remove one.
 *
 * The mail client this list belonged to is unwired, but the contacts
 * themselves outlived it and the API still serves them, so the dashboard
 * shows them here. Deliberately plain: name, email, add, delete.
 */
const ContactsPanel = () => {
  const [contacts, setContacts] = useState<Contacts.IContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const worker = new Contacts.Worker();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await worker.listContacts();
        if (active) { setContacts(list); }
      } catch {
        if (active) { setError("Could not load contacts."); }
      } finally {
        if (active) { setLoading(false); }
      }
    })();
    return () => { active = false; };
  }, []);

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) { return; }
    setSaving(true);
    try {
      const saved = await worker.addContact({ name: name.trim(), email: email.trim() });
      setContacts((current) => [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setEmail("");
    } catch {
      setError("Could not save that contact.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string | undefined) => {
    if (!id) { return; }
    try {
      await worker.deleteContact(id);
      setContacts((current) => current.filter((contact) => contact._id !== id));
    } catch {
      setError("Could not delete that contact.");
    }
  };

  if (loading) {
    return <div className="dashboard"><div className="emptyState"><CircularProgress /></div></div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashTitle">Contacts</h1>

      <form className="contactForm" onSubmit={ add }>
        <TextField
          id="newContactName" label="Name" size="small" value={ name }
          onChange={ (event) => setName(event.target.value) }
        />
        <TextField
          id="newContactEmail" label="Email" type="email" size="small" value={ email }
          onChange={ (event) => setEmail(event.target.value) }
        />
        <Button type="submit" variant="contained" disableElevation disabled={ saving }>
          Add
        </Button>
      </form>

      { error && <div className="emptyState"><p>{ error }</p></div> }

      { !error && contacts.length === 0 &&
        <div className="emptyState">
          <PersonIcon className="emptyIcon" />
          <h2>No contacts yet</h2>
          <p>Add one above.</p>
        </div>
      }

      { contacts.length > 0 &&
        <div className="reqList">
          { contacts.map((contact) => (
            <div className="reqCard contactRow" key={ contact._id }>
              <div>
                <div className="reqName">{ contact.name }</div>
                <div className="reqPhone">
                  <EmailIcon fontSize="inherit" style={{ marginRight: 6 }} />
                  <a href={ `mailto:${contact.email}` }>{ contact.email }</a>
                </div>
              </div>
              <Button
                size="small" color="inherit" startIcon={ <DeleteOutlineIcon /> }
                aria-label={ `Delete ${contact.name}` }
                onClick={ () => remove(contact._id) }
              >
                Delete
              </Button>
            </div>
          )) }
        </div>
      }
    </div>
  );
};

export default ContactsPanel;
