import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const withAuthProtection = (Component, allowedRoles = []) => {
  return function ProtectedComponent(props) {
    const { auth } = useAuth();

    if (!auth) return <Navigate to="/login" />;

    if (allowedRoles.length && !allowedRoles.includes(auth.user?.role)) {
      return <Navigate to="/dashboard/profile" />;
    }

    return <Component {...props} />;
  };
};

export default withAuthProtection;
