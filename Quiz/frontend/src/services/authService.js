import api from './api';

const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });


            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Đã có lỗi xảy ra' };
        }
    },

    register: async (username, email, password) => {
        try {
            const res = await api.post('/auth/register', {
                username,
                email,
                password
            })
            return res.data;
        } catch (error) {
            throw error.response?.data || { message: 'Đã có lỗi xảy ra' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export default authService;
