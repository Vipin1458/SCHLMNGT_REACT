import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import DashboardLayout from "../components/DashboardLayout";
import DashboardHome from "../components/DashboardHome";
import { useAuth } from "../context/AuthContext";
import ProfilePage from "../pages/ProfilePage";


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
  
},{
  path: "teachers",
  element: <div>All Teachers (Admin only)</div>,
},
{
  path: "students",
  element: <div>All Students (Admin only)</div>,
},
{
  path: "exams",
  element: <div>All Exams (Admin)</div>,
}

      // more nested routes go here
    ],
  },
]);

export default router;
