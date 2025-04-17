import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && error.response.data.message === "Token hết hạn" && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const token = localStorage.getItem("accessToken");
                const { data } = await axios.post(`${API_URL}/refresh-token`, {}, {
                    withCredentials: true,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                })

                localStorage.setItem("accessToken", data.metadata);

                api.defaults.headers["Authorization"] = `Bearer ${data.metadata}`;
                originalRequest.headers["Authorization"] = `Bearer ${data.metadata}`;
                return api(originalRequest);
            } catch (error) {
                console.error("lỗi RFToken", error);
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
)

export const get = async (endpoint: string) => {
    try {
        const { data } = await api.get(endpoint);
        return data;
    } catch (error) {
        console.error("lỗi get", error);
        return error;
    }
}

export const post = async (endpoint: string, body: any, config?: any) => {
    try {
        const { data } = await api.post(endpoint, body, config || {});
        return data;
    } catch (error: any) {
        console.error("lỗi post", error);
        return error.response.data.message;
    }
}

export const upd = async (endpoint: string, body?: any) => {
    try {
        const { data } = await api.put(endpoint, body);
        return data;
    } catch (error: any) {
        console.error("lỗi put", error);
        return error.response.data.message;
    }
}

export const del = async (endpoint: string) => {
    try {
        const { data } = await api.delete(endpoint);
        return data;
    } catch (error: any) {
        console.error("lỗi delete", error);
        return error.response.data.message;
    }
}