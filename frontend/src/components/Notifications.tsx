import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Badge,
  Drawer,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Alert } from "../types/Alert";
import { useLocation } from "../context/LocationContext";

interface NotificationsProps {
  onAlertSelect?: (alert: Alert) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onAlertSelect }) => {
  const { notifications, clearNotification } = useLocation();
  const [open, setOpen] = React.useState(false);

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

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleNotificationClick = (notification: Alert) => {
    if (onAlertSelect) {
      onAlertSelect(notification);
    }
    setOpen(false);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={toggleDrawer(true)}
        aria-label="notifications"
        sx={{ mr: 2 }}
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 300, p: 2 }} role="presentation">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Recent Alerts</Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          {notifications.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}
            >
              No new alerts in your area
            </Typography>
          ) : (
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id || index}>
                  <ListItem
                    alignItems="flex-start"
                    component="div"
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleNotificationClick(notification)}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (notification._id) {
                            clearNotification(notification._id);
                          }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle1" component="div">
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.severity}
                            color={
                              getSeverityColor(notification.severity) as
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
                            variant="body2"
                            component="span"
                            color="text.primary"
                          >
                            {notification.location}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {notification.description.substring(0, 50)}
                            {notification.description.length > 50 ? "..." : ""}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Notifications;
