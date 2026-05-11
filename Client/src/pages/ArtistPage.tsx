import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtistById } from '../services/artist.service';
import { 
    getPlaylistsByUserId, 
    addSongToPlaylist, 
    removeSongFromPlaylist, 
    getPlaylistById 
} from '../services/playlist.service';
import { useAuthContext } from '../auth/useAuthContext';
import { Plus, X, Check } from 'lucide-react';
import type { ArtistDetails } from '../types/artist.types';
import type { Song } from '../types/song.types';
import type { PlaylistDetails } from '../types/playlist.types';
import '../style/ArtistPage.css';

const ArtistPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const [artist, setArtist] = useState<ArtistDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [userPlaylists, setUserPlaylists] = useState<PlaylistDetails[]>([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    
    // state פשוט למניעת לחיצות כפולות בזמן עדכון יחיד
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                if (id) {
                    const data = await getArtistById(Number(id));
                    setArtist(data);
                }
            } catch (error) {
                console.error("Error fetching artist:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtist();
    }, [id]);

    const handleSongClick = (songId: number) => {
        navigate(`/now-playing/${songId}`);
    };

    const openPlaylistModal = async (song: Song) => {
        const currentUserId = user ? Number(user.userId) : null;
        if (!currentUserId) {
            alert("עליך להתחבר כדי לנהל פלייליסטים");
            return;
        }

        setSelectedSong(song);
        setIsModalOpen(true);
        setLoadingPlaylists(true);

        try {
            const playlists = await getPlaylistsByUserId(currentUserId);
            const fullPlaylists = await Promise.all(
                playlists.map(p => getPlaylistById(p.id))
            );
            setUserPlaylists(fullPlaylists);
        } catch (err) {
            console.error("Error loading user playlists:", err);
        } finally {
            setLoadingPlaylists(false);
        }
    };

    const toggleSongInPlaylist = async (playlist: PlaylistDetails) => {
        if (!selectedSong || isUpdating) return;

        setIsUpdating(true);
        const isSongInPlaylist = playlist.songs.some(s => String(s.id) === String(selectedSong.id));

        try {
            if (isSongInPlaylist) {
                // אם השיר קיים - מסירים
                await removeSongFromPlaylist(playlist.id, selectedSong.id);
            } else {
                // אם השיר לא קיים - מוסיפים
                await addSongToPlaylist(playlist.id, selectedSong.id);
            }
            
            // סגירת המודאל מיד לאחר הצלחה כדי למנוע בלבול ופעולות כפולות
            setIsModalOpen(false);
            
            // אופציונלי: הודעת אישור קטנה
            console.log(isSongInPlaylist ? "השיר הוסר" : "השיר נוסף");

        } catch (err) {
            console.error("Failed to update playlist:", err);
            alert("חלה שגיאה בעדכון הפלייליסט.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="loading">טוען...</div>;
    if (!artist) return <div className="error">האומן לא נמצא</div>;

    return (
        <div id="artist-page-container">
            {/* Hero & Actions (ללא שינוי) */}
            <header className="artist-hero">
                {artist.arrImage && <img src={`data:image/jpeg;base64,${artist.arrImage}`} className="hero-bg" alt="" />}
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="verified-wrapper"><span style={{ color: '#3d91ff' }}>✔</span> אומן מאומת</div>
                    <h1 className="artist-main-name">{artist.artistName}</h1>
                </div>
            </header>

            <section className="artist-actions">
                <button className="main-play-btn">▶</button>
                <button className="follow-outline-btn">Follow</button>
            </section>

            {/* רשימת שירים */}
            <section className="artist-songs-section">
                <div className="songs-table">
                    <div className="table-header">
                        <span>#</span><span>כותרת</span><span>ז'אנר</span><span></span>
                    </div>
                    {artist.songs?.map((song, index) => (
                        <div key={song.id} className="song-row-item" onClick={() => handleSongClick(song.id)}>
                            <span className="col-index">{index + 1}</span>
                            <div className="col-title-info">
                                {song.arrImage && <img src={`data:image/jpeg;base64,${song.arrImage}`} alt="" />}
                                <div>
                                    <div className="song-name-text">{song.songName}</div>
                                    <div className="artist-sub-text">{artist.artistName}</div>
                                </div>
                            </div>
                            <span className="col-plays">{song.genere}</span>
                            <div className="col-actions">
                                <button className="add-to-playlist-btn-circle" onClick={(e) => { e.stopPropagation(); openPlaylistModal(song); }}>
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* מודאל פלייליסטים */}
            {isModalOpen && (
                <div className="playlist-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="playlist-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>הוספה לפלייליסט</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={24}/></button>
                        </div>
                        <div className="modal-content">
                            <p>בחרי פלייליסט עבור: <strong>{selectedSong?.songName}</strong></p>
                            
                            {loadingPlaylists ? (
                                <div className="loading-state">טוען פלייליסטים...</div>
                            ) : (
                                <div className="playlist-list">
                                    {userPlaylists.map(playlist => {
                                        // בדיקה אם השיר כבר קיים בפלייליסט הספציפי הזה
                                        const isAlreadyIn = playlist.songs.some(s => String(s.id) === String(selectedSong?.id));

                                        return (
                                            <div 
                                                key={playlist.id} 
                                                // אם השיר קיים, נוסיף קלאס CSS מיוחד (למשל עם רקע מעט שונה או בורדר ירוק)
                                                className={`playlist-option ${isAlreadyIn ? 'is-added' : ''}`}
                                                onClick={() => toggleSongInPlaylist(playlist)}
                                                style={{ 
                                                    cursor: isUpdating ? 'wait' : 'pointer',
                                                    border: isAlreadyIn ? '1px solid #1db954' : '1px solid transparent'
                                                }}
                                            >
                                                <img src={playlist.arrCover ? `data:image/jpeg;base64,${playlist.arrCover}` : '/default-playlist.png'} alt="" />
                                                <div className="playlist-info">
                                                    <h4>{playlist.playlistName}</h4>
                                                    <p>{playlist.songs.length} שירים</p>
                                                </div>
                                                {/* חיווי וי ירוק אם השיר כבר קיים */}
                                                {isAlreadyIn && <Check size={20} color="#1db954" className="check-icon" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistPage;