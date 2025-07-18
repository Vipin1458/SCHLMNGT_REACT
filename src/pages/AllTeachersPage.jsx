import { useEffect, useState } from "react";
import {
  Container, Typography, CircularProgress, Alert, Button,
  Grid, Card, CardContent, Dialog, DialogTitle, DialogContent,
  DialogActions, Box, Pagination
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material"
import axiosPrivate from "../api/axiosPrivate";
import { useNavigate } from "react-router-dom";

export default function AllTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [count, setCount] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const navigate = useNavigate();

  const fetchTeachers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosPrivate.get(`/teachers/?page=${page}`);
      setTeachers(res.data.results || []);
      setCount(Math.ceil(res.data.count / 10));
    } catch (err) {
      setError("Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(page);
  }, [page]);
  const handleExportTeachers = async () => {
  try {
    const response = await axiosPrivate.get("/export/teachers", {
      responseType: "blob", 
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "teachers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert("Failed to export teachers.");
  }
};


  const handleDelete = async () => {
    try {
      await axiosPrivate.delete(`/teachers/${selectedTeacher.id}/`);
      setTeachers((prev) => prev.filter((t) => t.id !== selectedTeacher.id));
      setDeleteConfirmOpen(false);
      setSelectedTeacher(null);
    } catch (err) {
      alert("Failed to delete teacher.");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h5" gutterBottom>All Teachers</Typography>
      <Button
        variant="contained"
        sx={{ mb: 3 }}
        onClick={() => navigate("/dashboard/teachers/register")}
      >
        Register Teacher
      </Button>
      <Button
  variant="outlined"
  sx={{ mb: 3, ml: 2 }}
  onClick={handleExportTeachers}
>
  Export Teachers
</Button>


      {/* Card Grid */}
      <Grid container spacing={3}>
        {teachers.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t.id}>
            <Card
  sx={{
    boxShadow: 3,
    p: 2,
    display: "flex",
    flexDirection: "column",
    gap: 1,
    height: "100%",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: 6,
      cursor: "pointer",
    },
  }}
  onClick={() => setSelectedTeacher(t)}
>
  <CardContent sx={{ flexGrow: 1 }}>
    <Typography variant="h6" gutterBottom>
      👩‍🏫 {t.user.username}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      <strong>Subject:</strong> {t.subject_specialization || "N/A"}
    </Typography>
  </CardContent>
</Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={count}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
        />
      </Box>

      {/* Detail Modal */}
      <Dialog
  open={!!selectedTeacher}
  onClose={() => setSelectedTeacher(null)}
>
  <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    Teacher Details
    <IconButton
      aria-label="close"
      onClick={() => setSelectedTeacher(null)}
      sx={{ ml: 2 }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers>
    <Typography><strong>Username:</strong> {selectedTeacher?.user.username}</Typography>
    <Typography><strong>Email:</strong> {selectedTeacher?.user.email}</Typography>
    <Typography><strong>Phone:</strong> {selectedTeacher?.phone_number}</Typography>
    <Typography><strong>Subject:</strong> {selectedTeacher?.subject_specialization}</Typography>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => {
        navigate(`/dashboard/teachers/edit/${selectedTeacher.id}`);
      }}
    >
      Edit
    </Button>
    <Button
      color="error"
      onClick={() => setDeleteConfirmOpen(true)}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete teacher <strong>{selectedTeacher?.user.username}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
