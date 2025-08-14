import { useForm } from "react-hook-form";

import axios from "axios";
import { useNavigate,Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import toast from "react-hot-toast";

export default function LoginForm() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
     
      const tokenRes = await axios.post("http://localhost:8000/api/token/", {
        username: data.username,
        password: data.password,
      });

      const access = tokenRes.data.access;
      const refresh = tokenRes.data.refresh;
      const id =tokenRes.data.id

      const user = {
        username: tokenRes.data.username,
        role: tokenRes.data.role,
      };

      
     id? login({ user, access, refresh,id }):login({ user, access, refresh })

      navigate("/dashboard");
    } catch (err) {
      toast.error("Invalid credentials. Try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            {...register("username", { required: true })}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            {...register("password", { required: true })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Paper>
      <Link to="/forgot-password">Forgot Password?</Link>
    </Container>
  );
}
