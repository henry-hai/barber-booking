import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "normalize.css";
import "../css/main.css";
import { theme } from "./theme";
import BaseLayout from "./components/BaseLayout";

/* normalize.css is imported first so its browser resets apply before main.css styles.
   ReactDOM.createRoot is the React 18 replacement for the textbook's ReactDOM.render().
   The whole app is wrapped in ThemeProvider so every MUI component inherits the
   barbershop brand theme; CssBaseline applies a consistent baseline reset.
   The startup data fetching (mailboxes and contacts) is handled inside
   BaseLayout.componentDidMount() rather than here, because React 18's
   createRoot().render() is asynchronous. */
const root = ReactDOM.createRoot(document.body as HTMLElement);
root.render(
  <ThemeProvider theme={ theme }>
    <CssBaseline />
    <BaseLayout />
  </ThemeProvider>
);