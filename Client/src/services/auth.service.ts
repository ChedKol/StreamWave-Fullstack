import axiosInstance from "./axios"

//שולח  email + password לשרת ומקבל בחזרה את ה-token
export const login = async (email: string, password: string) => {
    const response = await axiosInstance.post('Login', { email, password })
    return response.data
}

// שולח את פרטי ההרשמה לשרת כדי ליצור משתמש חדש formData מכיל את כל הפרטים של המשתמש כולל הקובץ תמונה
export const register = async (formData: FormData) => {
    const response = await axiosInstance.post('User', formData)
    return response.data
}

// מאמת את הקוד שהמשתמש קיבל במייל
export const verifyEmail = async (email: string, code: string) => {
    const response = await axiosInstance.post('User/verify', { email, code });
    return response.data;
}
