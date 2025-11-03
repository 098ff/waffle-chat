import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Auth endpoints
export const authAPI = {
    register: (data: { fullName: string; email: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    checkAuth: () => api.get('/auth/check'),
    getMe: () => api.get('/auth/me'),
};

// Chat endpoints
export const chatAPI = {
    createChat: (data: {
        type: 'private' | 'group';
        name?: string;
        participants: string[];
    }) => api.post('/chats', data),
    getChats: () => api.get('/chats'),
    getChatMessages: (chatId: string) => api.get(`/chats/${chatId}/messages`),
    sendMessage: (chatId: string, data: { text?: string; image?: string }) =>
        api.post(`/chats/${chatId}/messages`, data),
};

// Message endpoints
export const messageAPI = {
    getAllContacts: () => api.get('/messages/contacts'),
    getChatPartners: () => api.get('/messages/chats'),
    getMessagesByUserId: (userId: string) => api.get(`/messages/${userId}`),
    sendMessage: (userId: string, data: { text?: string; image?: string }) =>
        api.post(`/messages/send/${userId}`, data),
};

export default api;
