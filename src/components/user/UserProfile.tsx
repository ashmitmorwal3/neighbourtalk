import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { UserProfile as UserProfileType } from "../../api/authApi";

const UserProfile: React.FC = () => {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const [profileData, setProfileData] = useState<Partial<UserProfileType>>({
    name: "",
    email: "",
    bio: "",
    address: "",
    phoneNumber: "",
    notificationRadius: 5,
  });
  const [success, setSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        address: user.address || "",
        phoneNumber: user.phoneNumber || "",
        notificationRadius: user.notificationRadius || 5,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!profileData.name || !profileData.email) {
      setFormError("Name and email are required");
      return;
    }

    try {
      // Email cannot be changed, so we remove it from the update data
      const { email, ...updateData } = profileData;

      await updateProfile(updateData);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      setFormError("Failed to update profile");
    }
  };

  if (!user) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h5">Please log in to view your profile</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{ width: 80, height: 80, mr: 2, bgcolor: "primary.main" }}
            src={user.avatar}
          >
            {!user.avatar && <PersonIcon fontSize="large" />}
          </Avatar>
          <Box>
            <Typography variant="h4">{user.name}</Typography>
            <Typography variant="body1" color="textSecondary">
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {isEditing ? (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Full Name"
                  value={profileData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  value={profileData.email}
                  fullWidth
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="bio"
                  label="Bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="address"
                  label="Address"
                  value={profileData.address}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phoneNumber"
                  label="Phone Number"
                  value={profileData.phoneNumber}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="notificationRadius"
                  label="Notification Radius (km)"
                  type="number"
                  value={profileData.notificationRadius}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 1, max: 50 } }}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Bio
                </Typography>
                <Typography variant="body1">
                  {user.bio || "No bio provided"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Address
                </Typography>
                <Typography variant="body1">
                  {user.address || "No address provided"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">
                  {user.phoneNumber || "No phone number provided"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Notification Radius
                </Typography>
                <Typography variant="body1">
                  {user.notificationRadius || 5} km
                </Typography>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </Box>
        )}
      </Paper>

      {/* Success message */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>

      {/* Form error */}
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
    </Container>
  );
};

export default UserProfile;
