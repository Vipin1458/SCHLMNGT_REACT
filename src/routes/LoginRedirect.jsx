
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";

const LoginRedirect = () => {
  const { auth } = useAuth();

  return auth ? <Navigate to="/dashboard" replace /> : <LoginForm />;
};

export default LoginRedirect;
