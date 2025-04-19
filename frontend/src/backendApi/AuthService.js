import axios from "axios";

const API_URL = "https://it342-g3-neighbornet.onrender.com/api/auth/";

class AuthService {
    async login(username, password) {
        try {
            const response = await axios.post(API_URL + 'login', {
                username: username.trim(),
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
    
            console.log('Login response:', response.data);
    
            if (response.data.success) {
                const authData = response.data.data;
                
                // Set temporary authorization to check user status
                axios.defaults.headers.common['Authorization'] = `Bearer ${authData.accessToken}`;
                
                // Check user status before proceeding
                const userResponse = await axios.get(`${API_URL}user`);
                const userData = userResponse.data.data; // Note: accessing nested data
    
                // Check if user is deleted first
                if (userData.deleted) {
                    // Clear any temporary auth headers
                    delete axios.defaults.headers.common['Authorization'];
                    throw new Error('This account has been deleted. Please contact support for assistance.');
                }
    
                // If not deleted, proceed with login
                localStorage.setItem("user", JSON.stringify(authData));
                localStorage.setItem("token", authData.accessToken);
                
                return userData;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            // Clear any authentication data that might have been set
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            delete axios.defaults.headers.common['Authorization'];
            
            console.error('Login error:', error);
            throw error.response?.data?.message || error.message || 'Login failed';
        }
    }

    async register(username, email, password) {
        try {
            const response = await axios.post(API_URL + 'signup', {
                username,
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    }

    logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common['Authorization'];
    }

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem("user");
            const token = localStorage.getItem("token");
            
            if (!userStr || !token) {
                return null;
            }
    
            // Add Bearer prefix when setting header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return JSON.parse(userStr);
        } catch (e) {
            console.error('Error getting current user:', e);
            return null;
        }
    }

    async refreshToken(refreshToken) {
        try {
            const response = await axios.post(API_URL + 'refreshtoken', {
                refreshToken: refreshToken
            });
            
            if (response.data.token) {
                const token = `Bearer ${response.data.token}`;
                localStorage.setItem("token", token);
                axios.defaults.headers.common['Authorization'] = token;
            }
            return response.data;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            throw error;
        }
    }

    getToken() {
        const user = this.getCurrentUser();
        return user?.accessToken;
    }

    initializeAuth() {
        const user = this.getCurrentUser();
        const token = localStorage.getItem("token");
        

        if (token && user) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return user;
        }
        return null;
    }
}

export default new AuthService();