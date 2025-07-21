import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NavBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for user menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openUserMenu = Boolean(anchorEl);

  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate("/login");
  };

  const userMenu = (
    <Menu
      anchorEl={anchorEl}
      open={openUserMenu}
      onClose={handleUserMenuClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem
        onClick={() => {
          navigate("/profile");
          handleUserMenuClose();
        }}
      >
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        Profile
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Neighbor Alert
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/dashboard">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        {isAuthenticated && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profile">
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        {!isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/login">
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              Neighbor Alert
            </Link>
          </Typography>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
            </Box>
          )}

          {isAuthenticated ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                sx={{ ml: 1 }}
                component={Link}
                to="/dashboard"
              >
                <NotificationsIcon />
              </IconButton>
              <IconButton onClick={handleUserMenuOpen} sx={{ ml: 1 }}>
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "primary.dark" }}
                  src={user?.avatar}
                >
                  {!user?.avatar && (user?.name?.charAt(0) || "?")}
                </Avatar>
              </IconButton>
              {userMenu}
            </Box>
          ) : (
            <Button
              color="inherit"
              component={Link}
              to="/login"
              startIcon={<PersonIcon />}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default NavBar;
