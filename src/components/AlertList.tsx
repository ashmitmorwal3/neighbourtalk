import React, { useState } from "react";
import {
  List,
  ListItem,
  Divider,
  Typography,
  Box,
  Chip,
  IconButton,
  ListItemText,
  Paper,
  Tabs,
  Tab,
  Button,
  Avatar,
  Tooltip,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MapIcon from "@mui/icons-material/Map";
import ListIcon from "@mui/icons-material/List";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Alert } from "../types/Alert";
import { deleteAlert } from "../api/alertApi";
import MapView from "./MapView";
import { useLocation } from "../context/LocationContext";
import { useAuth } from "../context/AuthContext";

interface AlertListProps {
  alerts: Alert[];
  onAlertDeleted: (id: string) => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "High":
      return "error";
    case "Medium":
      return "warning";
    case "Low":
      return "success";
    default:
      return "default";
  }
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Function to calculate distance between two coordinates in kilometers
const calculateDistance = (
  coords1: { lat: number; lng: number },
  coords2: { lat: number; lng: number }
): number => {
  if (
    !coords1 ||
    !coords2 ||
    !coords1.lat ||
    !coords1.lng ||
    !coords2.lat ||
    !coords2.lng
  )
    return Infinity;

  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
  const dLon = ((coords2.lng - coords1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coords1.lat * Math.PI) / 180) *
      Math.cos((coords2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Return a minimum of 0.1 km to avoid "0.0 km away"
  return Math.max(distance, 0.1);
};

const AlertList: React.FC<AlertListProps> = ({ alerts, onAlertDeleted }) => {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { userLocation } = useLocation();
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDelete = async (id: string) => {
    try {
      console.log(`Deleting alert: ${id}`);
      await deleteAlert(id);
      onAlertDeleted(id);
      setSnackbar({
        open: true,
        message: "Alert deleted successfully",
        severity: "success",
      });
      // If deleted alert was selected, clear selection
      if (selectedAlert && selectedAlert._id === id) {
        setSelectedAlert(null);
      }
    } catch (error: any) {
      console.error("Failed to delete alert:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete alert. Please try again.",
        severity: "error",
      });
    }
  };

  const handleViewToggle = (
    event: React.SyntheticEvent,
    newValue: "list" | "map"
  ) => {
    setViewMode(newValue);
  };

  const handleAlertSelect = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  if (alerts.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="textSecondary">
          No alerts posted yet. Be the first to post an alert!
        </Typography>
      </Paper>
    );
  }

  // Sort alerts by distance from user if userLocation is available
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (!userLocation) return 0;

    const distanceA = calculateDistance(userLocation, a.coordinates);
    const distanceB = calculateDistance(userLocation, b.coordinates);

    return distanceA - distanceB;
  });

  // Check if the current user can delete an alert
  const canDeleteAlert = (alert: Alert) => {
    return user && alert.user === user.id;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewToggle}
          aria-label="alerts view mode"
        >
          <Tab icon={<ListIcon />} label="List" value="list" />
          <Tab icon={<MapIcon />} label="Map" value="map" />
        </Tabs>
      </Box>

      {viewMode === "map" ? (
        <Box>
          <MapView alerts={sortedAlerts} onAlertSelect={handleAlertSelect} />

          {/* Show selected alert details */}
          {selectedAlert && (
            <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6">{selectedAlert.title}</Typography>
                <Chip
                  label={selectedAlert.severity}
                  color={
                    getSeverityColor(selectedAlert.severity) as
                      | "error"
                      | "warning"
                      | "success"
                      | "default"
                  }
                />
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Location:</strong> {selectedAlert.location}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedAlert.description}
              </Typography>

              {/* Display alert creator information */}
              {selectedAlert.userName && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    sx={{
                      mr: 1,
                      width: 24,
                      height: 24,
                      bgcolor: "primary.main",
                    }}
                  >
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2">
                    Posted by: {selectedAlert.userName}
                    {selectedAlert.userContact && (
                      <Tooltip title={selectedAlert.userContact}>
                        <IconButton size="small">
                          <PhoneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Posted:{" "}
                  {selectedAlert.createdAt
                    ? formatDate(selectedAlert.createdAt)
                    : "Just now"}
                </Typography>
                {selectedAlert._id && canDeleteAlert(selectedAlert) && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      selectedAlert._id && handleDelete(selectedAlert._id)
                    }
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      ) : (
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {sortedAlerts.map((alert, index) => {
            // Calculate distance from user
            let distance: number | null = null;
            if (userLocation && alert.coordinates) {
              distance = calculateDistance(userLocation, alert.coordinates);
            }

            return (
              <React.Fragment key={alert._id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    canDeleteAlert(alert) && (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => alert._id && handleDelete(alert._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" component="div">
                          {alert.title}
                          {distance !== null && distance <= 5 && (
                            <Chip
                              label={`${
                                distance < 0.1
                                  ? "Nearby"
                                  : `${distance.toFixed(1)} km away`
                              }`}
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: "primary.light",
                                color: "white",
                              }}
                            />
                          )}
                        </Typography>
                        <Chip
                          label={alert.severity}
                          color={
                            getSeverityColor(alert.severity) as
                              | "error"
                              | "warning"
                              | "success"
                              | "default"
                          }
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {alert.location}
                        </Typography>
                        <Typography
                          component="div"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {alert.description}
                        </Typography>

                        {/* Display alert creator information */}
                        {alert.userName && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                mr: 1,
                                width: 24,
                                height: 24,
                                bgcolor: "primary.main",
                              }}
                            >
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              component="span"
                            >
                              {alert.userName}
                              {alert.userContact && (
                                <Tooltip title={alert.userContact}>
                                  <IconButton size="small">
                                    <PhoneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Typography>
                          </Box>
                        )}

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block" }}
                          component="span"
                        >
                          {alert.createdAt
                            ? formatDate(alert.createdAt)
                            : "Just now"}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < sortedAlerts.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default AlertList;
