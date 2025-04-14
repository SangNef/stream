import { createAsyncThunk } from "@reduxjs/toolkit";
import { login as loginAPI, register as registerAPI, getProfile as getProfileAPI } from "~/api/auth";

// Thunk: Xử lý đăng nhập
export const login = createAsyncThunk(
    "auth/login",
    async (credentials: { email: string; password: string }, { rejectWithValue, dispatch }) => {
        try {
            const response = await loginAPI(credentials.email, credentials.password);
            console.log("response", response);
            if (response?.metadata) {
                localStorage.setItem("accessToken", response?.metadata.accessToken);
                dispatch(getProfile()); 
                return response.metadata;
            } else {
                return rejectWithValue(response);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk: Xử lý đăng ký
export const register = createAsyncThunk(
    "auth/register",
    async (credentials: { username: string; password: string; loginIp: string }, { rejectWithValue, dispatch }) => {
        try {
            const response = await registerAPI(credentials.username, credentials.password, credentials.loginIp);
            if (response?.accessToken) {
                localStorage.setItem("accessToken", response.accessToken);
                dispatch(getProfile());
                return response.accessToken;
            } else {
                return rejectWithValue(response.response.data.message);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk: Lấy thông tin user
export const getProfile = createAsyncThunk("auth/getProfile", async (_, { rejectWithValue }) => {
    try {
        const response = await getProfileAPI();
        return response.metadata;
    } catch (error: any) {
        localStorage.removeItem("accessToken");
        return rejectWithValue(error.message);
    }
});
