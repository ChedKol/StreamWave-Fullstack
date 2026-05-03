// auth.utils.ts
export const setSession = (token: string) => {
    localStorage.setItem('token', token);
};

export const getSession = () => {
    return localStorage.getItem('token');
};

export const removeSession = () => {
    localStorage.removeItem('token');
};