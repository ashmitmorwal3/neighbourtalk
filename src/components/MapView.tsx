import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from "@react-google-maps/api";
import { Alert } from "../types/Alert";
import { useLocation } from "../context/LocationContext";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
} from "@mui/material";

// Use environment variable for Google Maps API key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";

const containerStyle = {
  width: "100%",
  height: "400px",
};

interface MapViewProps {
  alerts: Alert[];
  onAlertSelect?: (alert: Alert) => void;
}

const MapView: React.FC<MapViewProps> = ({ alerts, onAlertSelect }) => {
  const { userLocation, isLocating, locationError, retryLocationAccess } =
    useLocation();
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);

  useEffect(() => {
    // Check if Google Maps API key is missing
    if (!GOOGLE_MAPS_API_KEY) {
      setApiKeyError(true);
    }
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "High":
        return "#f44336";
      case "Medium":
        return "#ff9800";
      case "Low":
        return "#4caf50";
      default:
        return "#2196f3";
    }
  };

  // Default center if user location is not available
  const defaultCenter = { lat: 40.7128, lng: -74.006 }; // New York coordinates

  if (apiKeyError || loadError) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography color="error">
          {apiKeyError
            ? "Google Maps API key is missing. Please add it to your environment variables."
            : "Error loading Google Maps. Please try again later."}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Check the README.md file for instructions on obtaining and configuring
          a Google Maps API key.
        </Typography>
      </Paper>
    );
  }

  if (locationError) {
    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography color="error">{locationError}</Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          This application requires location access to show alerts in your area.
        </Typography>
        <Button variant="contained" onClick={retryLocationAccess}>
          Enable Location Access
        </Button>
      </Paper>
    );
  }

  if (isLocating || !isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading map...
        </Typography>
      </Box>
    );
  }

  // If we have alerts but no user location, center on the first alert's location
  const mapCenter =
    userLocation || (alerts.length > 0 ? alerts[0].coordinates : defaultCenter);

  return (
    <Box sx={{ mt: 2 }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: 0, // Makes it a simple circular marker
              fillColor: "#2196f3",
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 8,
            }}
            title="Your location"
          />
        )}

        {/* Alert markers */}
        {alerts.map((alert) => (
          <React.Fragment key={alert._id}>
            {alert.coordinates && (
              <>
                <Marker
                  position={alert.coordinates}
                  icon={{
                    path: 0, // Simple circular marker
                    fillColor: getSeverityColor(alert.severity),
                    fillOpacity: 1,
                    strokeWeight: 0,
                    scale: 8,
                  }}
                  title={alert.title}
                  onClick={() => onAlertSelect && onAlertSelect(alert)}
                />
                <Circle
                  center={alert.coordinates}
                  radius={alert.radius ? alert.radius * 1000 : 5000} // radius in meters
                  options={{
                    strokeColor: getSeverityColor(alert.severity),
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: getSeverityColor(alert.severity),
                    fillOpacity: 0.15,
                  }}
                />
              </>
            )}
          </React.Fragment>
        ))}
      </GoogleMap>
    </Box>
  );
};

export default MapView;
