import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";



export default function StudentTable({ students = [], onRowClick }) {
 
  const validStudents = Array.isArray(students) ? students : [];

  if (validStudents.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 2 }}>
        No students found.
      </Typography>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Username</TableCell>
          <TableCell>Roll Number</TableCell>
          <TableCell>Grade</TableCell>
          <TableCell>Phone</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {validStudents.map((student) => (
          <TableRow
            key={student.id}
            hover
            style={{ cursor: onRowClick ? "pointer" : "default" }}
            onClick={() => onRowClick && onRowClick(student)}
          >
            <TableCell>{student.user?.username || "N/A"}</TableCell>
            <TableCell>{student.roll_number}</TableCell>
            <TableCell>{student.grade}</TableCell>
            <TableCell>{student.phone_number}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
