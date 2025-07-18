import { useEffect, useState } from "react";
import {
  Container, Typography, TextField, Button, MenuItem,
  CircularProgress, Alert, Box
} from "@mui/material";
import axiosPrivate from "../api/axiosPrivate";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreateExamForm() {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
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

  const userRole = auth?.user?.role?.toLowerCase();

  useEffect(() => {
    if (userRole === "admin") {
      axiosPrivate.get("/teachers/")
        .then(res => setTeachers(res.data.results || res.data))
        .catch(() => setError("Failed to load teachers."));
    }
  }, [userRole]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: formData.title,
      subject: formData.subject,
      questions: formData.questions
    };

    if (userRole === "admin" && formData.teacher_id) {
      payload.teacher_id = formData.teacher_id;
    }

    try {
      await axiosPrivate.post("/exams/", payload);
      navigate("/dashboard/exams");
    } catch (err) {
      console.error(err);
      setError("Failed to create exam. Please check your input.");
    } finally {
      setSaving(false);
    }
  };

  if (!auth?.user) return <CircularProgress />;

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>Create Exam</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <TextField
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />

        {userRole === "admin" && (
          <TextField
            select
            label="Assign Teacher"
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            required
          >
            {teachers.map((teacher) => (
  <MenuItem key={teacher.id} value={teacher.id}>
    {teacher.user?.username || `Teacher ${teacher.id}`}
  </MenuItem>
))}


          </TextField>
        )}

        <Typography variant="h6" mt={2}>Questions</Typography>
        {formData.questions.map((q, index) => (
          <Box key={index} sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
            <TextField
              label={`Question ${index + 1}`}
              value={q.question_text}
              onChange={(e) => handleQuestionChange(index, "question_text", e.target.value)}
              required
            />
            {[1, 2, 3, 4].map((opt) => (
              <TextField
                key={opt}
                label={`Option ${opt}`}
                value={q[`option${opt}`]}
                onChange={(e) => handleQuestionChange(index, `option${opt}`, e.target.value)}
                required
              />
            ))}
            <TextField
              select
              label="Correct Option"
              value={q.correct_option}
              onChange={(e) => handleQuestionChange(index, "correct_option", e.target.value)}
              required
            >
              <MenuItem value="1">Option 1</MenuItem>
              <MenuItem value="2">Option 2</MenuItem>
              <MenuItem value="3">Option 3</MenuItem>
              <MenuItem value="4">Option 4</MenuItem>
            </TextField>
          </Box>
        ))}

        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Creating..." : "Create Exam"}
        </Button>
      </Box>
    </Container>
  );
}
