import {
  Container, TextField, Button, Typography, MenuItem, Grid, Alert
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";

export default function RegisterTeacherPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const payload = {
        user: {
          username: data.username,
          email: data.email,
          password: data.password,
          role: "teacher",
        },
        employee_id: data.employee_id,
        phone_number: data.phone_number,
        subject_specialization: data.subject_specialization,
        date_of_joining: data.date_of_joining,
        status: parseInt(data.status),
      };

      await axiosPrivate.post("/teachers/", payload);
      navigate("/dashboard/teachers");
    } catch (err) {
      setError("Failed to register teacher.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>Register Teacher</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}><TextField fullWidth label="Username" {...register("username")} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Email" {...register("email")} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Password" type="password" {...register("password")} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Employee ID" {...register("employee_id")} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Phone Number" {...register("phone_number")} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Subject Specialization" {...register("subject_specialization")} /></Grid>
          <Grid item xs={12}><TextField fullWidth type="date" label="Date of Joining" InputLabelProps={{ shrink: true }} {...register("date_of_joining")} /></Grid>
          <Grid item xs={12}>
            <TextField select fullWidth label="Status" defaultValue="0" {...register("status")}>
              <MenuItem value={0}>Active</MenuItem>
              <MenuItem value={1}>Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}><Button type="submit" variant="contained" fullWidth>Register</Button></Grid>
        </Grid>
      </form>
    </Container>
  );
}
