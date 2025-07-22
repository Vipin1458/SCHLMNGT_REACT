import { useEffect, useState } from "react";
import {
  Container, Typography, CircularProgress, Alert, Button, Card, CardContent,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Box,
  Chip, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, MenuItem, FormControl, InputLabel, Select, Snackbar
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Today as TodayIcon, 
  Assignment as AssignmentIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

export default function AllStudentsPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMarks, setStudentMarks] = useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [marksLoading, setMarksLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    roll_number: '',
    phone_number: '',
    grade: '',
    class_name: '',
    date_of_birth: '',
    admission_date: '',
    assigned_teacher: ''
  });

  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosPrivate.get("/students/");
      setStudents(res.data.results || res.data);
    } catch (err) {
      setError("Failed to load students.");
      showSnackbar('Error fetching students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axiosPrivate.get("/teachers/");
      setTeachers(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

const fetchStudentMarks = async (studentId) => {
  try {
    setMarksLoading(true);
    const res = await axiosPrivate.get(`/student-exams/?student_id=${studentId}`);
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: res.data.results || res.data
    }));
  } catch (err) {
    console.error('Error fetching student marks:', err);
    showSnackbar('Error fetching exam marks', 'error');
    setStudentMarks(prev => ({ ...prev, [studentId]: [] }));
  } finally {
    setMarksLoading(false);
  }
};


  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
    setTabValue(0);
    
    await fetchStudentMarks(student.id);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      first_name: student.user.first_name,
      last_name: student.user.last_name,
      email: student.user.email,
      roll_number: student.roll_number,
      phone_number: student.phone_number,
      grade: student.grade,
      class_name: student.class_name,
      date_of_birth: student.date_of_birth,
      admission_date: student.admission_date,
      assigned_teacher: student.assigned_teacher|| ''
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setDeleteConfirmOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const updateData = {
        user: {
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          email: editFormData.email,
        },
        roll_number: editFormData.roll_number,
        phone_number: editFormData.phone_number,
        grade: editFormData.grade,
        class_name: editFormData.class_name,
        date_of_birth: editFormData.date_of_birth,
        admission_date: editFormData.admission_date,
        assigned_teacher: editFormData.assigned_teacher || null
      };

      await axiosPrivate.patch(`/students/${selectedStudent.id}/`, updateData);
       fetchStudents();
      setEditOpen(false);
      showSnackbar('Student updated successfully', 'success');
     
    } catch (error) {
      console.error('Error updating student:', error);
      showSnackbar('Error updating student', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;

    try {
      await axiosPrivate.delete(`/students/${selectedStudent.id}/`);
      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      setDeleteConfirmOpen(false);
      setDetailsOpen(false);
      setSelectedStudent(null);
      showSnackbar('Student deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting student:', err);
      showSnackbar('Error deleting student', 'error');
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

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  if (loading) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Container>
  );

  if (error) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          All Students
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate("/dashboard/students/register")}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              borderRadius: 2,
              px: 3
            }}
          >
            Register Student
          </Button>
          <Button
            variant="outlined"
            onClick={handleExport}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Export Students
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {students.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card 
              sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => handleStudentClick(student)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BadgeIcon sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {student.user.first_name} {student.user.last_name}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Roll Number</Typography>
                  <Typography variant="body1">{student.roll_number}</Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Class </Typography>
                  <Typography variant="body1">{student.class_name} </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Assigned Teacher</Typography>
                  <Typography variant="body1">
                    {student.assigned_teacher_name || 'Not Assigned'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={student.status === 1 ? 'Active' : 'Inactive'}
                    color={student.status === 1 ? 'success' : 'default'}
                    size="small"
                  />
                  <Box>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudentClick(student);
                      }}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Student Details
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedStudent && (
            <>
              <Tabs
  value={tabValue}
  onChange={(_, newValue) => setTabValue(newValue)}
  sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
>
  <Tab label="Basic Information" />
  <Tab label={`Exam Results (${(studentMarks[selectedStudent.id] || []).length})`} />
</Tabs>



              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BadgeIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedStudent.user.first_name} {selectedStudent.user.last_name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Username</Typography>
                      <Typography variant="body1">{selectedStudent.user.username}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Roll Number</Typography>
                      <Typography variant="body1">{selectedStudent.roll_number}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Class & Grade</Typography>
                      <Typography variant="body1">{selectedStudent.class_name} - {selectedStudent.grade}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedStudent.status === 1 ? 'Active' : 'Inactive'}
                        color={selectedStudent.status === 1 ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">{selectedStudent.user.email}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">{selectedStudent.phone_number}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SchoolIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">
                        Teacher: {selectedStudent.assigned_teacher_name || 'Not Assigned'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TodayIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">
                        Admission: {new Date(selectedStudent.admission_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TodayIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">
                        DOB: {new Date(selectedStudent.date_of_birth).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {marksLoading ? (
                   <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress />
  </Box>
) : (studentMarks[selectedStudent.id] || []).length > 0 ? (
  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Exam Title</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Percentage</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                     {(studentMarks[selectedStudent.id] || []).map((mark) => (
        <TableRow key={mark.id}>
                          <TableCell>{mark.exam_title}</TableCell>
                          <TableCell>{mark.exam_subject}</TableCell>
                          <TableCell>
                            <Chip
                              label={mark.marks}
                              color={mark.marks >= mark.total_questions * 0.6 ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{mark.total_questions}</TableCell>
                          <TableCell>
                            {((mark.marks / mark.total_questions) * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            {new Date(mark.submitted_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <GradeIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No exam results found
                    </Typography>
                  </Box>
                )}
              </TabPanel>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => selectedStudent && handleEditClick(selectedStudent)}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit Student
          </Button>
          <Button
            onClick={() => selectedStudent && handleDeleteClick(selectedStudent)}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Student
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.first_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, first_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editFormData.last_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Roll Number"
                value={editFormData.roll_number}
                onChange={(e) => setEditFormData(prev => ({ ...prev, roll_number: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editFormData.phone_number}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Grade"
                value={editFormData.grade}
                onChange={(e) => setEditFormData(prev => ({ ...prev, grade: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Class"
                value={editFormData.class_name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, class_name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={editFormData.date_of_birth}
                onChange={(e) => setEditFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Admission Date"
                type="date"
                value={editFormData.admission_date}
                onChange={(e) => setEditFormData(prev => ({ ...prev, admission_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assigned Teacher</InputLabel>
                <Select
                  value={editFormData.assigned_teacher}
                  label="Assigned Teacher"
                  onChange={(e) => setEditFormData(prev => ({ ...prev, assigned_teacher: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>No Teacher Assigned</em>
                  </MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.user.first_name} {teacher.user.last_name} - {teacher.subject_specialization}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStudent} variant="contained">
            Update Student
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete student{' '}
            <strong>
              {selectedStudent?.user.first_name} {selectedStudent?.user.last_name}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 