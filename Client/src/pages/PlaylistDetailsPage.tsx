import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlaylistById, removeSongFromPlaylist } from "../services/playlist.service";
import type { PlaylistDetails } from "../types/playlist.types";

import { Play, Plus, Trash2, ArrowLeft, Music } from "lucide-react";

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
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylist();
    }, [id]);

    const handlePlaySong = (index: number) => {
        if (!playlist?.songs?.length) return;

        const song = playlist.songs[index];

        navigate(`/now-playing/${song.id}`, {
            state: {
                playlistSongs: playlist.songs,
                currentIndex: index
            }
        });
    };

    const handlePlayAll = () => handlePlaySong(0);

    const handleDeleteSong = async (songId: number, songName: string) => {
        if (!confirm(`למחוק את "${songName}"?`)) return;

        try {
            await removeSongFromPlaylist(Number(id), songId);

            setPlaylist(prev =>
                prev
                    ? {
                          ...prev,
                          songs: prev.songs.filter(s => s.id !== songId)
                      }
                    : null
            );
        } catch {
            alert("שגיאה במחיקת שיר");
        }
    };

    const getImageSrc = (img: string | null) =>
        img ? `data:image/jpeg;base64,${img}` : "https://via.placeholder.com/300";

    if (loading) {
        return <div className="playlist-loading">טוען פלייליסט...</div>;
    }

    if (!playlist) {
        return <div className="playlist-error">הפלייליסט לא נמצא</div>;
    }

    return (
        <div className="playlist-page">

            {/* HEADER */}
            <header className="playlist-hero">

                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                </button>

                <div className="playlist-hero-content">

                    <div className="playlist-cover-big">
                        <img src={getImageSrc(playlist.arrCover)} />
                    </div>

                    <div className="playlist-meta">

                        <span className="label">PLAYLIST</span>

                        <h1>{playlist.playlistName}</h1>

                        <p>{playlist.songs?.length || 0} שירים</p>

                        <div className="playlist-actions">

                            <button className="primary-btn" onClick={handlePlayAll}>
                                <Play size={18} /> נגן
                            </button>

                            <button
                                className="secondary-btn"
                                onClick={() => navigate('/search', {
                                    state: {
                                        addToPlaylist: Number(id)
                                    }
                                })}
                            >
                                <Plus size={18} /> הוסף שיר
                            </button>

                        </div>

                    </div>

                </div>

            </header>

            {/* SONGS */}
            <section className="songs-container">

                <div className="songs-header">
                    <Music size={18} />
                    <h2>שירים</h2>
                </div>

                {playlist.songs?.length === 0 ? (
                    <div className="empty">
                        אין שירים בפלייליסט עדיין
                    </div>
                ) : (

                    <div className="songs-list">

                        {playlist.songs.map((song, index) => (

                            <div
                                key={song.id}
                                className="song-row"
                                onClick={() => handlePlaySong(index)}
                            >

                                <img src={getImageSrc(song.arrImage)} />

                                <div className="song-info">

                                    <h4>{song.songName}</h4>
                                    <p>{song.artistName}</p>

                                </div>

                                <div className="song-actions">

                                    <button
                                        className="play-mini"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlaySong(index);
                                        }}
                                    >
                                        <Play size={14} />
                                    </button>

                                    <button
                                        className="delete-mini"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSong(song.id, song.songName);
                                        }}
                                    >
                                        <Trash2 size={14} />
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

export default PlaylistDetailsPage;