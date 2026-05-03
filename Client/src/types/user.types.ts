export type User = {
    userId: string;
    userName: string;
    email: string;
    role: "Admin" | "User";
}

export type AdminUser = {
    id: number;
    userName: string;
    email: string;
    profilePath: string | null;
    arrProfile: string | null; // Base64 של התמונה
    isAdmin: boolean;
}