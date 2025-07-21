import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import DashboardLayout from "../components/DashboardLayout";
import DashboardHome from "../components/DashboardHome";
import { useAuth } from "../context/AuthContext";
import ProfilePage from "../pages/ProfilePage";
import AllTeachersPage from "../pages/AllTeachersPage";
import AllStudentsPage from "../pages/AllStudentsPage";
import AllExamsPage from "../pages/AllExamsPage";
import EditTeacherPage from "../pages/EditTeacherPage";
import RegisterStudentPage from "../pages/RegisterStudentPage";
import RegisterTeacherPage from "../pages/RegisterTeacherPage";
import MyStudentsPage from "../pages/MyStudentsPage";
import TeacherExamsPage from "../pages/TeacherExamsPage";
import CreateExamForm from "../components/CreateExamForm";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import ResetPasswordPage from "../pages/ResetPassword";
import ForgotPasswordPage from "../pages/ForgotPassword";



const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" /> },
  { path: "/login", element: <LoginForm /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "", element: <DashboardHome /> },
      {
  path: "profile",
  element: <ProfilePage />,
  
},
{ path: "", element: <DashboardHome /> },
  { path: "profile", element: <ProfilePage /> },
  { path: "teachers", element: <AllTeachersPage /> },
  { path: "students", element: <AllStudentsPage /> },
  { path: "exams", element: <AllExamsPage /> },
  {
  path: "teachers/edit/:id",
  element: <EditTeacherPage />
},{
  path: "/dashboard/students/register",
  element: <RegisterStudentPage />,
},
{
  path: "/dashboard/teachers/register",
  element: <RegisterTeacherPage />,
},
 {
    path: "/dashboard/mystudents",
    element: <MyStudentsPage />,
  },
  { path: "/dashboard/teacher/students", element: <Navigate to="/dashboard/mystudents" /> },
 {
  path: "/dashboard/teacher/exams",
  element: <TeacherExamsPage />
},
{
  path: "/dashboard/exams/create",
  element: <CreateExamForm />,
}
  
    ],
  },
]);

export default router;
