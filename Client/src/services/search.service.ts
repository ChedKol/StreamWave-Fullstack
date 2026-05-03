import axiosInstance from "./axios"

export const searchAll = async (query: string): Promise<any> => {
    const response = await axiosInstance.get(`Search?query=${query}`);
    return response.data;
};