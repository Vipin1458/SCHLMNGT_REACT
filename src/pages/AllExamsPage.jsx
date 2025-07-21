import { useEffect, useState } from "react";
import axiosPrivate from "../api/axiosPrivate";
import {
  Container, Typography, CircularProgress, Alert, Paper, Box,
  Table, TableHead, TableRow, TableCell, TableBody, Button,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Grid, Fade, Snackbar, TableContainer,
  Tooltip, Card, CardContent
} from "@mui/material";
import {
  Edit, Delete, Visibility, People, Assessment,
  Add, School, Person, Quiz, CheckCircle, Cancel
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function AllExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialog, setEditDialog] = useState({ open: false, exam: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, exam: null });
  const [attendanceDialog, setAttendanceDialog] = useState({ open: false, exam: null, attendance: [] });
  const [marksDialog, setMarksDialog] = useState({ open: false, exam: null, marks: [] });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editFormData, setEditFormData] = useState({
    title: '',
    subject: '',
    target_class: '',
    teacher_id: ''
  });

  useEffect(() => {
    fetchExams();
    fetchTeachers();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await axiosPrivate.get("/exams/");
      const data = res.data?.results ?? res.data;
      setExams(data);
    } catch (err) {
      setError("Failed to load exams.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axiosPrivate.get("/teachers/");
      setTeachers(res.data?.results ?? res.data);
    } catch (err) {
      console.error("Failed to load teachers");
    }
  };

  const handleEdit = (exam) => {
    setEditFormData({
      title: exam.title,
      subject: exam.subject,
      target_class: exam.target_class,
      teacher_id: exam.teacher?.id || ''
    });
    setEditDialog({ open: true, exam });
  };

  const handleEditSubmit = async () => {
    try {
      await axiosPrivate.patch(`/exams/${editDialog.exam.id}/`, {
        title: editFormData.title,
        subject: editFormData.subject,
        target_class: editFormData.target_class,
        teacher_id: editFormData.teacher_id
      });
      
      setSnackbar({
        open: true,
        message: 'Exam updated successfully!',
        severity: 'success'
      });
      
      setEditDialog({ open: false, exam: null });
      fetchExams();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update exam.',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axiosPrivate.delete(`/exams/${deleteDialog.exam.id}/`);
      
      setSnackbar({
        open: true,
        message: 'Exam deleted successfully!',
        severity: 'success'
      });
      
      setDeleteDialog({ open: false, exam: null });
      fetchExams();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete exam.',
        severity: 'error'
      });
    }
  };

  const handleViewAttendance = async (exam) => {
    try {
      const res = await axiosPrivate.get(`/student-exams/?exam_id=${exam.id}`);
      setAttendanceDialog({
        open: true,
        exam,
        attendance: res.data?.results ?? res.data
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load attendance data.',
        severity: 'error'
      });
    }
  };

  const handleViewMarks = async (exam) => {
    try {
      const res = await axiosPrivate.get(`/student-exams/?exam_id=${exam.id}`);
      setMarksDialog({
        open: true,
        exam,
        marks: res.data?.results ?? res.data
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load marks data.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getAttendanceCount = (exam) => {
    return exam.questions_count || 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa', py: 4, px: 2 }}>
      <Fade in={true} timeout={800}>
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Quiz sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Exam Management
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Manage all exams, view attendance and student performance
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/dashboard/exams/create')}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                Create New Exam
              </Button>
            </Box>
          </Paper>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Quiz sx={{ fontSize: 40, color: '#1976d2' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {exams.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Exams
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <School sx={{ fontSize: 40, color: '#00acc1' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="secondary">
                        {new Set(exams.map(e => e.subject)).size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Subjects
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Person sx={{ fontSize: 40, color: '#4caf50' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#4caf50' }}>
                        {teachers.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Teachers
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Assessment sx={{ fontSize: 40, color: '#ff9800' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff9800' }}>
                        {new Set(exams.map(e => e.target_class)).size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Classes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                All Exams ({exams.length})
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Questions</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="600">
                            {exam.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={exam.subject} 
                            size="small" 
                            sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={exam.target_class} 
                            size="small" 
                            sx={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {exam.teacher?.user?.first_name && exam.teacher?.user?.last_name 
                              ? `${exam.teacher.user.first_name} ${exam.teacher.user.last_name}`
                              : exam.teacher?.user?.username || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${exam.questions_count || 5} Questions`} 
                            size="small" 
                            sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {exam.created_at ? new Date(exam.created_at).toLocaleDateString() : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Exam">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEdit(exam)}
                                sx={{ color: '#1976d2' }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="View Attendance">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewAttendance(exam)}
                                sx={{ color: '#00acc1' }}
                              >
                                <People />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="View Marks">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewMarks(exam)}
                                sx={{ color: '#4caf50' }}
                              >
                                <Assessment />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete Exam">
                              <IconButton 
                                size="small" 
                                onClick={() => setDeleteDialog({ open: true, exam })}
                                sx={{ color: '#f44336' }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {exams.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Quiz sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No exams found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first exam to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/dashboard/create-exam')}
                  >
                    Create Exam
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Fade>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, exam: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Exam</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Subject"
              value={editFormData.subject}
              onChange={(e) => setEditFormData(prev => ({ ...prev, subject: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Target Class"
              value={editFormData.target_class}
              onChange={(e) => setEditFormData(prev => ({ ...prev, target_class: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Teacher"
              value={editFormData.teacher_id}
              onChange={(e) => setEditFormData(prev => ({ ...prev, teacher_id: e.target.value }))}
              fullWidth
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.user?.first_name && teacher.user?.last_name 
                    ? `${teacher.user.first_name} ${teacher.user.last_name}`
                    : teacher.user?.username || `Teacher ${teacher.id}`} ({teacher.employee_id})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, exam: null })}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, exam: null })}>
        <DialogTitle>Delete Exam</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the exam "{deleteDialog.exam?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, exam: null })}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={attendanceDialog.open} onClose={() => setAttendanceDialog({ open: false, exam: null, attendance: [] })} maxWidth="md" fullWidth>
        <DialogTitle>
          Exam Attendance - {attendanceDialog.exam?.title}
        </DialogTitle>
        <DialogContent>
          {attendanceDialog.attendance.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Submitted At</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceDialog.attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>{record.student_roll}</TableCell>
                      <TableCell>
                        {new Date(record.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<CheckCircle />}
                          label="Completed" 
                          size="small" 
                          sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <People sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No students have attended this exam yet
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialog({ open: false, exam: null, attendance: [] })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={marksDialog.open} onClose={() => setMarksDialog({ open: false, exam: null, marks: [] })} maxWidth="md" fullWidth>
        <DialogTitle>
          Exam Results - {marksDialog.exam?.title}
        </DialogTitle>
        <DialogContent>
          {marksDialog.marks.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Percentage</TableCell>
                    <TableCell>Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marksDialog.marks.map((record) => {
                    const percentage = (record.marks / record.total_questions) * 100;
                    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F';
                    const gradeColor = percentage >= 70 ? '#4caf50' : percentage >= 60 ? '#ff9800' : '#f44336';
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{record.student_name}</TableCell>
                        <TableCell>{record.student_roll}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {record.marks}/{record.total_questions}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {percentage.toFixed(1)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={grade} 
                            size="small" 
                            sx={{ 
                              backgroundColor: `${gradeColor}20`, 
                              color: gradeColor,
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Assessment sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No results available for this exam
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarksDialog({ open: false, exam: null, marks: [] })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ minWidth: 300 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}