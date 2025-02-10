import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

class AuthService {
    async login(username, password) {
        try {
            const response = await axios.post(API_URL + 'login', {
                username,
                password
            });
            const token = response.data.token || response.data.accessToken;
            if (token) {
                localStorage.setItem("user", JSON.stringify(response.data));
                localStorage.setItem("token", token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const userResponse = await axios.get('http://localhost:8080/api/auth/user');
                return userResponse.data;
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async register(username, email, password) {
        try {
            const response = await axios.post(API_URL + 'signup', {
                username,
                email,
                password
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common['Authorization'];
    }

    getCurrentUser() {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        
        try {
            const user = JSON.parse(userStr);
            return user;
        } catch (e) {
            return null;
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