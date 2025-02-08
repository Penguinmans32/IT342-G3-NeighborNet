import { createContext, useState, useContext, useEffect } from "react";
import AuthService from "./AuthService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialUser = AuthService.initializeAuth();
        if (initialUser) {
            setUser(initialUser);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await AuthService.login(username, password);
            setUser(response);
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
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