import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // ⛔ Wait until auth loads
  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role not allowed
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute