import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Stack
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Today as TodayIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axiosPrivate from '../api/axiosPrivate';

const AdminHomepage = () => {
  const [adminInfo, setAdminInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactiveTeachers, setShowInactiveTeachers] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { auth } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    inactiveTeachers: 0
  });


  const fetchAdminInfo = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setAdminInfo(user);
    } catch (error) {
      console.error('Error fetching admin info:', error);
      showSnackbar('Error fetching admin information', 'error');
    }
  };

 
  const fetchStudents = async () => {
    try {
      const response = await axiosPrivate.get('/students/');
      console.log("response_inDshHme",response);
      
      const studentsData = response.data.results || response.data;
      setStudents(studentsData);
      
     
      const activeStudents = studentsData.filter(student => student.status === 1);
      const inactiveStudents = studentsData.filter(student => student.status === 0);
      
      setStats(prev => ({
        ...prev,
        totalStudents: studentsData.length,
        activeStudents: activeStudents.length,
        inactiveStudents: inactiveStudents.length
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      showSnackbar('Error fetching students', 'error');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axiosPrivate.get('/teachers/');
      const teachersData = response.data.results || response.data;
      setTeachers(teachersData);
      
      const activeTeachers = teachersData.filter(teacher => teacher.status === 1);
      const inactiveTeachers = teachersData.filter(teacher => teacher.status === 0);
      
      setStats(prev => ({
        ...prev,
        totalTeachers: teachersData.length,
        activeTeachers: activeTeachers.length,
        inactiveTeachers: inactiveTeachers.length
      }));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showSnackbar('Error fetching teachers', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredTeachers = showInactiveTeachers 
    ? teachers.filter(teacher => teacher.status === 0)
    : teachers.filter(teacher => teacher.status === 1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAdminInfo(),
        fetchStudents(),
        fetchTeachers()
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <DashboardIcon sx={{ mr: 2, fontSize: 32, color: '#1976d2' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {auth?.user?.role === "admin"?"Admin Dashboard":"Teacher Dashboard"}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 62,
                    height: 62,
                    bgcolor: '#1976d2',
                    mr: 2,
                    fontSize: '1.5rem'
                  }}
                >
                  {adminInfo?.username?.charAt(0)?.toUpperCase() || 'A'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {adminInfo?.full_name || adminInfo?.username || 'Admin'}
                  </Typography>
                  <Chip
                    label="Administrator"
                    color="primary"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ space: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BadgeIcon sx={{ mr: 1, color: '#666', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Username:</Typography>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                    {adminInfo?.username || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: '#666', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Role:</Typography>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                    {adminInfo?.role || 'admin'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TodayIcon sx={{ mr: 1, color: '#666', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">Login Time:</Typography>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 2, fontSize: 32, color: '#2e7d32' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Students
                    </Typography>
                  </Box>
                  
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32', mb: 1 }}>
                    {stats.totalStudents}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={`Active: ${stats.activeStudents}`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`Inactive: ${stats.inactiveStudents}`}
                      color="default"
                      size="small"
                    />
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary">
                    Total registered students
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

        {auth?.user?.role === "admin" &&  <Grid item xs={12} sm={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon sx={{ mr: 2, fontSize: 32, color: '#1976d2' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Teachers
                    </Typography>
                  </Box>
                  
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
                    {stats.totalTeachers}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={`Active: ${stats.activeTeachers}`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`Inactive: ${stats.inactiveTeachers}`}
                      color="default"
                      size="small"
                    />
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary">
                    Total registered teachers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>}
          </Grid>
        </Grid>

       
     { auth?.user?.role === "admin" &&  <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Teachers Overview
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactiveTeachers}
                      onChange={(e) => setShowInactiveTeachers(e.target.checked)}
                      icon={<VisibilityIcon />}
                      checkedIcon={<VisibilityOffIcon />}
                    />
                  }
                  label={showInactiveTeachers ? "Inactive" : "Active"}
                />
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTeachers.slice(0, 10).map((teacher) => (
                      <TableRow key={teacher.id} hover>
                        <TableCell>
                          {teacher.user?.first_name} {teacher.user?.last_name}
                        </TableCell>
                        <TableCell>{teacher.employee_id}</TableCell>
                        <TableCell>{teacher.subject_specialization}</TableCell>
                        <TableCell>
                          <Chip
                            label={teacher.status === 1 ? 'Active' : 'Inactive'}
                            color={teacher.status === 1 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredTeachers.length > 10 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Showing 10 of {filteredTeachers.length} teachers
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>}
      </Grid>

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

export default AdminHomepage;