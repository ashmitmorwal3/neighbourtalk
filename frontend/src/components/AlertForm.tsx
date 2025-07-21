import React, { useState } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert as MuiAlert,
  SelectChangeEvent,
  Typography,
  Slider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { createAlert } from "../api/alertApi";
import { Alert } from "../types/Alert";
import { useLocation } from "../context/LocationContext";
import { useAuth } from "../context/AuthContext";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from "@react-google-maps/api";

// Use environment variable for Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

interface AlertFormProps {
  onAlertAdded: (alert: Alert) => void;
}

const initialFormState: Alert = {
  title: "",
  description: "",
  severity: "Medium",
  location: "",
  coordinates: { lat: 0, lng: 0 },
  radius: 5,
};

const AlertForm: React.FC<AlertFormProps> = ({ onAlertAdded }) => {
  const { userLocation, socket } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<Alert>({
    ...initialFormState,
    coordinates: userLocation || { lat: 0, lng: 0 },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  React.useEffect(() => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        coordinates: userLocation,
      }));
    }
  }, [userLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData({
      ...formData,
      severity: e.target.value as "Low" | "Medium" | "High",
    });
  };

  const handleRadiusChange = (event: Event, newValue: number | number[]) => {
    setFormData({
      ...formData,
      radius: newValue as number,
    });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newCoords = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setFormData({
        ...formData,
        coordinates: newCoords,
      });
    }
  };

  const handleLocationPickerClose = () => {
    setLocationPickerOpen(false);
  };

  const handleLocationPickerOpen = () => {
    setLocationPickerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!isAuthenticated || !user) {
      setError("You must be logged in to post alerts");
      setIsSubmitting(false);
      return;
    }

    try {
      // Submit alert with user information
      const alertData = {
        ...formData,
        // User info will be added by the server
      };

      const newAlert = await createAlert(alertData);
      onAlertAdded(newAlert);

      // Emit the alert to socket.io for real-time notifications
      if (socket) {
        socket.emit("new_alert", newAlert);
      }

      setFormData(initialFormState);
      setSuccess("Alert posted successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError("Failed to post alert. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {error && (
          <MuiAlert severity="error" sx={{ mb: 2 }}>
            {error}
          </MuiAlert>
        )}
        {success && (
          <MuiAlert severity="success" sx={{ mb: 2 }}>
            {success}
          </MuiAlert>
        )}

        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          multiline
          rows={4}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="severity-label">Severity</InputLabel>
          <Select
            labelId="severity-label"
            id="severity"
            value={formData.severity}
            label="Severity"
            onChange={handleSelectChange}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          margin="normal"
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleLocationPickerOpen}>
                <LocationOnIcon />
              </IconButton>
            ),
          }}
        />

        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography gutterBottom>
            Notification Radius (km): {formData.radius}
          </Typography>
          <Slider
            value={formData.radius}
            onChange={handleRadiusChange}
            aria-labelledby="radius-slider"
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        >
          {isSubmitting ? "Posting..." : "Post Alert"}
        </Button>
      </Box>

      {/* Location Picker Dialog */}
      <Dialog
        open={locationPickerOpen}
        onClose={handleLocationPickerClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Alert Location</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Click on the map to select the location for your alert.
          </Typography>

          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "400px" }}
              center={formData.coordinates}
              zoom={14}
              onClick={handleMapClick}
            >
              <Marker
                position={formData.coordinates}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    setFormData({
                      ...formData,
                      coordinates: {
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng(),
                      },
                    });
                  }
                }}
              />
              <Circle
                center={formData.coordinates}
                radius={(formData.radius || 5) * 1000} // Convert km to meters with default of 5
                options={{
                  strokeColor: "#2196f3",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: "#2196f3",
                  fillOpacity: 0.2,
                }}
              />
            </GoogleMap>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              Loading Map...
            </Box>
          )}

          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, color: "text.secondary" }}
          >
            Coordinates: {formData.coordinates.lat.toFixed(6)},{" "}
            {formData.coordinates.lng.toFixed(6)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLocationPickerClose}>Cancel</Button>
          <Button onClick={handleLocationPickerClose} color="primary">
            Confirm Location
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AlertForm;
