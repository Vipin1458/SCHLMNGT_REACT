import { useState } from "react";
import { TextField, Button, Container, Typography, Alert, Box } from "@mui/material";
import axios from "axios";
import axiosPrivate from "../api/axiosPrivate";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axiosPrivate.post("/api/password-reset/", { email });
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>Forgot Password</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant="contained" type="submit">Send Reset Link</Button>
      </Box>
    </Container>
  );
}
