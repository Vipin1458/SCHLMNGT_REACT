import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import axiosPrivate from "../api/axiosPrivate";
import StudentTable from "../components/StudentTable";

export default function MyStudentsPage() {
  const [myStudents, setMyStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyStudents = async () => {
      try {
        const res = await axiosPrivate.get("/mystudents/");
        setMyStudents(res.data);
      } catch (err) {
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyStudents();
  }, []);

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h5" gutterBottom>My Students</Typography>
     <StudentTable students={myStudents}  />

    </Container>
  );
}
