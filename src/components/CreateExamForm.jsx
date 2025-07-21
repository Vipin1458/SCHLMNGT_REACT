import React, { useEffect, useState } from "react";
import {
  Container, Typography, TextField, Button, MenuItem,
  CircularProgress, Alert, Box, Paper, Grid, Divider,
  InputAdornment, Fade, Snackbar
} from "@mui/material";
import {
  Quiz, Subject, Person, QuestionAnswer, CheckCircle,
  School, Assignment
} from "@mui/icons-material";
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";

export default function CreateExamForm() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    target_class: "",
    teacher_id: "",
    questions: Array.from({ length: 5 }, () => ({
      question_text: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_option: "1"
    }))
  });

  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
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

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.subject.trim()) {
      setError("Subject is required");
      return false;
    }
    if (!formData.target_class.trim()) {
      setError("Target class is required");
      return false;
    }
    if (currentUser?.role === 'admin' && !formData.teacher_id) {
      setError("Please assign a teacher");
      return false;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }
      if (!q.option1.trim() || !q.option2.trim() || !q.option3.trim() || !q.option4.trim()) {
        setError(`All options for Question ${i + 1} are required`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    const payload = {
      title: formData.title,
      subject: formData.subject,
      target_class: formData.target_class,
      questions: formData.questions
    };

    if (currentUser?.role === 'admin' && formData.teacher_id) {
      payload.teacher_id = formData.teacher_id;
    }

    try {
      await axiosPrivate.post("/exams/", payload);
      
      setSnackbar({
        open: true,
        message: "Exam created successfully!",
        severity: 'success'
      });

      setTimeout(() => {
        navigate("/dashboard/exams");
      }, 1500);

    } catch (err) {
      console.error('Create exam error:', err);
      
      let errorMessage = "Failed to create exam.";
      
      if (err.response?.data) {
        const serverErrors = err.response.data;
        if (typeof serverErrors === 'string') {
          errorMessage = serverErrors;
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

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!currentUser) return <CircularProgress />;

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
              <Quiz sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Create New Exam
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {isAdmin ? 'Create an exam and assign it to a teacher' : 'Create an exam for your students'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Box sx={{ p: 4 }}>
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
                  <Assignment /> Exam Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Exam Title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Quiz color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Subject color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Target Class"
                      name="target_class"
                      value={formData.target_class}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 10A, Grade 5, etc."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <School color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  {isAdmin && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Assign Teacher"
                        name="teacher_id"
                        value={formData.teacher_id}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        <MenuItem value="">
                          <em>Select Teacher</em>
                        </MenuItem>
                        {teachers.map((teacher) => (
                          <MenuItem key={teacher.id} value={teacher.id}>
                            {teacher.user?.first_name && teacher.user?.last_name 
                              ? `${teacher.user.first_name} ${teacher.user.last_name}` 
                              : teacher.user?.username || `Teacher ${teacher.id}`} ({teacher.employee_id})
                          </MenuItem>
                        ))}
                      </TextField>
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
                  <QuestionAnswer /> Questions (5 Required)
                </Typography>

                {formData.questions.map((q, index) => (
                  <Paper 
                    key={index} 
                    elevation={1} 
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      borderRadius: 2,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="600" 
                      sx={{ mb: 2, color: '#1976d2' }}
                    >
                      Question {index + 1}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Question Text"
                          value={q.question_text}
                          onChange={(e) => handleQuestionChange(index, "question_text", e.target.value)}
                          required
                          multiline
                          rows={2}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>

                      {[1, 2, 3, 4].map((opt) => (
                        <Grid item xs={12} sm={6} key={opt}>
                          <TextField
                            fullWidth
                            label={`Option ${opt}`}
                            value={q[`option${opt}`]}
                            onChange={(e) => handleQuestionChange(index, `option${opt}`, e.target.value)}
                            required
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                      ))}

                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          label="Correct Option"
                          value={q.correct_option}
                          onChange={(e) => handleQuestionChange(index, "correct_option", e.target.value)}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CheckCircle color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        >
                          <MenuItem value="1">Option 1</MenuItem>
                          <MenuItem value="2">Option 2</MenuItem>
                          <MenuItem value="3">Option 3</MenuItem>
                          <MenuItem value="4">Option 4</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <Quiz />}
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
                    {saving ? 'Creating Exam...' : 'Create Exam'}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setFormData({
                        title: "",
                        subject: "",
                        target_class: "",
                        teacher_id: "",
                        questions: Array.from({ length: 5 }, () => ({
                          question_text: "",
                          option1: "",
                          option2: "",
                          option3: "",
                          option4: "",
                          correct_option: "1"
                        }))
                      });
                      setError("");
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