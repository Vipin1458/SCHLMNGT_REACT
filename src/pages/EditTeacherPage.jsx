import { useEffect, useState } from "react";
import {
  Container, Typography, TextField, Button, CircularProgress,
  Alert, Box
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axiosPrivate from "../api/axiosPrivate";

export default function EditTeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    subject_specialization: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

 
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await axiosPrivate.get(`/teachers/${id}/`);
        const t = res.data;
        setFormData({
  username: t.user.username || "",
  email: t.user.email || "",
  phone_number: t.phone_number || "",
  subject_specialization: t.subject_specialization || "",
});

      } catch (err) {
        setError("Failed to fetch teacher.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError("");

  const payload = {
    user: {
      username: formData.username,
      email: formData.email,
      role: "teacher", // optional, if backend infers this
    },
    phone_number: formData.phone_number,
    subject_specialization: formData.subject_specialization,
  };

  console.log("Submitting:", payload);

  try {
    await axiosPrivate.patch(`/teachers/${id}/`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    navigate("/dashboard/teachers");
 } catch (err) {
  const responseData = err.response?.data;
  if (responseData?.user?.username) {
    setError(responseData.user.username[0]); // show just the first message
  } else {
    setError("Failed to update teacher.");
  }
}

 finally {
    setSaving(false);
  }
};


  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>Edit Teacher</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <TextField
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          name="phone_number"
          label="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
        />
        <TextField
          name="subject_specialization"
          label="Subject Specialization"
          value={formData.subject_specialization}
          onChange={handleChange}
        />

        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Update"}
        </Button>
      </Box>
    </Container>
  );
}
