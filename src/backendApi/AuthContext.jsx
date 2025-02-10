import { createContext, useState, useContext, useEffect } from "react";
import AuthService from "./AuthService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    const response = await axios.get('http://localhost:8080/api/auth/user');
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                // Clear invalid auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

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
            isAuthenticated: !!user 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;