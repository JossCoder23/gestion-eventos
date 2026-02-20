import axios from 'axios';

const api = axios.create({
    baseURL: 'https://comerciald11.sg-host.com/api',
    withCredentials: true, // Importante para las cookies de sesión
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

export default api;