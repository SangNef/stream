import axiosClient from '../configs/axiosClient';

export interface ResponseForm<T> {
    message: string;
    data: T;
    statusCode: number;
    metadata?: any;
}


export const login = (data: any): Promise<ResponseForm<any>> => {
    return axiosClient.post(`/user/signin`, data);
};
export const getProfile = (): Promise<ResponseForm<any>> => {
    return axiosClient.get(`/user/get-profile`);
};
export const updateProfile = (data: any): Promise<ResponseForm<any>> => {
    return axiosClient.put(`/user/account/change-info`, data);
};
export const getListStream = (page = 1, limit = 10): Promise<ResponseForm<any>> => {
    return axiosClient.get(`user/stream/get-all?page=${page}&limit=${limit}`);
};
export const updateStream = (creatorId: any, dataUpdate: any): Promise<ResponseForm<any>> => {
    return axiosClient.put(`user/stream/update/${creatorId}`, dataUpdate);
};
export const createStream = (data: any): Promise<ResponseForm<any>> => {
    return axiosClient.post(`/user/stream/create`, data);
};
export const changePassword = (data: any): Promise<ResponseForm<any>> => {
    return axiosClient.put(`/auth/change-password`, data);
};
export const getUserStreamStats = (params: {
    start_date?: string,
    end_date?: string,
},): Promise<ResponseForm<any>> => {
    return axiosClient.get(`/user/stream/statistical`, { params });
};
