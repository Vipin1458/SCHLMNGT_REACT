import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import axiosPrivate from "../api/axiosPrivate";

export default function StudentEditDialog({ open, onClose, student, onUpdate }) {
  const [formData, setFormData] = useState({
    user: {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
    },
    roll_number: "",
    phone_number: "",
    grade: "",
    class_name: "",
    date_of_birth: "",
    admission_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (student) {
      setFormData({
        user: {
          first_name: student.user?.first_name || "",
          last_name: student.user?.last_name || "",
          email: student.user?.email || "",
          
        },
        roll_number: student.roll_number || "",
        phone_number: student.phone_number || "",
        grade: student.grade || "",
        class_name: student.class_name || "",
        date_of_birth: student.date_of_birth || "",
        admission_date: student.admission_date || "",
      });
    }
  }, [student]);

  const handleChange = (field, value, isUserField = false) => {
    if (isUserField) {
      setFormData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  
  const payload = {
   user:{
     first_name: formData.user.first_name,
    last_name: formData.user.last_name,
    email: formData.user.email,
},
    roll_number: formData.roll_number,
    phone_number: formData.phone_number,
    grade: formData.grade,
    class_name: formData.class_name,
    date_of_birth: formData.date_of_birth,
    admission_date: formData.admission_date,
  };

  try {
    const response = await axiosPrivate.patch(`/mystudents/${student.id}/`, payload);
    onUpdate(response.data);
    onClose();
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.detail || "Failed to update student");
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Student</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.user.first_name}
                onChange={(e) => handleChange("first_name", e.target.value, true)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.user.last_name}
                onChange={(e) => handleChange("last_name", e.target.value, true)}
                required
              />
            </Grid>
           
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.user.email}
                onChange={(e) => handleChange("email", e.target.value, true)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Roll Number"
                value={formData.roll_number}
                onChange={(e) => handleChange("roll_number", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade"
                value={formData.grade}
                onChange={(e) => handleChange("grade", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Class"
                value={formData.class_name}
                onChange={(e) => handleChange("class_name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Admission Date"
                type="date"
                value={formData.admission_date}
                onChange={(e) => handleChange("admission_date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Update Student
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}