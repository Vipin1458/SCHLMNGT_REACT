import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControlLabel,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import axiosPrivate from "../api/axiosPrivate";
import { useAuth } from "../context/AuthContext";

export default function TeacherExamsPage() {
  const { auth } = useAuth(); 
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ title: "", subject: "", target_class: "" });
  const [selectedExam, setSelectedExam] = useState(null);

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

  const handleEditClick = (exam) => {
    setSelectedExam(exam);
    setEditData({
      title: exam.title,
      subject: exam.subject,
      target_class: exam.target_class
    });
    setEditOpen(true);
  };

  const handleUpdateExam = async () => {
    try {
      await axiosPrivate.patch(`/exams/${selectedExam.id}/`, {
        title: editData.title,
        subject: editData.subject,
        target_class: editData.target_class
      });
      setEditOpen(false);

      const res = await axiosPrivate.get("/exams/");
      setExams(res.data.results || res.data);
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update exam.");
    }
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>{exam.title}</TableCell>
                <TableCell>{exam.target_class}</TableCell>
                <TableCell>{exam.teacher?.user?.username || "Unassigned"}</TableCell>
                <TableCell>
                  {isAssignedToMe(exam) && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditClick(exam)}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Exam</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Title"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Subject"
            value={editData.subject}
            onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Target Class"
            value={editData.target_class}
            onChange={(e) => setEditData({ ...editData, target_class: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateExam} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
