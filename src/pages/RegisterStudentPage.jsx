import {
  Container, TextField, Button, Typography, MenuItem, Grid, Alert,
  FormControl, InputLabel, Select, Box
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const studentSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(4).required("Password is required"),
  roll_number: yup.string().required("Roll number is required"),
  phone_number: yup.string().required("Phone number is required"),
  grade: yup.string().required("Grade is required"),
  date_of_birth: yup.string().required("DOB is required"),
  admission_date: yup.string().required("Admission date is required"),
  assigned_teacher: yup.number().required("Assigned teacher is required"),
  status: yup.number().required("Status is required"),
});

export default function RegisterStudentPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(studentSchema),
  });

  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [file, setFile] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axiosPrivate.get("/teachers/");
        setTeachers(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to load teachers");
      }
    };
    fetchTeachers();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        user: {
          username: data.username,
          email: data.email,
          password: data.password,
          role: "student",
        },
        roll_number: data.roll_number,
        phone_number: data.phone_number,
        grade: data.grade,
        date_of_birth: data.date_of_birth,
        admission_date: data.admission_date,
        status: parseInt(data.status),
        assigned_teacher: parseInt(data.assigned_teacher),
      };
      await axiosPrivate.post("/students/", payload);
      navigate("/dashboard/students");
    } catch (err) {
      if (err.response?.data) {
        const serverErrors = err.response.data;
        const messages = [];
        for (const key in serverErrors) {
          if (Array.isArray(serverErrors[key])) {
            messages.push(`${key}: ${serverErrors[key].join(", ")}`);
          } else {
            messages.push(`${key}: ${serverErrors[key]}`);
          }
        }
        setError(messages.join(" | "));
      } else {
        setError("Failed to register student.");
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axiosPrivate.post("import/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Students imported successfully");
      navigate("/dashboard/students");
    } catch (err) {
      toast.error("Failed to import students");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>Register Student</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Toggle Import Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" onClick={() => setShowImport(!showImport)}>
          {showImport ? "Cancel Import" : "Import Students"}
        </Button>
      </Box>

      {/* Import CSV UI */}
      {showImport && (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ flex: 1 }}
          />
          <Button variant="contained" color="success" onClick={handleImport}>
            Upload
          </Button>
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}><TextField fullWidth label="Username" {...register("username")} error={!!errors.username} helperText={errors.username?.message} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Password" type="password" {...register("password")} error={!!errors.password} helperText={errors.password?.message} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Roll Number" {...register("roll_number")} error={!!errors.roll_number} helperText={errors.roll_number?.message} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Phone Number" {...register("phone_number")} error={!!errors.phone_number} helperText={errors.phone_number?.message} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Grade" {...register("grade")} error={!!errors.grade} helperText={errors.grade?.message} /></Grid>
          <Grid item xs={12}><TextField fullWidth type="date" label="DOB" InputLabelProps={{ shrink: true }} {...register("date_of_birth")} error={!!errors.date_of_birth} helperText={errors.date_of_birth?.message} /></Grid>
          <Grid item xs={12}><TextField fullWidth type="date" label="Admission Date" InputLabelProps={{ shrink: true }} {...register("admission_date")} error={!!errors.admission_date} helperText={errors.admission_date?.message} /></Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.assigned_teacher}>
              <InputLabel id="teacher-label">Assigned Teacher</InputLabel>
              <Select
                labelId="teacher-label"
                id="assigned-teacher"
                defaultValue=""
                {...register("assigned_teacher")}
              >
                <MenuItem value="" disabled>Select Teacher</MenuItem>
                {teachers.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.user.username}</MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="error">{errors.assigned_teacher?.message}</Typography>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Status"
              defaultValue={0}
              {...register("status")}
              error={!!errors.status}
              helperText={errors.status?.message}
            >
              <MenuItem value={0}>Active</MenuItem>
              <MenuItem value={1}>Inactive</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth>
              Register
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}
