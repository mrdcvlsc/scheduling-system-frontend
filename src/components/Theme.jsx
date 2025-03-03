import { createTheme } from "@mui/material/styles";

const someTheme = createTheme({
  palette: {
    mode: "dark", // Dark theme for a sleek look
    primary: {
      main: "#4A90E2", // Modern blue for primary actions
    },
    secondary: {
      main: "#A259FF", // Purple accent for highlights
    },
    background: {
      default: "#121212", // Dark background for contrast
      paper: "#1E1E1E", // Slightly lighter for cards and elements
    },
    text: {
      primary: "#E0E0E0", // Light gray for readability
      secondary: "#B0B0B0", // Softer gray for less important text
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif", // Clean and modern font
    h1: { fontSize: "2.2rem", fontWeight: 600 },
    h2: { fontSize: "1.8rem", fontWeight: 500 },
    h3: { fontSize: "1.5rem", fontWeight: 500 },
    button: { textTransform: "none", fontWeight: 600 }, // No all-caps for a cleaner look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px", // Rounded buttons for a modern feel
          boxShadow: "0px 4px 10px rgba(0,0,0,0.2)", // Subtle shadow for depth
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "16px",
          backgroundColor: "#1E1E1E", // Matches paper background
          boxShadow: "0px 4px 20px rgba(0,0,0,0.3)",
        },
      },
    },
  },
});

export default someTheme;
