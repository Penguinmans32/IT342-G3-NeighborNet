import { Navigate } from "react-router-dom";
import { useAuth } from "../backendApi/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const token = localStorage.getItem('token');
  
    if (loading) {
      return <div>Loading...</div>;
    }
  
    if (!user || !token) {
      return <Navigate to="/" />;
    }
  
    return children;
  };

export default ProtectedRoute;