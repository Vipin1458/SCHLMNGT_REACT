import { useEffect, useState } from "react";
import axiosPrivate from "../api/axiosPrivate";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
} from "@mui/material";
import {
  Edit as EditIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';

export default function ProfilePage() {
  const { auth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosPrivate.get("/api/student/profile");
        setProfile(res.data);
      } catch (err) {
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.user?.role === "student") {
      fetchProfile();
    }
  }, [auth]);

  const handleEditOpen = () => {
    setEditFormData({
      first_name: profile.user.first_name,
      last_name: profile.user.last_name,
      email: profile.user.email,
      phone_number: profile.phone_number,
    });
    setEditOpen(true);
  };

  const handleProfileUpdate = async () => {
    try {
      const updateData = {
        user: {
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          email: editFormData.email,
        },
        phone_number: editFormData.phone_number,
      };

      const res = await axiosPrivate.patch("/api/student/profile/update/", updateData);
      setProfile((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          ...updateData.user
        },
        phone_number: updateData.phone_number,
      }));
      setEditOpen(false);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4, ml: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <Typography>No profile found.</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BadgeIcon sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {profile.user.first_name} {profile.user.last_name}
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Roll Number</Typography>
            <Typography variant="body1">{profile.roll_number}</Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Class</Typography>
            <Typography variant="body1">{profile.class_name}</Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Phone</Typography>
            <Typography variant="body1">
              <PhoneIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              {profile.phone_number}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body1">
              <EmailIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              {profile.user.email}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Assigned Teacher</Typography>
            <Typography variant="body1">
              {profile.assigned_teacher_name || 'Not Assigned'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={profile.status === 1 ? 'Active' : 'Inactive'}
              color={profile.status === 1 ? 'success' : 'default'}
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditOpen}
            >
              Edit Profile
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.first_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, first_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editFormData.last_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editFormData.phone_number}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleProfileUpdate} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
