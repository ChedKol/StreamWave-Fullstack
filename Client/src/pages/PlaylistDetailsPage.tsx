import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlaylistById, removeSongFromPlaylist } from "../services/playlist.service";
import type { PlaylistDetails } from "../types/playlist.types";
import "../style/PlaylistDetailsPage.css";

const PlaylistDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylist = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                const data = await getPlaylistById(Number(id));
                setPlaylist(data);
            } catch (error) {
                console.error("שגיאה בטעינת פלייליסט:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [id]);

    const handlePlaySong = (index: number) => {
        if (playlist?.songs && playlist.songs[index]) {
            const song = playlist.songs[index];
            navigate(`/now-playing/${song.id}`, {
                state: {
                    playlistSongs: playlist.songs,
                    currentIndex: index
                }
            });
        }
    };

    const handlePlayAll = () => {
        if (playlist?.songs && playlist.songs.length > 0) {
            handlePlaySong(0);
        }
    };

    
    const handleDeleteSong = async (songId: number, songName: string) => {
        if (!confirm(`האם את בטוחה שברצונך למחוק את השיר "${songName}" מהפלייליסט?`)) {
            return;
        }

        try {
            await removeSongFromPlaylist(Number(id), songId);
            // רענון הרשימה לאחר מחיקה
            setPlaylist(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    songs: prev.songs?.filter(song => song.id !== songId) || []
                };
            });
        } catch (error) {
            console.error("שגיאה במחיקת שיר מפלייליסט:", error);
            alert("מחיקת השיר נכשלה");
        }
    };

    // פונקציית הוספת שיר לפלייליסט
    const handleAddSong = () => {
        // ניווט לעמוד חיפוש שירים כדי להוסיף שירים לפלייליסט
        navigate('/search', { 
            state: { 
                addToPlaylist: Number(id),
                playlistName: playlist?.playlistName 
            } 
        });
    };

    const getImageSrc = (arrImage: string | null) => {
        if (!arrImage) return 'https://via.placeholder.com/150?text=No+Cover';
        return `data:image/jpeg;base64,${arrImage}`;
    };

    const formatDuration = (duration?: string) => {
        // אם ה-duration הוא בפורמט MM:SS, החזר אותו כמו שהוא
        return duration || '--:--';
    };

    if (loading) {
        return <div className="loading-state">טוען פלייליסט...</div>;
    }

    if (!playlist) {
        return <div className="error-state">הפלייליסט לא נמצא.</div>;
    }

    return (
        <div className="playlist-details-page">
            {/* כותרת הפלייליסט */}
            <header className="playlist-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    ← חזור
                </button>
                <div className="playlist-info">
                    <div className="playlist-cover">
                        <img 
                            src={getImageSrc(playlist.arrCover)} 
                            alt={playlist.playlistName} 
                        />
                    </div>
                    <div className="playlist-details">
                        <h1>{playlist.playlistName}</h1>
                        <p>{playlist.songs?.length || 0} שירים</p>
                        <div className="playlist-actions">
                            <button onClick={handlePlayAll} className="play-all-button">
                                ▶️ הפעל הכל
                            </button>
                            <button onClick={handleAddSong} className="add-song-button">
                                ➕ הוסף שיר
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* רשימת השירים */}
            <section className="songs-section">
                <h2>רשימת שירים</h2>
                <div className="songs-list">
                    {playlist.songs?.map((song, index) => (
                        <div 
                            key={song.id} 
                            className="song-item"
                        >
                            <div className="song-info">
                                <div className="song-cover-small">
                                    <img 
                                        src={getImageSrc(song.arrImage)} 
                                        alt={song.songName} 
                                    />
                                </div>
                                <div className="song-text">
                                    <h4>{song.songName}</h4>
                                    <p>{song.artistName}</p>
                                    <p className="duration">{formatDuration(song.duration)}</p>
                                </div>
                            </div>
                            <div className="song-actions">
                                <button 
                                    onClick={() => handlePlaySong(index)}
                                    className="play-song-button"
                                >
                                    ▶️
                                </button>
                                <button 
                                    onClick={() => handleDeleteSong(song.id, song.songName)}
                                    className="delete-song-button"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PlaylistDetailsPage;
