import {
  Container, TextField, Button, Typography, MenuItem, Grid, Alert,
  FormControl, InputLabel, Select, Box, Paper, Fade, InputAdornment,
  Divider, CircularProgress, Snackbar
} from "@mui/material";
import {
  Person, Email, Phone, School, CalendarToday, Badge,
  PersonAdd, Upload, FileUpload
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const studentSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(4).required("Password is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  roll_number: yup.string().required("Roll number is required"),
  phone_number: yup.string().required("Phone number is required"),
  grade: yup.string().required("Grade is required"),
  class_name: yup.string().required("Class is required"),
  date_of_birth: yup.string().required("Date of birth is required"),
  admission_date: yup.string().required("Admission date is required"),
  assigned_teacher: yup.number().when('$isAdmin', {
    is: true,
    then: (schema) => schema.required("Assigned teacher is required"),
    otherwise: (schema) => schema.notRequired()
  }),
  status: yup.number().required("Status is required"),
});

export default function RegisterStudentPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [file, setFile] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: yupResolver(studentSchema, { context: { isAdmin: currentUser?.role === 'admin' } }),
    defaultValues: {
      status: 1
    }
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
       
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(userInfo);
      } catch (err) {
        console.error("Failed to get current user info");
      }
    };

    const fetchTeachers = async () => {
      try {
        const res = await axiosPrivate.get("/teachers/");
        setTeachers(res.data.results || res.data);
      } catch (err) {
        console.error("Failed to load teachers");
        setSnackbar({
          open: true,
          message: "Failed to load teachers",
          severity: 'error'
        });
      }
    };

    fetchCurrentUser();
    fetchTeachers();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        user: {
          username: data.username,
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
          role: "student",
        },
        roll_number: data.roll_number,
        phone_number: data.phone_number,
        grade: data.grade,
        class_name: data.class_name,
        date_of_birth: data.date_of_birth,
        admission_date: data.admission_date,
        status: parseInt(data.status),
      };

     
      if (currentUser?.role === 'admin' && data.assigned_teacher) {
        payload.assigned_teacher = parseInt(data.assigned_teacher);
      }
     

      await axiosPrivate.post("/students/", payload);
      
      setSnackbar({
        open: true,
        message: "Student registered successfully!",
        severity: 'success'
      });

     
      reset();
      
   
      setTimeout(() => {
        navigate("/dashboard/students");
      }, 1500);

    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage = "Failed to register student.";
      
      if (err.response?.data) {
        const serverErrors = err.response.data;
        if (typeof serverErrors === 'string') {
          errorMessage = serverErrors;
        } else if (serverErrors.user) {
          
          const userErrors = serverErrors.user;
          if (userErrors.username) {
            errorMessage = `Username: ${userErrors.username[0]}`;
          } else if (userErrors.email) {
            errorMessage = `Email: ${userErrors.email[0]}`;
          }
        } else if (serverErrors.roll_number) {
          errorMessage = `Roll Number: ${serverErrors.roll_number[0]}`;
        } else {
          const messages = [];
          for (const key in serverErrors) {
            if (Array.isArray(serverErrors[key])) {
              messages.push(`${key}: ${serverErrors[key].join(", ")}`);
            } else {
              messages.push(`${key}: ${serverErrors[key]}`);
            }
          }
          errorMessage = messages.join(" | ");
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

  const handleImport = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: "Please select a CSV file.",
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      await axiosPrivate.post("import/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setSnackbar({
        open: true,
        message: "Students imported successfully!",
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate("/dashboard/students");
      }, 1500);
      
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to import students",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa', py: 4, px: 2 }}>
      <Fade in={true} timeout={800}>
        <Container maxWidth="md">
        
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
                  Register New Student
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {isAdmin ? 'Add a new student and assign a teacher' : 'Add a new student to your class'}
                </Typography>
              </Box>
            </Box>
          </Paper>

    
          {isAdmin && (
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Upload /> Bulk Import
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowImport(!showImport)}
                  startIcon={<FileUpload />}
                >
                  {showImport ? "Cancel Import" : "Import Students"}
                </Button>
              </Box>

              {showImport && (
                <Box sx={{ display: "flex", gap: 2, alignItems: 'center' }}>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ flex: 1, padding: '8px' }}
                  />
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={handleImport}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </Button>
                </Box>
              )}
            </Paper>
          )}

         
          <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Box sx={{ p: 4 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
          
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
                      {...register("username")}
                      error={!!errors.username}
                      helperText={errors.username?.message}
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
                      label="Email"
                      type="email"
                      {...register("email")}
                      error={!!errors.email}
                      helperText={errors.email?.message}
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
                      type="password"
                      {...register("password")}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      {...register("first_name")}
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      {...register("last_name")}
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
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
                  <School /> Student Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Roll Number"
                      {...register("roll_number")}
                      error={!!errors.roll_number}
                      helperText={errors.roll_number?.message}
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
                      {...register("phone_number")}
                      error={!!errors.phone_number}
                      helperText={errors.phone_number?.message}
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
                      label="Grade"
                      {...register("grade")}
                      error={!!errors.grade}
                      helperText={errors.grade?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Class"
                      {...register("class_name")}
                      error={!!errors.class_name}
                      helperText={errors.class_name?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date of Birth"
                      InputLabelProps={{ shrink: true }}
                      {...register("date_of_birth")}
                      error={!!errors.date_of_birth}
                      helperText={errors.date_of_birth?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Admission Date"
                      InputLabelProps={{ shrink: true }}
                      {...register("admission_date")}
                      error={!!errors.admission_date}
                      helperText={errors.admission_date?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                 
                  {isAdmin && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.assigned_teacher}>
                        <InputLabel id="teacher-label">Assigned Teacher</InputLabel>
                        <Controller
                          name="assigned_teacher"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              labelId="teacher-label"
                              label="Assigned Teacher"
                              sx={{ borderRadius: 2 }}
                            >
                              <MenuItem value="">
                                <em>Select Teacher</em>
                              </MenuItem>
                              {teachers.map((teacher) => (
                                <MenuItem key={teacher.id} value={teacher.id}>
                                  {teacher.user.first_name} {teacher.user.last_name} ({teacher.employee_id})
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.assigned_teacher && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                            {errors.assigned_teacher.message}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  )}

               
                  {isTeacher && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Assigned Teacher"
                        value={`${currentUser.full_name || currentUser.username} (You)`}
                        disabled
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2,
                            backgroundColor: '#f5f5f5'
                          } 
                        }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      {...register("status")}
                      error={!!errors.status}
                      helperText={errors.status?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value={1}>Active</MenuItem>
                      <MenuItem value={0}>Inactive</MenuItem>
                    </TextField>
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
                    {loading ? 'Registering...' : 'Register Student'}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => reset()}
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
            </Box>
          </Paper>
        </Container>
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
  );
}