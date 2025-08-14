import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Grade as GradeIcon,
} from "@mui/icons-material";
import StudentEditDialog from "./StudentEditDialog";
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";


export default function StudentTable({ students, onStudentUpdate }) {
  const [editStudent, setEditStudent] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marksDialogOpen, setMarksDialogOpen] = useState(false);
  const [studentMarks, setStudentMarks] = useState([]);
  const [marksLoading, setMarksLoading] = useState(false);
  const [marksError, setMarksError] = useState("");

  const navigate = useNavigate();
  const handleEditClick = (student) => {
    setEditStudent(student);
  };

  const handleEditClose = () => {
    setEditStudent(null);
  };

  const handleStudentUpdate = (updatedStudent) => {
    onStudentUpdate(updatedStudent);
    setEditStudent(null);
  };

const handleMessageStudent = async (studentId) => {
  try {
    const convRes = await axiosPrivate.get("/chat/api/conversations/");
    const existingConv = convRes.data.results.find(
      (c) => c.student_id === studentId
    );

    let conv;
    if (existingConv) {
      conv = existingConv;
    } else {
      const teacherId = Number(localStorage.getItem("id"));
      const createRes = await axiosPrivate.post("/chat/api/conversations/", {
        teacher_id: teacherId,
        student_id: studentId,
      });
      conv = createRes.data;
    }

    navigate("/dashboard/messages", { state: { convId: conv.id } });
  } catch (err) {
    console.error("Error starting chat:", err);
  }
};

  const handleViewMarks = async (student) => {
    setSelectedStudent(student);
    setMarksDialogOpen(true);
    setMarksLoading(true);
    setMarksError("");

    try {
      const res = await axiosPrivate.get("/student-exams/");
      const allMarks = res.data.results || res.data;
      const studentSpecificMarks = allMarks.filter(
        (mark) => mark.student_roll === student.roll_number
      );

      setStudentMarks(studentSpecificMarks);
    } catch (err) {
      console.error("Error fetching student marks:", err);
      setMarksError("Failed to load exam results");
    } finally {
      setMarksLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedStudents = students.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!students || students.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No students found
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Roll Number</strong>
                </TableCell>
                <TableCell>
                  <strong>Class</strong>
                </TableCell>
                <TableCell>
                  <strong>Grade</strong>
                </TableCell>
                <TableCell>
                  <strong>Phone</strong>
                </TableCell>
                <TableCell>
                  <strong>Email</strong>
                </TableCell>
                <TableCell>
                  <strong>Exams Taken</strong>
                </TableCell>
                <TableCell>
                  <strong>Message</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    {student.user?.first_name} {student.user?.last_name}
                  </TableCell>
                  <TableCell>{student.roll_number}</TableCell>
                  <TableCell>{student.class_name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.phone_number}</TableCell>
                  <TableCell>{student.user?.email}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GradeIcon />}
                      onClick={() => handleViewMarks(student)}
                      sx={{ minWidth: "auto" }}
                    >
                      View Marks
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => handleMessageStudent(student.id)}
                    >
                      Message
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.status === 1 ? "Active" : "Inactive"}
                      color={student.status === 1 ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={() => handleEditClick(student)}
                        color="primary"
                        size="small"
                        title="Edit Student"
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={students.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <StudentEditDialog
        open={!!editStudent}
        onClose={handleEditClose}
        student={editStudent}
        onUpdate={handleStudentUpdate}
      />

      <Dialog
        open={marksDialogOpen}
        onClose={() => setMarksDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GradeIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Exam Results - {selectedStudent?.user?.first_name}{" "}
            {selectedStudent?.user?.last_name}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {marksLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : marksError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {marksError}
            </Alert>
          ) : studentMarks.length > 0 ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Roll Number: {selectedStudent?.roll_number} | Class:{" "}
                {selectedStudent?.class_name}
              </Typography>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Exam Title</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Subject</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Marks</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Percentage</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Date</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentMarks.map((mark) => (
                    <TableRow key={mark.id}>
                      <TableCell>{mark.exam_title}</TableCell>
                      <TableCell>{mark.exam_subject}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${mark.marks}/${mark.total_questions}`}
                          color={
                            mark.marks >= mark.total_questions * 0.6
                              ? "success"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{mark.total_questions}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              mark.marks >= mark.total_questions * 0.6
                                ? "success.main"
                                : "error.main",
                            fontWeight: 600,
                          }}
                        >
                          {((mark.marks / mark.total_questions) * 100).toFixed(
                            1
                          )}
                          %
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(mark.submitted_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <GradeIcon sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No exam results found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This student hasn't taken any exams yet
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setMarksDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
