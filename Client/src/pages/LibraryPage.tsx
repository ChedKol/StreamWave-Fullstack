import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/useAuthContext";
import { getPlaylistsByUserId, deletePlaylist } from '../services/playlist.service';
import type { Playlist } from "../types/playlist.types";
import '../style/LibraryPage.css';
import { Play, Trash2, Music } from "lucide-react";

const LibraryPage = () => {
    const navigate = useNavigate();
    const { user, isInitialized } = useAuthContext();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDeletePlaylist = async (playlistId: number, playlistName: string) => {
        if (!confirm(`האם את בטוחה שברצונך למחוק את "${playlistName}"?`)) return;

        try {
            await deletePlaylist(playlistId);
            setPlaylists(prev => prev.filter(p => p.id !== playlistId));
        } catch (error) {
            console.error(error);
            alert("מחיקת הפלייליסט נכשלה");
        }
    };

    const getImageSrc = (arrImage: string | null) => {
        if (!arrImage) return "https://via.placeholder.com/300";
        return `data:image/jpeg;base64,${arrImage}`;
    };

    useEffect(() => {
        const fetchLibraryData = async () => {
            if (user?.userId) {
                try {
                    setLoading(true);
                    const data = await getPlaylistsByUserId(Number(user.userId));
                    setPlaylists(data || []);
                } finally {
                    setLoading(false);
                }
            } else if (isInitialized) {
                setLoading(false);
            }
        };

        fetchLibraryData();
    }, [user?.userId, isInitialized]);

    if (!isInitialized || loading) {
        return (
            <div className="library-loading">
                טוען את הספרייה שלך...
            </div>
        );
    }

    return (
        <div className="library-page">

            <header className="library-header">
                <div>
                    <h1>הספרייה שלך</h1>
                    <p>כל הפלייליסטים במקום אחד</p>
                </div>
            </header>

            {playlists.length === 0 ? (

                <div className="empty-library">
                    <Music size={40} />
                    <h2>אין לך עדיין פלייליסטים</h2>
                    <p>תתחילי ליצור מוזיקה משלך 🎧</p>
                </div>

            ) : (

                <div className="library-grid">

                    {playlists.map(playlist => (

                        <div key={playlist.id} className="playlist-card">

                            <div className="playlist-image">

                                <img
                                    src={getImageSrc(playlist.arrCover)}
                                    alt={playlist.playlistName}
                                />

                                <div className="playlist-overlay">

                                    <button
                                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                                    >
                                        <Play size={18} />
                                    </button>

                                </div>

                            </div>

                            <div className="playlist-info">

                                <h3>{playlist.playlistName}</h3>

                                <p>{playlist.songsCount || 0} שירים</p>

                            </div>

                            <button
                                className="delete-btn"
                                onClick={() =>
                                    handleDeletePlaylist(
                                        playlist.id,
                                        playlist.playlistName
                                    )
                                }
                            >
                                <Trash2 size={16} />
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};

export default LibraryPage;