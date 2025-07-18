
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";
import axios from "axios";

export default function ResetPassword() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axios.post(`/reset/${uidb64}/${token}/`, {
        new_password1: password,
        new_password2: password2,
      });
      setSuccess("Password reset successful. You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Invalid or expired token. Please request a new reset link.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" mt={4} mb={2}>
        Set New Password
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Confirm New Password"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <Button variant="contained" type="submit">
          Reset Password
        </Button>
      </Box>
    </Container>
  );
}