import React, { useState } from 'react';
import { searchAll } from '../services/search.service';
import { getSongsByGenre } from '../services/song.service';
import { 
    getPlaylistsByUserId, 
    addSongToPlaylist, 
    removeSongFromPlaylist, 
    getPlaylistById 
} from '../services/playlist.service';
import { useAuthContext } from '../auth/useAuthContext';
import { 
    Search as SearchIcon, 
    X, 
    Music, 
    Users, 
    ChevronRight, 
    Plus, 
    Check 
} from 'lucide-react';
import '../style/SearchPage.css';
import type { Song } from '../types/song.types';
import type { PlaylistDetails } from '../types/playlist.types';

const genres = [
    { id: 0, name: 'Pop', color: 'genre-pink', image: 'https://images.unsplash.com/photo-1725101593263-293522ee89c3?q=80&w=400' },
    { id: 1, name: 'Rock', color: 'genre-red', image: 'https://images.unsplash.com/photo-1555165498-52fb517c055b?q=80&w=400' },
    { id: 2, name: 'Folk', color: 'genre-green', image: 'https://images.unsplash.com/photo-1445620466293-d6316392bb92?q=80&w=400' },
    { id: 3, name: 'Country', color: 'genre-orange', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400' },
    { id: 4, name: 'Jewish', color: 'genre-blue', image: 'https://images.unsplash.com/photo-1531058240690-006c446962d8?q=80&w=400' }
];

const SearchPage = () => {
    const { user } = useAuthContext();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    
    // States לניהול המודאל
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [userPlaylists, setUserPlaylists] = useState<PlaylistDetails[]>([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);

    // פתיחת המודאל וטעינת נתונים
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
            // מביאים את כל המידע על כל פלייליסט כדי לדעת אילו שירים כבר בפנים
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

    // הוספה/הסרה בזמן אמת (Toggle)
    const toggleSongInPlaylist = async (playlist: PlaylistDetails) => {
        if (!selectedSong) return;

        const isSongInPlaylist = playlist.songs.some(s => s.id === selectedSong.id);

        try {
            if (isSongInPlaylist) {
                await removeSongFromPlaylist(playlist.id, selectedSong.id);
                // עדכון 
                setUserPlaylists(prev => prev.map(p => 
                    p.id === playlist.id 
                    ? { ...p, songs: p.songs.filter(s => s.id !== selectedSong.id) } 
                    : p
                ));
            } else {
                await addSongToPlaylist(playlist.id, selectedSong.id);
                // עדכון 
                setUserPlaylists(prev => prev.map(p => 
                    p.id === playlist.id 
                    ? { ...p, songs: [...p.songs, selectedSong] } 
                    : p
                ));
            }
        } catch (err) {
            console.error("Failed to update playlist:", err);
            alert("שגיאה בעדכון הפלייליסט.");
        }
    };

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setSelectedGenre(null); 

        if (val.trim().length > 1) {
            try {
                const data = await searchAll(val);
                setResults(data);
            } catch (err) {
                console.error("Error searching:", err);
            }
        } else {
            setResults(null);
        }
    };

    const handleGenreClick = async (genreId: number, genreName: string) => {
        try {
            setSelectedGenre(genreName);
            setQuery('');
            const data = await getSongsByGenre(genreId);
            setResults({ songs: data, artists: [] }); 
        } catch (err) {
            console.error("Error fetching genre:", err);
        }
    };

    const resetView = () => {
        setQuery('');
        setResults(null);
        setSelectedGenre(null);
    };

    return (
        <div className="search-page-container">
            <header className="search-header">
                <h1>חיפוש</h1>
                <div className="search-bar-wrapper">
                    <SearchIcon className="search-icon-inside" size={20} />
                    <input 
                        type="text" 
                        value={query}
                        onChange={handleSearch}
                        placeholder="מה תרצה לשמוע היום?"
                        className="search-input-field"
                    />
                    {(query || selectedGenre) && (
                        <button className="clear-search" onClick={resetView}>
                            <X size={18} />
                        </button>
                    )}
                </div>

                {selectedGenre && (
                    <div className="genre-breadcrumb">
                        <span className="breadcrumb-link" onClick={() => { setResults(null); setSelectedGenre(null); }}>
                            ז'אנרים
                        </span> 
                        <ChevronRight size={14} /> 
                        <strong>{selectedGenre}</strong>
                    </div>
                )}
            </header>

            <main className="search-content">
                {results ? (
                    <div className="results-wrapper">
                        {results.songs?.length > 0 && (
                            <section className="results-section">
                                <div className="section-title"><Music size={18}/> <h2>שירים</h2></div>
                                <div className="songs-list">
                                    {results.songs.map((song: any) => (
                                        <div key={song.id} className="song-result-item">
                                            <img 
                                                src={song.arrImage ? `data:image/jpeg;base64,${song.arrImage}` : '/default-cover.png'} 
                                                alt={song.songName} 
                                            />
                                            <div className="song-info">
                                                <div className="title">{song.songName}</div>
                                                <div className="artist">{song.artistName}</div>
                                            </div>
                                            <button 
                                                className="add-to-playlist-btn-circle" 
                                                onClick={(e) => { e.stopPropagation(); openPlaylistModal(song); }}
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {!selectedGenre && results.artists?.length > 0 && (
                            <section className="results-section">
                                <div className="section-title"><Users size={18}/> <h2>אמנים</h2></div>
                                <div className="artists-grid-results">
                                    {results.artists.map((artist: any) => (
                                        <div key={artist.id} className="artist-result-card">
                                            <img src={`data:image/jpeg;base64,${artist.arrImage}`} alt={artist.artistName} />
                                            <p>{artist.artistName}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="browse-all-section">
                        <h2>דפדוף בכל הג'אנרים</h2>
                        <div className="genres-grid">
                            {genres.map((genre) => (
                                <div key={genre.id} className={`genre-card ${genre.color}`} onClick={() => handleGenreClick(genre.id, genre.name)}>
                                    <img src={genre.image} alt={genre.name} />
                                    <h3>{genre.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* מודאל פלייליסטים */}
            {isModalOpen && (
                <div className="playlist-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="playlist-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>הוספה לפלייליסט</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={24}/></button>
                        </div>
                        <div className="modal-content">
                            <p>בחרי פלייליסטים עבור: <strong>{selectedSong?.songName}</strong></p>
                            
                            {loadingPlaylists ? (
                                <div className="loading-state">טוען פלייליסטים...</div>
                            ) : (
                                <>
                                    <div className="playlist-list">
                                        {userPlaylists.length > 0 ? (
                                            userPlaylists.map(playlist => {
                                                const isAdded = playlist.songs.some(s => s.id === selectedSong?.id);
                                                return (
                                                    <div 
                                                        key={playlist.id} 
                                                        className={`playlist-option ${isAdded ? 'is-added' : ''}`}
                                                        onClick={() => toggleSongInPlaylist(playlist)}
                                                    >
                                                        <img src={playlist.arrCover ? `data:image/jpeg;base64,${playlist.arrCover}` : '/default-playlist.png'} alt="" />
                                                        <div className="playlist-info">
                                                            <h4>{playlist.playlistName}</h4>
                                                            <p>{playlist.songs.length} שירים</p>
                                                        </div>
                                                        {isAdded && <Check size={20} className="check-icon" />}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="no-playlists">אין פלייליסטים זמינים.</div>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button className="confirm-selection-btn" onClick={() => setIsModalOpen(false)}>
                                            סיום
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;