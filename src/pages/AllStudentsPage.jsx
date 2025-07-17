import { useEffect, useState } from "react";
import {
  Container, Typography, CircularProgress, Alert, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Modal, Box, Dialog, DialogTitle, DialogContent,
  DialogActions
} from "@mui/material";
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, width: 400
};

export default function AllStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axiosPrivate.get("/students/");
        setStudents(res.data.results || res.data);
      } catch (err) {
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleDelete = async () => {
    try {
      await axiosPrivate.delete(`/students/${selectedStudent.id}/`);
      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      setDeleteConfirmOpen(false);
      setSelectedStudent(null);
    } catch (err) {
      alert("Failed to delete student.");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h5" gutterBottom>All Students</Typography>
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => navigate("/dashboard/students/register")}
      >
        Register Student
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Roll Number</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Phone</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((s) => (
            <TableRow key={s.id} onClick={() => setSelectedStudent(s)} style={{ cursor: 'pointer' }}>
              <TableCell>{s.user.username}</TableCell>
              <TableCell>{s.roll_number}</TableCell>
              <TableCell>{s.grade}</TableCell>
              <TableCell>{s.phone_number}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Student Details Modal */}
      <Modal
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6">Student Details</Typography>
          <Typography><strong>Username:</strong> {selectedStudent?.user.username}</Typography>
          <Typography><strong>Roll No:</strong> {selectedStudent?.roll_number}</Typography>
          <Typography><strong>Grade:</strong> {selectedStudent?.grade}</Typography>
          <Typography><strong>Phone:</strong> {selectedStudent?.phone_number}</Typography>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                navigate(`/dashboard/students/edit/${selectedStudent.id}`);
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete student <strong>{selectedStudent?.user.username}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
