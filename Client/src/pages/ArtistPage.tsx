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
                await removeSongFromPlaylist(playlist.id, selectedSong.id);
                // עדכון ה-state המקומי כדי שה-V ייעלם מיד
                setUserPlaylists(prev => prev.map(p => 
                    p.id === playlist.id 
                    ? { ...p, songs: p.songs.filter(s => String(s.id) !== String(selectedSong.id)) } 
                    : p
                ));
            } else {
                await addSongToPlaylist(playlist.id, selectedSong.id);
                // עדכון ה-state המקומי כדי שה-V יופיע מיד
                setUserPlaylists(prev => prev.map(p => 
                    p.id === playlist.id 
                    ? { ...p, songs: [...p.songs, selectedSong] } 
                    : p
                ));
            }
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

            {isModalOpen && (
                <div className="playlist-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="playlist-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>הוספה לפלייליסט</h3>
                                <p className="modal-subtitle">עבור: <strong>{selectedSong?.songName}</strong></p>
                            </div>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={24}/></button>
                        </div>
                        <div className="modal-content">
                            {loadingPlaylists ? (
                                <div className="loading-state">טוען פלייליסטים...</div>
                            ) : (
                                <>
                                    <div className="playlist-list">
                                        {userPlaylists.map(playlist => {
                                            const isAlreadyIn = playlist.songs.some(s => String(s.id) === String(selectedSong?.id));

                                            return (
                                                <div 
                                                    key={playlist.id} 
                                                    className={`playlist-option ${isAlreadyIn ? 'is-added' : ''}`}
                                                    onClick={() => toggleSongInPlaylist(playlist)}
                                                    style={{ cursor: isUpdating ? 'wait' : 'pointer' }}
                                                >
                                                    <img src={playlist.arrCover ? `data:image/jpeg;base64,${playlist.arrCover}` : '/default-playlist.png'} alt="" />
                                                    <div className="playlist-info">
                                                        <h4>{playlist.playlistName}</h4>
                                                        <p>{playlist.songs.length} שירים</p>
                                                    </div>
                                                    <div className={`custom-checkbox ${isAlreadyIn ? 'checked' : ''}`}>
                                                        {isAlreadyIn && <Check size={14} />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button 
                                        className="confirm-selection-btn" 
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'מעדכן...' : 'סיום'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistPage;