import React, { useEffect } from "react";
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AlertDashboard from "./components/AlertDashboard";
import { LocationProvider } from "./context/LocationContext";
import { AuthProvider } from "./context/AuthContext";
import AuthContainer from "./components/auth/AuthContainer";
import UserProfile from "./components/user/UserProfile";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import NavBar from "./components/layout/NavBar";
import { initAuthToken } from "./api/authApi";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: "#f44336",
    },
  },
});

function App() {
  // Initialize auth token on app load
  useEffect(() => {
    initAuthToken();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LocationProvider>
          <Router>
            <NavBar />
            <Container maxWidth="lg" sx={{ mt: 2 }}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<AuthContainer />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<AlertDashboard />} />
                  <Route path="/profile" element={<UserProfile />} />
                </Route>

                {/* Redirect to dashboard if logged in, otherwise to login */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </Container>
          </Router>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
