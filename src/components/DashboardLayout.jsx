import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Stack
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Assignment as ExamIcon,
  Logout as LogoutIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  PersonOutline as ProfileIcon,
  Group as GroupIcon,
  AddBox as AddBoxIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 240;

export default function DashboardLayout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6">School App</Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/dashboard">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>

        {auth?.user?.role === "admin" && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard/teachers">
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="All Teachers" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
             <ListItemButton component={Link} to="/dashboard/students">
  <ListItemIcon><PersonIcon /></ListItemIcon>
  <ListItemText primary="All Students" />
</ListItemButton>

            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard/exams">
                <ListItemIcon><AssignmentIcon /></ListItemIcon>
                <ListItemText primary="Exams" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {auth?.user?.role === "teacher" && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard/teacher/profile">
                <ListItemIcon><ProfileIcon /></ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard/mystudents">
                <ListItemIcon><GroupIcon /></ListItemIcon>
                <ListItemText primary="My Students" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard/teacher/exams">
                <ListItemIcon><CheckCircleIcon /></ListItemIcon>
                <ListItemText primary="All Exams" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/dashboard/exams/create">
                <ListItemIcon><AddBoxIcon /></ListItemIcon>
                <ListItemText primary="Create Exam" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top Navbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Welcome, {auth?.user?.username}
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar (Drawer) */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="sidebar folders">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Page Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
