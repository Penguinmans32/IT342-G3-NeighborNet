import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../backendApi/AuthContext';
import { useEffect, useState } from 'react';
import LoadingScreen from './SplashScreen/LoadingSreen';

const ProtectedRoute = ({ children }) => {
    const { user, requireAuth, loading } = useAuth();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await requireAuth();
            setIsChecking(false);
            if (!isAuth) {
                window.location.replace('/');
            }
        };
        checkAuth();
    }, [requireAuth]);

    if (loading || isChecking) {
        return <LoadingScreen 
            isLoading={true}
            message="Checking your credentials..."
            timeout={5000}
            onTimeout={() => setIsChecking(false)}
        />;
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;