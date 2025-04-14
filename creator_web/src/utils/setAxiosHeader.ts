import { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { getAccessTokenFromLS } from './auth';

const setAxiosHeader = (config: InternalAxiosRequestConfig<unknown>): InternalAxiosRequestConfig<unknown> => {
    const token = getAccessTokenFromLS();
    if (token) (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
    return config;
};

export default setAxiosHeader;