import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Work,
  CalendarToday,
  Visibility,
  VisibilityOff,
  PersonAdd,
  Badge,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axiosPrivate from '../api/axiosPrivate';

const RegisterTeacher = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    phone_number: '',
    subject_specialization: '',
    date_of_joining: dayjs(),
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date_of_joining: date
    }));
    
    if (errors.date_of_joining) {
      setErrors(prev => ({
        ...prev,
        date_of_joining: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required';
    }

    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (!formData.subject_specialization.trim()) {
      newErrors.subject_specialization = 'Subject specialization is required';
    }

    if (!formData.date_of_joining || !dayjs(formData.date_of_joining).isValid()) {
      newErrors.date_of_joining = 'Date of joining is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors in the form',
        severity: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const teacherData = {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
        },
        employee_id: formData.employee_id,
        phone_number: formData.phone_number,
        subject_specialization: formData.subject_specialization,
        date_of_joining: dayjs(formData.date_of_joining).format('YYYY-MM-DD'),
      };

      const response = await axiosPrivate.post('/teachers/', teacherData);
      
      setSnackbar({
        open: true,
        message: 'Teacher registered successfully!',
        severity: 'success'
      });

      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        employee_id: '',
        phone_number: '',
        subject_specialization: '',
        date_of_joining: dayjs(),
      });

    } catch (error) {
      console.error('Error registering teacher:', error);
      
      let errorMessage = 'Failed to register teacher. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.user) {
          const userErrors = error.response.data.user;
          if (userErrors.username) {
            errorMessage = `Username: ${userErrors.username[0]}`;
          } else if (userErrors.email) {
            errorMessage = `Email: ${userErrors.email[0]}`;
          }
        } else if (error.response.data.employee_id) {
          errorMessage = `Employee ID: ${error.response.data.employee_id[0]}`;
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box 
        sx={{ 
          minHeight: '100vh', 
          backgroundColor: '#f5f7fa',
          py: 4,
          px: 2
        }}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonAdd sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Register New Teacher
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Add a new teacher to the school management system
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'visible'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: '#1976d2', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 3
                    }}
                  >
                    <Person /> Account Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={formData.username}
                        onChange={handleInputChange('username')}
                        error={!!errors.username}
                        helperText={errors.username}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.first_name}
                        onChange={handleInputChange('first_name')}
                        error={!!errors.first_name}
                        helperText={errors.first_name}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.last_name}
                        onChange={handleInputChange('last_name')}
                        error={!!errors.last_name}
                        helperText={errors.last_name}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: '#1976d2', 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 3
                    }}
                  >
                    <Work /> Professional Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Employee ID"
                        value={formData.employee_id}
                        onChange={handleInputChange('employee_id')}
                        error={!!errors.employee_id}
                        helperText={errors.employee_id}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Badge color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone_number}
                        onChange={handleInputChange('phone_number')}
                        error={!!errors.phone_number}
                        helperText={errors.phone_number}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Subject Specialization"
                        value={formData.subject_specialization}
                        onChange={handleInputChange('subject_specialization')}
                        error={!!errors.subject_specialization}
                        helperText={errors.subject_specialization}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Work color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Date of Joining"
                        value={formData.date_of_joining}
                        onChange={handleDateChange}
                       enableAccessibleFieldDOMStructure={false}
                        slots={{
                          textField: TextField,
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.date_of_joining,
                            helperText: errors.date_of_joining,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarToday color="action" />
                                </InputAdornment>
                              ),
                            },
                            sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                        }
                      }}
                    >
                      {loading ? 'Registering...' : 'Register Teacher'}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        setFormData({
                          username: '',
                          email: '',
                          password: '',
                          first_name: '',
                          last_name: '',
                          employee_id: '',
                          phone_number: '',
                          subject_specialization: '',
                          date_of_joining: dayjs(),
                        });
                        setErrors({});
                      }}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                      }}
                    >
                      Reset Form
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Box>
        </Fade>

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
    </LocalizationProvider>
  );
};

export default RegisterTeacher;