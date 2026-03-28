import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,

    setAuth: (user, token) => {
        set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    clearAuth: () => {
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;