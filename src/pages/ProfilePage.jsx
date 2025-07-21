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
} from "@mui/material";

export default function ProfilePage() {
  const { auth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosPrivate.get("/students/");
        setProfile(res.data[0]);
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

  if (loading) return <CircularProgress sx={{ mt: 4, ml: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <Typography>No profile found.</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Student Profile
          </Typography>
          <Typography><strong>Username:</strong> {profile.user.username}</Typography>
          <Typography><strong>Email:</strong> {profile.user.email}</Typography>
          <Typography><strong>Roll Number:</strong> {profile.roll_number}</Typography>
          <Typography><strong>Grade:</strong> {profile.grade}</Typography>
          <Typography><strong>Phone:</strong> {profile.phone_number}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
