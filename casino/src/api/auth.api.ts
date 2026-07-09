import { api } from './axios';

export const sendOtp = async (mobile: string) => {
    const res = await api.post('/auth/send-otp', { mobile });
    return res.data;
};

export const verifyOtp = async (mobile: string, otp: string) => {
    const res = await api.post('/auth/verify-otp', { mobile, otp });
    return res.data;
};

export const sendEmailVerification = async (email: string) => {
    const res = await api.post('/auth/send-email-verification', { email });
    return res.data;
};

export const verifyEmail = async (token: string) => {
    const res = await api.post('/auth/verify-email', { token });
    return res.data;
};

export const refreshSession = async (refreshToken: string) => {
    const res = await api.post('/auth/refresh', { refreshToken });
    return res.data;
};

export const logoutUser = async (refreshToken: string) => {
    const res = await api.post('/auth/logout', { refreshToken });
    return res.data;
};

export const getMe = async () => {
    const res = await api.get('/auth/me');
    return res.data;
};
