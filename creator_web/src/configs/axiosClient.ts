import axios from 'axios';
import setAxiosHeader from '../utils/setAxiosHeader';

const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    async (config) => setAxiosHeader(config),
    (error) => {
        Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;