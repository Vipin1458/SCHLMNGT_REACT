import { Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function DashboardHome() {
  const { auth } = useAuth();

  return (
    <div>
      <Typography variant="h4">Dashboard Home</Typography>
      <Typography variant="subtitle1" mt={2}>
        Logged in as: {auth?.user?.username} ({auth?.user?.role})
      </Typography>
    </div>
  );
}
