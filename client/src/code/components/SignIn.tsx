import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { saveCredentials } from "../api";

/*
 * The dashboard's own sign-in, used only when the API is on another origin.
 *
 * Same origin, the browser's basic-auth prompt covers the whole app and this
 * never renders. Cross origin, the browser will not send those credentials
 * to the API, so the app collects them here and api.ts sends them itself.
 * Nothing is checked locally: the first request to the API is the check, and
 * a 401 brings this form straight back with a message.
 */
interface ISignInProps {
  message?: string;
  onSignedIn: () => void;
}

const SignIn = ({ message, onSignedIn }: ISignInProps) => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !password) { return; }
    saveCredentials({ user, password });
    onSignedIn();
  };

  return (
    <div className="signIn">
      <form className="signInCard" onSubmit={ submit }>
        <h1 className="dashTitle">Sign in</h1>
        { message && <p className="signInMessage">{ message }</p> }
        <TextField
          id="dashboardUser" label="User" size="small" fullWidth margin="dense"
          autoComplete="username" value={ user }
          onChange={ (event) => setUser(event.target.value) }
        />
        <TextField
          id="dashboardPassword" label="Password" type="password" size="small" fullWidth margin="dense"
          autoComplete="current-password" value={ password }
          onChange={ (event) => setPassword(event.target.value) }
        />
        <Button type="submit" variant="contained" disableElevation fullWidth style={{ marginTop: 12 }}>
          Open the dashboard
        </Button>
      </form>
    </div>
  );
};

export default SignIn;
