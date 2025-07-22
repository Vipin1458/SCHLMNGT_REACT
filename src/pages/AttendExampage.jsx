import React, { useEffect, useState } from "react";
import {
  Container, Typography, Button, RadioGroup, FormControlLabel,
  Radio, Paper, Box, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, Fade,
  LinearProgress, Chip, Card, CardContent, Grid
} from "@mui/material";
import {
  Quiz, Timer, CheckCircle, Cancel, School,
  Assignment, Person, Subject
} from "@mui/icons-material";
import axiosPrivate from "../api/axiosPrivate";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AttendExam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const fetchExamDetails = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        axiosPrivate.get(`/exams/${examId}/`),
        axiosPrivate.get(`/exams/${examId}/questions/`)
      ]);
      
      setExam(examRes.data);
      setQuestions(questionsRes.data);
      
    
      const initialAnswers = {};
      questionsRes.data.forEach(q => {
        initialAnswers[q.id] = "";
      });
      setAnswers(initialAnswers);
      
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError("Failed to load exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleStartExam = () => {
    setExamStarted(true);
  };

  const handleAutoSubmit = async () => {
    await submitExam();
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const submitExam = async () => {
    setSubmitting(true);
    setShowConfirmDialog(false);

    try {
      const submissionData = {
        answers: questions.map(q => ({
          question_id: q.id,
          answer: answers[q.id] || ""
        }))
      };

      const response = await axiosPrivate.post(`/exams/${examId}/attend/`, submissionData);
      
      
      toast.success(`Exam submitted successfully! You scored ${response.data.marks}/${response.data.total}`);
      navigate("/dashboard/student/MyExams");
      
    } catch (err) {
      console.error('Submission error:', err);
      let errorMessage = "Failed to submit exam.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer !== "").length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredCount() / questions.length) * 100;
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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!examStarted) {
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
                textAlign: 'center'
              }}
            >
              <Quiz sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {exam?.title}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Ready to start your exam?
              </Typography>
            </Paper>

            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Subject color="primary" />
                      <Typography variant="h6" color="primary">Subject</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 4 }}>{exam?.subject}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <School color="primary" />
                      <Typography variant="h6" color="primary">Target Class</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 4 }}>{exam?.target_class}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Person color="primary" />
                      <Typography variant="h6" color="primary">Teacher</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 4 }}>
                      {exam?.teacher?.user?.first_name && exam?.teacher?.user?.last_name 
                        ? `${exam.teacher.user.first_name} ${exam.teacher.user.last_name}`
                        : exam?.teacher?.user?.username || 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Assignment color="primary" />
                      <Typography variant="h6" color="primary">Questions</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 4 }}>{questions.length} Questions</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Timer color="primary" />
                      <Typography variant="h6" color="primary">Time Limit</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ ml: 4 }}>30 Minutes</Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f7fa', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Instructions:
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                    <li>You have 30 minutes to complete this exam</li>
                    <li>Each question has 4 options, select the best answer</li>
                    <li>You can navigate between questions using the navigation buttons</li>
                    <li>Make sure to submit your exam before time runs out</li>
                    <li>Once submitted, you cannot change your answers</li>
                  </Typography>
                </Box>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartExam}
                    startIcon={<Quiz />}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      boxShadow: '0 4px 16px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      }
                    }}
                  >
                    Start Exam
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Fade>
      </Box>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa', py: 2 }}>
      <Container maxWidth="md">
        {/* Header with Timer and Progress */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {exam?.title}
            </Typography>
            <Chip
              icon={<Timer />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? "error" : "primary"}
              variant="filled"
              sx={{ fontSize: '1rem', px: 1 }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Progress: {getAnsweredCount()}/{questions.length} answered
              </Typography>
              <Typography variant="body2">
                {Math.round(getProgressPercentage())}% complete
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getProgressPercentage()} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </Paper>

        {/* Question Card */}
        <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" color="primary">
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <Chip
                icon={answers[currentQ?.id] ? <CheckCircle /> : <Cancel />}
                label={answers[currentQ?.id] ? "Answered" : "Not Answered"}
                color={answers[currentQ?.id] ? "success" : "default"}
                variant="outlined"
              />
            </Box>

            <Typography variant="h6" sx={{ mb: 3, lineHeight: 1.6 }}>
              {currentQ?.question_text}
            </Typography>

            <RadioGroup
              value={answers[currentQ?.id] || ""}
              onChange={(e) => handleAnswerChange(currentQ?.id, e.target.value)}
            >
              {[1, 2, 3, 4].map((optNum) => (
                <Paper
                  key={optNum}
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      borderColor: '#1976d2'
                    },
                    ...(answers[currentQ?.id] === optNum.toString() && {
                      backgroundColor: '#e3f2fd',
                      borderColor: '#1976d2'
                    })
                  }}
                >
                  <FormControlLabel
                    value={optNum.toString()}
                    control={<Radio />}
                    label={currentQ?.[`option${optNum}`]}
                    sx={{
                      width: '100%',
                      m: 0,
                      p: 2,
                      '& .MuiFormControlLabel-label': {
                        fontSize: '1rem',
                        lineHeight: 1.5
                      }
                    }}
                  />
                </Paper>
              ))}
            </RadioGroup>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                sx={{ borderRadius: 2 }}
              >
                Previous
              </Button>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle />}
                    sx={{ borderRadius: 2 }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Exam'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                    sx={{ borderRadius: 2 }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Question Navigation */}
        <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Question Navigation:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestion === index ? "contained" : "outlined"}
                size="small"
                onClick={() => setCurrentQuestion(index)}
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: 2,
                  ...(answers[questions[index]?.id] && currentQuestion !== index && {
                    backgroundColor: '#e8f5e8',
                    borderColor: '#4caf50',
                    color: '#2e7d32'
                  })
                }}
              >
                {index + 1}
              </Button>
            ))}
          </Box>
        </Paper>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>Submit Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your exam? You have answered {getAnsweredCount()} out of {questions.length} questions.
          </Typography>
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Once submitted, you cannot change your answers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={submitExam} variant="contained" color="success">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}