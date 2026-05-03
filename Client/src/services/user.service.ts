// services/user.service.ts
import axiosInstance from "./axios"
import type { AdminUser } from "../types/user.types"

export const getAllUsers = async (): Promise<AdminUser[]> => {
    const response = await axiosInstance.get('User');
    return response.data;
}


export const deleteUser = async (id: number): Promise<void> => {
    await axiosInstance.delete(`User/${id}`);
}

export const getUserById = async (id: number): Promise<AdminUser> => {
    const response = await axiosInstance.get(`User/${id}`);
    return response.data;
}

export const updateUser = async (id: number, data: FormData) => {
    return await axiosInstance.put(`User/${id}`, data);
}

// אם תרצי בהמשך לשנות הרשאות מנהל דרך הטבלה
export const toggleAdminStatus = async (id: number, isAdmin: boolean): Promise<void> => {
    await axiosInstance.patch(`User/${id}/toggle-admin`, { isAdmin });
}