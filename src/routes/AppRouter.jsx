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


const ProtectedRoute = ({ children }) => {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" /> },
  { path: "/login", element: <LoginForm /> },
//   { path: "/register", element: <RegisterPage /> },
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
}


     
    ],
  },
]);

export default router;
