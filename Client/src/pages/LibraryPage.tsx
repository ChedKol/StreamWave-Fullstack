import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/useAuthContext";
import { getPlaylistsByUserId, deletePlaylist } from '../services/playlist.service';
import type { Playlist } from "../types/playlist.types";


const LibraryPage = () => {
    const navigate = useNavigate();
    const { user, isInitialized } = useAuthContext();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDeletePlaylist = async (playlistId: number, playlistName: string) => {
        if (!confirm(`האם את בטוחה שברצונך למחוק את הפלייליסט "${playlistName}"?`)) {
            return;
        }
        
        try {
            await deletePlaylist(playlistId);
            // רענון הרשימה לאחר מחיקה
            setPlaylists(prev => prev.filter(p => p.id !== playlistId));
        } catch (error) {
            console.error("שגיאה במחיקת פלייליסט:", error);
            alert("מחיקת הפלייליסט נכשלה");
        }
    };

    // פונקציית עזר לתמונות בדיוק כמו ב-HomePage
    const getImageSrc = (arrImage: string | null) => {
        if (!arrImage) return 'https://via.placeholder.com/150?text=No+Playlist+Cover';
        return `data:image/jpeg;base64,${arrImage}`;
    };

    useEffect(() => {
        const fetchLibraryData = async () => {
            // שימוש בבדיקה זהה ל-HomePage
            if (user?.userId) {
                try {
                    setLoading(true);
                    const userIdNum = Number(user.userId);
                    
                    // קריאת הנתונים
                    const data = await getPlaylistsByUserId(userIdNum);
                    setPlaylists(data || []);
                } catch (error) {
                    console.error("שגיאה בטעינת הפלייליסטים בספרייה", error);
                } finally {
                    setLoading(false);
                }
            } else if (isInitialized) {
                // אם סיים להיטען ואין יוזר
                setLoading(false);
            }
        };

        fetchLibraryData();
    }, [user?.userId, isInitialized]); // מאזין לשינוי ב-ID בדיוק כמו ב-HomePage

    if (!isInitialized || loading) {
        return <div className="loading-state">טוען את הספרייה שלך...</div>;
    }

    return (
        <div id="home-page-container"> {/* שימוש באותו קונטיינר לעיצוב אחיד */}
            <header className="home-header">
                <h1 className="greeting-text">הספרייה של {user?.userName}</h1>
                <p className="subtitle-text">כל הפלייליסטים שיצרת במקום אחד</p>
            </header>

            <section className="home-section">
                <div className="section-title-wrapper">
                    <h2>הפלייליסטים שלי</h2>
                </div>
                
                {playlists.length === 0 ? (
                    <div className="no-data-message" style={{ textAlign: 'center', padding: '40px' }}>
                        <p>עדיין לא יצרת פלייליסטים.</p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {playlists.map(playlist => (
                            <div key={playlist.id} className="song-card-figma">
                                <div className="image-wrapper">
                                    <img 
                                        src={getImageSrc(playlist.arrCover)} 
                                        alt={playlist.playlistName} 
                                    />
                                </div>
                                <div className="card-info">
                                    <h4 className="song-name">{playlist.playlistName}</h4>
                                    <p className="artist-name">{playlist.songsCount || 0} שירים</p>
                                </div>
                                <div className="card-actions">
                                    <button 
                                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                                        className="play-button"
                                    >
                                        ▶️ פתח
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePlaylist(playlist.id, playlist.playlistName)}
                                        className="delete-button"
                                    >
                                        🗑️ מחק
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default LibraryPage;