import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
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
  Close as CloseIcon
} from '@mui/icons-material';
import axiosPrivate from '../api/axiosPrivate';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AllTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
 const navigate = useNavigate();
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    phone_number: '',
    subject_specialization: '',
    date_of_joining: ''
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get('/teachers/');
      setTeachers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showSnackbar('Error fetching teachers', 'error');
    } finally {
      setLoading(false);
    }
  };


  const fetchTeacherStudents = async (teacherId) => {
    try {
      setStudentsLoading(true);
      const response = await axiosPrivate.get(`/teacher-admin/${teacherId}/students/`);
      setTeacherStudents(response.data);
    } catch (error) {
      console.error('Error fetching teacher students:', error);
      showSnackbar('Error fetching students', 'error');
      setTeacherStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleTeacherClick = async (teacher) => {
    setSelectedTeacher(teacher);
    setDetailsOpen(true);
    setTabValue(0);
    
    await fetchTeacherStudents(teacher.id);
  };
   const handleExport = async () => {
      try {
        const res = await axiosPrivate.get("/export/teachers", {
          responseType: "blob",
        });
        const blob = new Blob([res.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
  
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "teachers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        toast.success("Exported Successfully");
      } catch (err) {
        toast.error("Failed to export teachers.");
        console.error(err);
      }
    };
  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setEditFormData({
      first_name: teacher.user.first_name,
      last_name: teacher.user.last_name,
      email: teacher.user.email,
      employee_id: teacher.employee_id,
      phone_number: teacher.phone_number,
      subject_specialization: teacher.subject_specialization,
      date_of_joining: teacher.date_of_joining
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setDeleteOpen(true);
  };
  const handleAddTeacherClick = () => {
    navigate('/dashboard/teachers/register');
  };

  const handleUpdateTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      const updateData = {
        user: {
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          email: editFormData.email,
        },
        employee_id: editFormData.employee_id,
        phone_number: editFormData.phone_number,
        subject_specialization: editFormData.subject_specialization,
        date_of_joining: editFormData.date_of_joining
      };

      await axiosPrivate.patch(`/teachers/${selectedTeacher.id}/`, updateData);
      showSnackbar('Teacher updated successfully', 'success');
      setEditOpen(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error updating teacher:', error);
      showSnackbar('Error updating teacher', 'error');
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      await axiosPrivate.delete(`/teachers/${selectedTeacher.id}/`);
      showSnackbar('Teacher deleted successfully', 'success');
      setDeleteOpen(false);
      setDetailsOpen(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      showSnackbar('Error deleting teacher', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = [
    {
      field: 'full_name',
      headerName: 'Full Name',
      width: 180,
      valueGetter: (value, row) => 
        `${row.user?.first_name || ''} ${row.user?.last_name || ''}`,
    },
    {
      field: 'employee_id',
      headerName: 'Employee ID',
      width: 104,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      valueGetter: (value, row) => row.user?.email || '',
    },
    {
      field: 'subject_specialization',
      headerName: 'Subject',
      width: 140,
    },
    {
      field: 'phone_number',
      headerName: 'Phone',
      width: 140,
    },
    {
      field: 'date_of_joining',
      headerName: 'Join Date',
      width: 110,
      valueFormatter: (value) => {
        if (!value) return '';
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row?.status === 1 ? 'Active' : 'Inactive'}
          color={params.row?.status === 1 ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View Details"
          onClick={() => params.row && handleTeacherClick(params.row)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => params.row && handleEditClick(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => params.row && handleDeleteClick(params.row)}
        />,
      ],
    },
  ];

  const studentColumns = [
    {
      field: 'full_name',
      headerName: 'Student Name',
      width: 200,
      valueGetter: (value, row) => 
        `${row.user?.first_name || ''} ${row.user?.last_name || ''}`,
    },
    {
      field: 'roll_number',
      headerName: 'Roll Number',
      width: 130,
    },
    {
      field: 'class_name',
      headerName: 'Class',
      width: 100,
    },
    {
      field: 'grade',
      headerName: 'Grade',
      width: 100,
    },
    {
      field: 'phone_number',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row?.status === 1 ? 'Active' : 'Inactive'}
          color={params.row?.status === 1 ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          All Teachers
        </Typography>
        <Button
          variant="contained"
          onClick={handleAddTeacherClick}
          startIcon={<PersonAddIcon />}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
            borderRadius: 2,
            px: 3
          }}
        >
          Add New Teacher
        </Button>
        <Button
                    variant="outlined"
                    onClick={handleExport}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    Export teachers
                  </Button>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(212, 12, 12, 0.1)' }}>
        <CardContent>
          <Box
  sx={{
    height: {
      xs: 300,  
      sm: 400,  
      md: 500, 
      lg: 600, 
    },
    width: '100%',
  }}
>
            <DataGrid
              rows={teachers}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': { fontSize: '0.875rem' },
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f5f5f5',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

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
            Teacher Details
          </Typography>
          <IconButton onClick={() => setDetailsOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedTeacher && (
            <>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
              >
                <Tab label="Basic Information" />
                <Tab label={`Students (${teacherStudents.length})`} />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BadgeIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedTeacher.user.first_name} {selectedTeacher.user.last_name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body1">{selectedTeacher.employee_id}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Username</Typography>
                      <Typography variant="body1">{selectedTeacher.user.username}</Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip
                        label={selectedTeacher.status === 1 ? 'Active' : 'Inactive'}
                        color={selectedTeacher.status === 1 ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">{selectedTeacher.user.email}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">{selectedTeacher.phone_number}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SchoolIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">{selectedTeacher.subject_specialization}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TodayIcon sx={{ mr: 1, color: '#1976d2' }} />
                      <Typography variant="body1">
                        {new Date(selectedTeacher.date_of_joining).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                {studentsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : teacherStudents.length > 0 ? (
                  <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                      rows={teacherStudents}
                      columns={studentColumns}
                      pageSizeOptions={[5, 10, 25]}
                      initialState={{
                        pagination: { paginationModel: { pageSize: 5 } },
                      }}
                      disableRowSelectionOnClick
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <SchoolIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No students assigned to this teacher
                    </Typography>
                  </Box>
                )}
              </TabPanel>
            </>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => selectedTeacher && handleEditClick(selectedTeacher)}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit Teacher
          </Button>
          <Button
            onClick={() => selectedTeacher && handleDeleteClick(selectedTeacher)}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Teacher
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Teacher</DialogTitle>
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
                label="Employee ID"
                value={editFormData.employee_id}
                onChange={(e) => setEditFormData(prev => ({ ...prev, employee_id: e.target.value }))}
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
                label="Subject Specialization"
                value={editFormData.subject_specialization}
                onChange={(e) => setEditFormData(prev => ({ ...prev, subject_specialization: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Date of Joining"
                type="date"
                value={editFormData.date_of_joining}
                onChange={(e) => setEditFormData(prev => ({ ...prev, date_of_joining: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateTeacher} variant="contained">
            Update Teacher
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete teacher{' '}
            <strong>
              {selectedTeacher?.user.first_name} {selectedTeacher?.user.last_name}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTeacher} color="error" variant="contained">
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
    </Box>
  );
};

export default AllTeachers;

