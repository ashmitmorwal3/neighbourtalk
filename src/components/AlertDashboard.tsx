import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  CircularProgress,
  Button,
  Alert as MuiAlert,
  Snackbar,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { fetchAlerts, fetchNearbyAlerts } from "../api/alertApi";
import { Alert as AlertType } from "../types/Alert";
import AlertList from "./AlertList";
import AlertForm from "./AlertForm";
import Notifications from "./Notifications";
import { useLocation } from "../context/LocationContext";

const AlertDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPromptOpen, setLocationPromptOpen] = useState<boolean>(false);
  const { userLocation, isLocating, locationError } = useLocation();

  const loadAlerts = async () => {
    try {
      setLoading(true);

      // If we have user location, fetch nearby alerts
      if (userLocation) {
        try {
          const data = await fetchNearbyAlerts(
            userLocation.lat,
            userLocation.lng,
            10
          );
          setAlerts(data);
        } catch (error) {
          console.error(
            "Error fetching nearby alerts, falling back to all alerts"
          );
          const data = await fetchAlerts();
          setAlerts(data);
        }
      } else {
        // Otherwise fetch all alerts
        const data = await fetchAlerts();
        setAlerts(data);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load alerts. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    // Prompt for location if not available
    if (!userLocation && !isLocating && !locationError) {
      setLocationPromptOpen(true);
    }
  }, [userLocation, isLocating, locationError]);

  const handleAlertAdded = (newAlert: AlertType) => {
    setAlerts([newAlert, ...alerts]);
  };

  const handleAlertDeleted = (id: string) => {
    setAlerts(alerts.filter((alert) => alert._id !== id));
  };

  const handleRefreshAlerts = () => {
    setRefreshing(true);
    loadAlerts();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <NotificationsActiveIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Neighbor Alert System
          </Typography>

          {/* Notifications component */}
          <Notifications />

          <Button
            color="inherit"
            onClick={handleRefreshAlerts}
            startIcon={<MyLocationIcon />}
            disabled={refreshing}
            sx={{ ml: 1 }}
          >
            {refreshing ? "Refreshing..." : "Nearby Alerts"}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Location permission snackbar */}
      <Snackbar
        open={locationPromptOpen}
        autoHideDuration={10000}
        onClose={() => setLocationPromptOpen(false)}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="info"
          onClose={() => setLocationPromptOpen(false)}
        >
          Please allow location access to see alerts in your area
        </MuiAlert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Post New Alert
            </Typography>
            <AlertForm onAlertAdded={handleAlertAdded} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">
                {userLocation ? "Alerts Near You" : "Recent Alerts"}
              </Typography>
              {userLocation && (
                <Typography variant="body2" color="text.secondary">
                  Showing alerts near your location
                </Typography>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <AlertList alerts={alerts} onAlertDeleted={handleAlertDeleted} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlertDashboard;
