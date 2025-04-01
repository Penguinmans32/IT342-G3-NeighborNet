import { Navigate } from 'react-router-dom';
import { useAuth } from '../backendApi/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return null;
    }

    const isAdmin = user?.role && 
        (Array.isArray(user.role) 
            ? user.role.includes('ROLE_ADMIN') 
            : user.role === 'ROLE_ADMIN');

    if (!user || !isAdmin) {
        return <Navigate to="/admin/login" replace={true} />;
    }

    return children;
};

export default AdminRoute;