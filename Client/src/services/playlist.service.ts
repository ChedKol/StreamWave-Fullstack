import axiosInstance from './axios';
// שימוש ב-import type כדי למנוע שגיאות קומפילציה של TS
import type { Playlist, PlaylistDetails } from '../types/playlist.types';

/**
 * יצירת פלייליסט חדש הכולל שם, מזהה משתמש ותמונה אופציונלית
 */
export const createPlaylist = async (name: string, userId: number, file?: File): Promise<Playlist> => {
    const formData = new FormData();
    formData.append('PlaylistName', name);
    formData.append('UserId', userId.toString());
    
    // שליחת הקובץ רק אם המשתמש בחר תמונה
    if (file) {
        formData.append('FileCover', file);
    }

    const response = await axiosInstance.post<Playlist>('Playlist', formData, {
        headers: { 
            // חובה עבור שליחת קבצים ו-FormData
            'Content-Type': 'multipart/form-data' 
        }
    });
    return response.data;
};

/**
 * הוספת שיר ספציפי לפלייליסט קיים
 */
export const addSongToPlaylist = async (playlistId: number, songId: number): Promise<void> => {
    await axiosInstance.post(`Playlist/${playlistId}/songs/${songId}`);
};

/**
 * הסרת שיר מפלייליסט
 */
export const removeSongFromPlaylist = async (playlistId: number, songId: number): Promise<void> => {
    await axiosInstance.delete(`Playlist/${playlistId}/songs/${songId}`);
};

/**
 * שליפת כל הפלייליסטים הפעילים (סטטוס true)
 */
export const getAllPlaylists = async (): Promise<Playlist[]> => {
    const response = await axiosInstance.get<Playlist[]>('Playlist');
    return response.data;
};

/**
 * שליפת פלייליסטים של משתמש ספציפי
 */
export const getPlaylistsByUserId = async (userId: number): Promise<Playlist[]> => {
const response = await axiosInstance.get<Playlist[]>(`Playlist/user/${userId}`);    return response.data;
};

/**
 * שליפת פלייליסט ספציפי כולל רשימת השירים המלאה שלו
 */
export const getPlaylistById = async (id: number): Promise<PlaylistDetails> => {
    const response = await axiosInstance.get<PlaylistDetails>(`Playlist/${id}`);
    return response.data;
};

/**
 * מחיקת פלייליסט (בשרת שלך זה מעדכן סטטוס ל-false)
 */
export const deletePlaylist = async (id: number): Promise<void> => {
    await axiosInstance.delete(`Playlist/${id}`);
};

/**
 * עדכון פרטי פלייליסט (שם ו/או תמונה)
 */
export const updatePlaylist = async (id: number, name: string, file?: File): Promise<void> => {
    const formData = new FormData();
    formData.append('PlaylistName', name);
    if (file) {
        formData.append('FileCover', file);
    }

    await axiosInstance.put(`Playlist/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};