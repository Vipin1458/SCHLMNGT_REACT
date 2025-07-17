import { useEffect, useState } from "react";
import {
  Container, Typography, CircularProgress, Alert, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Modal, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack
} from "@mui/material";
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import StudentTable from "../components/StudentTable";


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

 const handleExport = async () => {
  try {
    const res = await axiosPrivate.get("/export/students", {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Exported Successfully");
  } catch (err) {
    toast.error("Failed to export students.");
    console.error(err);
  }
};


  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h5" gutterBottom>All Students</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => navigate("/dashboard/students/register")}
        >
          Register Student
        </Button>
        <Button
          variant="outlined"
          onClick={handleExport}
        >
          Export Students
        </Button>
      </Stack>

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
