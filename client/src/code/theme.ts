import { createTheme } from "@mui/material/styles";

/* Shared MUI theme for the mail client. Colors and typography mirror the
   public barbershop site (cyan accent #00b9ff on a charcoal/white base,
   Montserrat headings) so the portal reads as part of the same brand. */
export const theme = createTheme({
  palette: {
    primary: { main: "#00b9ff", dark: "#009ed9", contrastText: "#ffffff" },
    secondary: { main: "#1f2937" },
    background: { default: "#f3f4f6", paper: "#ffffff" },
    text: { primary: "#1f2937", secondary: "#6b7280" }
  },
  typography: {
    fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif",
    button: { textTransform: "none", fontWeight: 700 }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } }
  }
});