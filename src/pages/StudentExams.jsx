import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Fade,
  Avatar,
  Divider
} from '@mui/material';
import {
  Quiz,
  Schedule,
  Person,
  Subject,
  School,
  PlayArrow,
  CheckCircle,
  AccessTime
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosPrivate from '../api/axiosPrivate';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [attendedExams, setAttendedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, attendedRes] = await Promise.all([
          axiosPrivate.get('/exams/'),
          axiosPrivate.get('/exams/my_marks/')
        ]);

        setExams(examsRes.data?.results || examsRes.data || []);
        setAttendedExams(attendedRes.data?.results || attendedRes.data || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isExamAttended = (examId) => {
    return attendedExams.some(attended => attended.exam === examId);
  };

  const handleAttendExam = (examId) => {
    navigate(`/dashboard/attend-exam/${examId}`);
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
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Quiz sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  My Exams
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  View and attend your assigned exams
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Quiz sx={{ fontSize: 40, color: '#4caf50' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#4caf50' }}>
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
                    <CheckCircle sx={{ fontSize: 40, color: '#2196f3' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#2196f3' }}>
                        {attendedExams.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
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
                    <AccessTime sx={{ fontSize: 40, color: '#ff9800' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff9800' }}>
                        {exams.length - attendedExams.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
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
                    <Subject sx={{ fontSize: 40, color: '#9c27b0' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#9c27b0' }}>
                        {new Set(exams.map(exam => exam.subject)).size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Subjects
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Exams List */}
          <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 600 }}>
                Available Exams ({exams.length})
              </Typography>

              {exams.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Quiz sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No exams available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check back later for new exams
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {exams.map((exam) => {
                    const isAttended = isExamAttended(exam.id);
                    
                    return (
                      <Grid item xs={12} md={6} lg={4} key={exam.id}>
                        <Card 
                          elevation={0} 
                          sx={{ 
                            borderRadius: 3,
                            border: '1px solid #e0e0e0',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            {/* Exam Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                  {exam.title}
                                </Typography>
                                <Chip 
                                  label={isAttended ? 'Completed' : 'Pending'} 
                                  size="small"
                                  color={isAttended ? 'success' : 'warning'}
                                  icon={isAttended ? <CheckCircle /> : <AccessTime />}
                                />
                              </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Exam Details */}
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Subject sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">Subject:</Typography>
                                <Typography variant="body2" fontWeight="600">{exam.subject}</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <School sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">Class:</Typography>
                                <Typography variant="body2" fontWeight="600">{exam.target_class}</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Person sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">Teacher:</Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {exam.teacher?.user?.first_name && exam.teacher?.user?.last_name 
                                    ? `${exam.teacher.user.first_name} ${exam.teacher.user.last_name}`
                                    : exam.teacher?.user?.username || 'N/A'}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Quiz sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">Questions:</Typography>
                                <Typography variant="body2" fontWeight="600">{exam.questions_count || 5}</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Schedule sx={{ fontSize: 18, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">Duration:</Typography>
                                <Typography variant="body2" fontWeight="600">30 minutes</Typography>
                              </Box>
                            </Box>

                            {/* Action Button */}
                            <Button
                              variant={isAttended ? "outlined" : "contained"}
                              fullWidth
                              disabled={isAttended}
                              onClick={() => handleAttendExam(exam.id)}
                              startIcon={isAttended ? <CheckCircle /> : <PlayArrow />}
                              sx={{
                                py: 1.5,
                                borderRadius: 2,
                                ...(isAttended ? {
                                  color: '#4caf50',
                                  borderColor: '#4caf50',
                                } : {
                                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                  boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                                  '&:hover': {
                                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                                  }
                                })
                              }}
                            >
                              {isAttended ? 'Already Completed' : 'Start Exam'}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
};

export default StudentExams;