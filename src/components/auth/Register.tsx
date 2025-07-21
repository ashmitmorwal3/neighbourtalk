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

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phoneNumber: "",
  });
  const [formError, setFormError] = useState("");
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate form
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setFormError("Name, email and password are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = formData;

    try {
      const success = await register(registerData);

      if (success) {
        console.log("Registration successful, redirecting to dashboard");
        navigate("/dashboard");
      } else {
        // If register returned false but didn't throw an error
        setFormError(
          "Registration failed. Please check your information and try again."
        );
      }
    } catch (err: any) {
      console.error("Registration error in component:", err);
      setFormError(err.message || "Registration failed");
    }
  };

  const handleSwitchToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    onSwitchToLogin();
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Create a Neighbor Alert Account
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Full Name"
              variant="outlined"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email Address"
              variant="outlined"
              fullWidth
              required
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="password"
              label="Password"
              variant="outlined"
              fullWidth
              required
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              variant="outlined"
              fullWidth
              required
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="address"
              label="Address"
              variant="outlined"
              fullWidth
              value={formData.address}
              onChange={handleChange}
              helperText="Optional: For local area alerts"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="phoneNumber"
              label="Phone Number"
              variant="outlined"
              fullWidth
              value={formData.phoneNumber}
              onChange={handleChange}
              helperText="Optional: For emergency contact"
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign Up
        </Button>

        <Grid container justifyContent="center">
          <Grid item>
            <Button
              variant="text"
              size="small"
              onClick={handleSwitchToLogin}
              sx={{ textTransform: "none" }}
            >
              Already have an account? Sign In
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

export default Register;
