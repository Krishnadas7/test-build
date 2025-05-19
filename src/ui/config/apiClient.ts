import axios from 'axios';

const baseURL = import.meta.env.VITE_APP_BASE_URL;
console.log('🚀 ~ baseURL:', baseURL);

const apiClient = axios.create({
    baseURL,
});

export default apiClient;
