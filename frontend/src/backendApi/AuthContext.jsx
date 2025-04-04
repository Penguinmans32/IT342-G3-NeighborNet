import React, { createContext, useState, useContext, useEffect } from "react";
import AuthService from "./AuthService";
import  axios  from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const navigate = useNavigate();


    const publicRoutes = [
        '/',
        '/about',
        '/verify-email',
        '/admin/login',
        '/support',
        '/teaching-center',
        '/roadmap',
        '/careers',
        '/privacy',
        '/docs',
        '/blog',
        '/search',
        '/forgot-password',
        '/oauth2/redirect'
    ];


    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                return false;
            }
    
            if (!axios.defaults.headers.common['Authorization']) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await axios.get('http://localhost:8080/api/auth/user');
            console.log("User data from auth check:", response.data);
            setUser(response.data);
            return true;
        } catch (error) {
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error('System error occurred');
            }
    
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            return false;
        }
    };

    useEffect(() => {
        let mounted = true;
    
        const initializeAuth = async () => {
            if (!mounted) return;
    
            try {
                const isAuthenticated = await checkAuthStatus();
                if (!isAuthenticated && 
                    !publicRoutes.includes(window.location.pathname)) {
                    navigate('/', { replace: true });
                }
            } catch (error) {
                // silent error
            } finally {
                if (mounted) {
                    setLoading(false);
                    setInitialized(true);
                }
            }
        };
    
        initializeAuth();
    
        return () => {
            mounted = false;
        };
    }, []);


    const requireAuth = async () => {
        if (!initialized) return true; 
        if (!user) {
            const isAuthenticated = await checkAuthStatus();
            if (!isAuthenticated) {
                navigate('/');
                return false;
            }
        }
        return true;
    };

    const login = async (username, password) => {
        try {
            const response = await AuthService.login(username, password);
            setUser(response);
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error.message || 'Login failed';
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await AuthService.register(username, email, password);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            setUser,
            login, 
            register, 
            logout, 
            loading,
            requireAuth,
            isAuthenticated: !!user 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

class AuthErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
    }

    render() {
        if (this.state.hasError) {
            return null; 
        }

        return this.props.children;
    }
}

export const AuthProviderWithErrorBoundary = ({ children }) => {
    return (
        <AuthErrorBoundary>
            <AuthProvider>{children}</AuthProvider>
        </AuthErrorBoundary>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            user: null,
            loading: false,
            isAuthenticated: false
        };
    }
    return context;
};

export default AuthContext;