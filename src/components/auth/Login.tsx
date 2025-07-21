import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim() || !password.trim()) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      // Error handling is done in AuthContext
    }
  };

  const handleSwitchToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    onSwitchToRegister();
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Log in to Neighbor Alert
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Email Address"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign In
        </Button>

        <Grid container justifyContent="center">
          <Grid item>
            <Button
              variant="text"
              size="small"
              onClick={handleSwitchToRegister}
              sx={{ textTransform: "none" }}
            >
              Don't have an account? Sign Up
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Form validation error */}
      <Snackbar
        open={!!formError}
        autoHideDuration={6000}
        onClose={() => setFormError("")}
      >
        <Alert severity="error">{formError}</Alert>
      </Snackbar>

      {/* Auth context error */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={clearError}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default Login;
