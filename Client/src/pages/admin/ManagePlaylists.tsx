import { useEffect, useState } from "react";
import { useAuthContext } from "../../auth/useAuthContext";
import { getAllPlaylists, getPlaylistById, deletePlaylist } from "../../services/playlist.service";
import type { Playlist, PlaylistDetails } from "../../types/playlist.types";
import { Trash2, ChevronDown, ChevronUp, Music, User, Calendar, Hash } from "lucide-react";
import "../../style/Admin.ManagePlaylist.css";

const ManagePlaylistsPage = () => {
    const { user, isInitialized } = useAuthContext();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [details, setDetails] = useState<PlaylistDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (isInitialized && user?.role === "Admin") {
            loadPlaylists();
        }
    }, [isInitialized, user]);

    const loadPlaylists = async () => {
        try {
            setLoading(true);
            const data = await getAllPlaylists();
            setPlaylists(data || []);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (id: number) => {
        if (expandedId === id) {
            setExpandedId(null);
            setDetails(null);
            return;
        }

        setExpandedId(id);
        setLoadingDetails(true);
        try {
            const fullData = await getPlaylistById(id);
            setDetails(fullData);
        } catch (error) {
            console.error("שגיאה בטעינת שירים", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();
        if (window.confirm(`האם את בטוחה שברצונך למחוק את הפלייליסט "${name}"?`)) {
            try {
                await deletePlaylist(id);
                setPlaylists(prev => prev.filter(p => p.id !== id));
                if (expandedId === id) setExpandedId(null);
                alert("הפלייליסט נמחק בהצלחה");
            } catch (error) {
                console.error("שגיאה במחיקה", error);
                alert("אירעה שגיאה בעת ניסיון המחיקה");
            }
        }
    };

    const getImageSrc = (img: string | null) => img ? `data:image/jpeg;base64,${img}` : 'https://via.placeholder.com/50';

    if (!isInitialized || loading) return <div className="admin-loader">טוען ניהול פלייליסטים...</div>;

    return (
        <div className="manage-playlists-container">
            <header className="page-header">
                <div className="header-text">
                    <h1>ניהול פלייליסטים</h1>
                    <p>לחצי על פלייליסט כדי לצפות בשירים ובפרטי היוצר</p>
                </div>
            </header>

            <div className="playlists-admin-list">
                {playlists.map(p => (
                    <div key={p.id} className={`playlist-accordion-item ${expandedId === p.id ? 'expanded' : ''}`}>
                        {/* שורת הפלייליסט הראשית */}
                        <div className="playlist-main-row" onClick={() => toggleExpand(p.id)}>
                            <div className="playlist-main-info">
                                <img src={getImageSrc(p.arrCover)} alt={p.playlistName} className="playlist-admin-img" />
                                <div className="playlist-text-meta">
                                    <h3>{p.playlistName}</h3>
                                    <span><Music size={12} /> {p.songsCount} שירים</span>
                                </div>
                            </div>
                            
                            <div className="playlist-actions">
                                <button 
                                    className="action-btn delete-btn" 
                                    onClick={(e) => handleDelete(e, p.id, p.playlistName)}
                                >
                                    <Trash2 size={18} />
                                </button>
                                <div className="expand-icon">
                                    {expandedId === p.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                        </div>

                        {/* החלק הנסתר (Accordion) */}
                        {expandedId === p.id && (
                            <div className="playlist-details-expanded">
                                {loadingDetails ? (
                                    <div className="details-loader">טוען פרטים...</div>
                                ) : details && (
                                    <>
                                        <div className="details-top-bar">
                                            <div className="meta-item">
                                                <User size={16} />
                                                <strong>יוצר:</strong> <span>{details.userName}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Calendar size={16} />
                                                <strong>נוצר בתאריך:</strong> <span>{new Date().toLocaleDateString()}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Hash size={16} />
                                                <strong>מזהה:</strong> <span>#{p.id}</span>
                                            </div>
                                        </div>

                                        <table className="songs-mini-table">
                                            <thead>
                                                <tr>
                                                    <th>כותרת השיר</th>
                                                    <th>אמן</th>
                                                    <th>ז'אנר</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {details.songs?.map(song => (
                                                    <tr key={song.id}>
                                                        <td>
                                                            <div className="song-title-cell">
                                                                <Music size={14} className="music-icon" />
                                                                {song.songName}
                                                            </div>
                                                        </td>
                                                        <td>{song.artistName}</td>
                                                        <td>
                                                            <span className="genre-label">{song.genere}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagePlaylistsPage;