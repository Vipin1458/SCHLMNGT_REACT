import { useEffect, useState } from "react";
import {
  Container, Typography, CircularProgress, Alert, Table, TableHead,
  TableRow, TableCell, TableBody, FormControlLabel, Checkbox
} from "@mui/material";
import axiosPrivate from "../api/axiosPrivate";
import { useAuth } from "../context/AuthContext";

export default function TeacherExamsPage() {
  const { auth } = useAuth(); 
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axiosPrivate.get("/exams/");
        setExams(res.data.results || res.data);  
      } catch (err) {
        console.error(err);
        setError("Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

const isAssignedToMe = (exam) => {
  return exam.teacher?.user?.username === auth.user?.username;
};



  const filteredExams = showOnlyAssigned
    ? exams.filter(isAssignedToMe)
    : exams;

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        All Exams
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={showOnlyAssigned}
            onChange={(e) => setShowOnlyAssigned(e.target.checked)}
          />
        }
        label="Show exams assigned to me only"
        sx={{ mb: 2 }}
      />

            {filteredExams.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No exams found.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Target Class</TableCell>
              <TableCell>Assigned Teacher</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>{exam.title}</TableCell>
                <TableCell>{exam.target_class}</TableCell>
                <TableCell>{exam.teacher?.user?.username || "Unassigned"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

    </Container>
  );
}
