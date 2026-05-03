import type { Song } from './song.types';

export interface Playlist {
    id: number;
    playlistName: string;
    playlistCoverPath: string | null;
    userName: string;
    userId: number; // 👈 הוספנו את זה בשביל הסינון בספרייה
    songsCount: number;
    arrCover: string | null; 
}

export interface PlaylistDetails extends Playlist {
    songs: Song[];
}