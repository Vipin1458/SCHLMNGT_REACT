import { useEffect, useState } from "react";
import axiosPrivate from "../api/axiosPrivate";
import {
  Container, Typography, CircularProgress, Alert,
  Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";

export default function AllExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchExams = async () => {
    try {
      const res = await axiosPrivate.get("/exams/");
      // Fix: Use res.data.results if it exists, otherwise fallback
      const data = res.data?.results ?? res.data;
      setExams(data);
    } catch (err) {
      setError("Failed to load exams.");
    } finally {
      setLoading(false);
    }
  };

  fetchExams();
}, []);


  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h5" gutterBottom>All Exams</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Teacher</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {exams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.title}</TableCell>
              <TableCell>{exam.subject}</TableCell>
              <TableCell>{exam.teacher}</TableCell>
              <TableCell>
  {exam.created_at ? new Date(exam.created_at).toLocaleString() : "N/A"}
</TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}