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
import ResetPasswordPage from "../pages/ResetPassword";
import ForgotPasswordPage from "../pages/ForgotPassword";
import StudentExams from "../pages/StudentExams";
import StudentResults from "../pages/StudentResults";
import AttendExam from "../pages/AttendExampage";
import LoginRedirect from "./LoginRedirect";
import AnswerSheet from "../components/AnswerSheet";
import ChatPage from "../components/chatPage";





const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(auth?.user?.role)) {
    return <Navigate to="/dashboard/profile" />
  }

  return children;
};

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" /> },
   { path: "/login", element: <LoginRedirect /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute >  
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
       {
      path: "",
      element: (
        <ProtectedRoute allowedRoles={["admin", "teacher"]}>
          <DashboardHome />
        </ProtectedRoute>
      ),
    },
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
  path: "/dashboard/teacher/profile",
  element: <ProfilePage  />,                                  
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
  path: "/dashboard/messages",
  element: <ChatPage />
},
{
  path: "/dashboard/exams/create",
  element: <CreateExamForm />,
},
{
  path: "/dashboard/student/MyExams",
  element: <StudentExams />,
},
{
  path: "/dashboard/student/MyResults",
  element: <StudentResults />,
},{ path:"/dashboard/attend-exam/:examId", element:<AttendExam />},
{ path:"/dashboard/marksheet/:examId", element:<AnswerSheet />},
  
    ],
  },
]);

export default router;
