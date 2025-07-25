import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  School,
  EmojiEvents,
  CheckCircle,
  Subject,
  Person,
  Schedule
} from '@mui/icons-material';
import axiosPrivate from '../api/axiosPrivate';
import { Navigate, useNavigate } from 'react-router-dom';

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axiosPrivate.get('/exams/my_marks/');
        setResults(response.data || []);
        console.log('results',response.data);
        
    
    
        
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const calculateStats = () => {
    if (results.length === 0) return { totalExams: 0, averageScore: 0, highestScore: 0, totalMarks: 0 };

    const totalExams = results.length;
    const totalMarks = results.reduce((sum, result) => sum + result.marks, 0);
    const totalPossible = results.reduce((sum, result) => sum + result.total_questions, 0);
    const averageScore = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;
    const highestScore = Math.max(...results.map(result => (result.marks / result.total_questions) * 100));

    return {
      totalExams,
      averageScore: averageScore.toFixed(1),
      highestScore: highestScore.toFixed(1),
      totalMarks
    };
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: '#4caf50' };
    if (percentage >= 80) return { grade: 'A', color: '#8bc34a' };
    if (percentage >= 70) return { grade: 'B', color: '#ff9800' };
    if (percentage >= 60) return { grade: 'C', color: '#ff5722' };
    return { grade: 'F', color: '#f44336' };
  };

  const stats = calculateStats();

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
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Assessment sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  My Results
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  View your exam performance and grades
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
                    <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#4caf50' }}>
                        {stats.totalExams}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Exams Taken
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
                    <TrendingUp sx={{ fontSize: 40, color: '#2196f3' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#2196f3' }}>
                        {stats.averageScore}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Score
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
                    <EmojiEvents sx={{ fontSize: 40, color: '#ff9800' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff9800' }}>
                        {stats.highestScore}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Highest Score
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
                    <School sx={{ fontSize: 40, color: '#9c27b0' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#9c27b0' }}>
                        {stats.totalMarks}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Marks
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Results Table */}
          <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2196f3', fontWeight: 600 }}>
                Detailed Results ({results.length})
              </Typography>

              {results.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Assessment sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No results available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Take some exams to see your results here
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow  sx={{ backgroundColor: '#f5f7fa' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Exam Title</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Percentage</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date Taken</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((result) => {
                        const percentage = (result.marks / result.total_questions) * 100;
                        const gradeInfo = getGrade(percentage);
                        
                        return (
                          <TableRow onClick={() => navigate(`/dashboard/marksheet/${result.exam}`)}  key={result.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="600">
                                {result.exam_title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={result.exam_subject} 
                                size="small" 
                                sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="600">
                                  {result.marks}/{result.total_questions}
                                </Typography>
                                <Box sx={{ width: 60, ml: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={percentage} 
                                    sx={{ 
                                      height: 6, 
                                      borderRadius: 3,
                                      backgroundColor: '#e0e0e0',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: gradeInfo.color
                                      }
                                    }}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="600">
                                {percentage.toFixed(1)}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={gradeInfo.grade} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: `${gradeInfo.color}20`, 
                                  color: gradeInfo.color,
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(result.submitted_at).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
};

export default StudentResults;