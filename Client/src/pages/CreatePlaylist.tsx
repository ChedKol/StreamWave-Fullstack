import React, { useState, useContext } from 'react'; // הוספנו את useContext
import { AuthContext } from '../auth/AuthContext'; // ייבוא הקונטקסט שלך
import { createPlaylist, addSongToPlaylist } from '../services/playlist.service';
import { searchAll } from '../services/search.service';
import type { Song } from '../types/song.types';
import type { Playlist } from '../types/playlist.types';
import { Plus, Check, Image as ImageIcon, Music } from 'lucide-react';
import '../style/CreatePlaylist.css'; 

const CreatePlaylist = () => {
    const auth = useContext(AuthContext);
    const user = auth?.user;

    const [playlistName, setPlaylistName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [createdPlaylist, setCreatedPlaylist] = useState<Playlist | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [addedSongIds, setAddedSongIds] = useState<number[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleInitPlaylist = async () => {
    if (!playlistName.trim()) return alert("חובה לתת שם לפלייליסט");
    
    // שליפת ה-ID הנכון: אם אין userId (משתמש), ננסה לקחת id (מנהל)
    const currentUserId = user?.userId || (user as any)?.id;

    if (!currentUserId) {
        return alert("שגיאה: לא נמצא מזהה משתמש. נסה להתחבר מחדש.");
    }

    try {
        const userIdNum = Number(currentUserId);
        
        // עכשיו ה-userIdNum יהיה המזהה האמיתי של מי שמחובר כרגע
        const result = await createPlaylist(playlistName, userIdNum, selectedFile || undefined);
        setCreatedPlaylist(result);
        alert("הפלייליסט נוצר בהצלחה!");
    } catch (err) {
        console.error("שגיאה ביצירת פלייליסט:", err);
        alert("יצירת הפלייליסט נכשלה.");
    }
};

    const handleSearch = async (val: string) => {
        setSearchQuery(val);
        if (val.trim().length > 1) {
            try {
                const data = await searchAll(val);
                setSearchResults(data.songs || []);
            } catch (err) {
                console.error("חיפוש נכשל", err);
            }
        }
    };

    const handleAddSong = async (songId: number) => {
        if (!createdPlaylist) return;
        try {
            await addSongToPlaylist(createdPlaylist.id, songId);
            setAddedSongIds(prev => [...prev, songId]);
        } catch (err) {
            alert("השיר כבר קיים בפלייליסט.");
        }
    };

    return (
        <div className="create-playlist-page">
            <h1 className="page-title">יצירת פלייליסט</h1>
            
            <div className="playlist-setup-card">
                <div className="cover-upload-area" onClick={() => document.getElementById('fileInput')?.click()}>
                    {previewUrl ? (
                        <img src={previewUrl} alt="Cover Preview" className="preview-img" />
                    ) : (
                        <div className="upload-placeholder">
                            <ImageIcon size={48} />
                            <span>העלה תמונה</span>
                        </div>
                    )}
                    <input type="file" id="fileInput" hidden onChange={handleFileChange} accept="image/*" />
                </div>

                <div className="details-area">
                    <input 
                        type="text" 
                        placeholder="איך נקרא לפלייליסט?" 
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        className="name-input"
                        disabled={!!createdPlaylist}
                    />
                    {!createdPlaylist ? (
                        <button onClick={handleInitPlaylist} className="create-btn">צור פלייליסט</button>
                    ) : (
                        <div className="success-badge">
                            <Check size={16} /> הפלייליסט מוכן! עכשיו חפשי שירים להוספה
                        </div>
                    )}
                </div>
            </div>

            {createdPlaylist && (
                <div className="add-songs-container animate-fade-in">
                    <div className="search-box">
                        <Music size={20} />
                        <input 
                            type="text" 
                            placeholder="חפש שיר או אמן..." 
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="search-results-list">
                        {searchResults.map(song => (
                            <div key={song.id} className="song-row">
                                <img src={`data:image/jpeg;base64,${song.arrImage}`} alt="" />
                                <div className="song-meta">
                                    <span className="s-name">{song.songName}</span>
                                    <span className="s-artist">{song.artistName}</span>
                                </div>
                                <button 
                                    className={`add-btn ${addedSongIds.includes(song.id) ? 'added' : ''}`}
                                    onClick={() => handleAddSong(song.id)}
                                    disabled={addedSongIds.includes(song.id)}
                                >
                                    {addedSongIds.includes(song.id) ? <Check size={18}/> : <Plus size={18}/>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePlaylist;