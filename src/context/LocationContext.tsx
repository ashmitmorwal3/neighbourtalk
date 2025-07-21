import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { Alert } from "../types/Alert";
import { useAuth } from "./AuthContext";
import { Button, Box, Typography } from "@mui/material";

const SOCKET_SERVER_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

interface LocationContextProps {
  userLocation: { lat: number; lng: number } | null;
  isLocating: boolean;
  locationError: string | null;
  socket: Socket | null;
  notifications: Alert[];
  clearNotification: (id: string) => void;
  retryLocationAccess: () => void;
}

const LocationContext = createContext<LocationContextProps>({
  userLocation: null,
  isLocating: false,
  locationError: null,
  socket: null,
  notifications: [],
  clearNotification: () => {},
  retryLocationAccess: () => {},
});

export const useLocation = () => useContext(LocationContext);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Alert[]>([]);

  // Get user's location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    // Try to load cached location from localStorage first
    const cachedLocation = localStorage.getItem("userLocation");
    if (cachedLocation) {
      try {
        const parsedLocation = JSON.parse(cachedLocation);
        if (parsedLocation && parsedLocation.lat && parsedLocation.lng) {
          setUserLocation(parsedLocation);
        }
      } catch (e) {
        console.error("Error parsing cached location:", e);
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userCoords);
        setIsLocating(false);
        setLocationError(null);

        // Save to localStorage
        localStorage.setItem("userLocation", JSON.stringify(userCoords));

        // If socket is available, send location to server
        if (socket && isAuthenticated && user) {
          // Send authenticated user info with location
          socket.emit("user_join", {
            userId: user.id,
            userName: user.name,
            location: userCoords,
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to retrieve your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please try again later.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. Please check your connection and try again.";
            break;
          default:
            errorMessage = `Geolocation error: ${error.message}`;
        }

        setLocationError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Allow cached position for 1 minute
      }
    );
  }, [socket, isAuthenticated, user]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Get location on initial load
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Set up a watcher to track location changes
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const updatedCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(updatedCoords);
        setLocationError(null);

        // Save to localStorage
        localStorage.setItem("userLocation", JSON.stringify(updatedCoords));

        // Send updated location to server
        if (socket && isAuthenticated) {
          socket.emit("update_location", {
            userId: user?.id,
            location: updatedCoords,
          });
        }
      },
      (error) => {
        console.error("Error watching location:", error);
        // Don't set error here to avoid duplicate errors
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, isAuthenticated, user]);

  // Listen for alert notifications
  useEffect(() => {
    if (!socket) return;

    socket.on("alert_notification", (alert: Alert) => {
      // Add notification
      setNotifications((prevNotifications) => [...prevNotifications, alert]);

      // Show browser notification if supported
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("New Neighborhood Alert", {
            body: `${alert.title} - ${alert.location}`,
            icon: "/logo192.png", // Add your app icon path
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("New Neighborhood Alert", {
                body: `${alert.title} - ${alert.location}`,
                icon: "/logo192.png", // Add your app icon path
              });
            }
          });
        }
      }
    });

    return () => {
      socket.off("alert_notification");
    };
  }, [socket]);

  // Update user data in socket when authentication state changes
  useEffect(() => {
    if (socket && userLocation) {
      if (isAuthenticated && user) {
        // Re-emit join event when user logs in
        socket.emit("user_join", {
          userId: user.id,
          userName: user.name,
          location: userLocation,
        });
      }
    }
  }, [isAuthenticated, user, socket, userLocation]);

  const clearNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification._id !== id)
    );
  };

  const retryLocationAccess = () => {
    getUserLocation();
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        isLocating,
        locationError,
        socket,
        notifications,
        clearNotification,
        retryLocationAccess,
      }}
    >
      {locationError && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "#ffebee",
            borderRadius: 1,
            border: "1px solid #ffcdd2",
          }}
        >
          <Typography color="error">{locationError}</Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
            This application requires location access to show alerts in your
            area.
          </Typography>
          <Button
            variant="contained"
            onClick={retryLocationAccess}
            disabled={isLocating}
          >
            {isLocating ? "Getting Location..." : "Enable Location Access"}
          </Button>
        </Box>
      )}
      {children}
    </LocationContext.Provider>
  );
};
