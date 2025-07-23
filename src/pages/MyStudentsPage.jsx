import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosPrivate from "../api/axiosPrivate";
import StudentTable from "../components/StudentTable";

export default function MyStudentsPage() {
  const [myStudents, setMyStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchMyStudents = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const res = await axiosPrivate.get("/mystudents/");
      
      const studentsData = res.data.results || res.data;
      setMyStudents(Array.isArray(studentsData) ? studentsData : []);
      setError("");
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        "Failed to load students."
      );
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyStudents();
  }, []);

  const handleStudentUpdate = (updatedStudent) => {
    setMyStudents(prev => 
      prev.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      )
    );
  };

  const handleRefresh = () => {
    fetchMyStudents(true);
  };

  const handleAddStudent = () => {
    navigate("/dashboard/students/register"); 
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                My Students
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and view your assigned students
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddStudent}
                color="primary"
              >
                Add Student
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 0 }}>
          {myStudents.length > 0 ? (
            <StudentTable 
              students={myStudents} 
              onStudentUpdate={handleStudentUpdate}
            />
          ) : (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No students assigned yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by adding students to your class
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddStudent}
              >
                Add Your First Student
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}