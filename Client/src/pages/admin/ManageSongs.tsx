import { useEffect, useState } from "react";
import { getSongs, createSong, updateSong, deleteSong } from "../../services/song.service";
import { getArtists } from "../../services/artist.service";
import type { Song } from "../../types/song.types";
import type { Artist } from "../../types/artist.types";
import { Trash2, Edit3, Plus, Music, User, Mic2, Upload, X, Check } from "lucide-react";
import "../../style/Admin.ManageSongs.css";

const ManageSongs = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);

    // Add Form State
    const [songName, setSongName] = useState('');
    const [artistId, setArtistId] = useState<number>(0);
    const [genere, setGenere] = useState('0');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [songFile, setSongFile] = useState<File | null>(null);
    const [fileKey, setFileKey] = useState(Date.now());

    // Edit Form State
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const [editName, setEditName] = useState('');
    const [editArtistId, setEditArtistId] = useState<number>(0);
    const [editGenere, setEditGenere] = useState('0');
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editSongFile, setEditSongFile] = useState<File | null>(null);

    const genereOptions = [
        { value: 0, label: 'Pop' },
        { value: 1, label: 'Rock' },
        { value: 2, label: 'Folk' },
        { value: 3, label: 'Country' },
        { value: 4, label: 'Jewish' },
    ];

    const fetchData = async () => {
        const [songsData, artistsData] = await Promise.all([getSongs(), getArtists()]);
        setSongs(songsData);
        setArtists(artistsData);
    };

    useEffect(() => { fetchData() }, []);

    const resetForm = () => {
        setSongName('');
        setArtistId(0);
        setGenere('0');
        setImageFile(null);
        setSongFile(null);
        setFileKey(Date.now());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('SongName', songName);
        formData.append('ArtistId', artistId.toString());
        formData.append('Genere', genere);
        if (imageFile) formData.append('FileImage', imageFile);
        if (songFile) formData.append('FileSong', songFile);

        await createSong(formData);
        resetForm();
        fetchData();
    };

    const handleEditClick = (song: Song) => {
        setEditingSong(song);
        setEditName(song.songName);
        setEditArtistId(song.artistId);
        const genreObj = genereOptions.find(opt => opt.label === song.genere);
        setEditGenere(genreObj ? genreObj.value.toString() : "0");
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSong) return;

        const formData = new FormData();
        formData.append('SongName', editName);
        formData.append('ArtistId', String(editArtistId));
        formData.append('Genere', String(editGenere));
        if (editImage) formData.append('FileImage', editImage);
        if (editSongFile) formData.append('FileSong', editSongFile);

        try {
            await updateSong(editingSong.id, formData);
            setEditingSong(null);
            fetchData();
            alert("השיר עודכן בהצלחה!");
        } catch (error) {
            console.error("General Error:", error);
        }
    };

    const handleDeleteClick = async (id: number, name: string) => {
        if (window.confirm(`האם את בטוחה שברצונך למחוק את השיר "${name}"?`)) {
            await deleteSong(id);
            fetchData();
        }
    };

    return (
        <div className="manage-songs-container">
            <header className="page-header">
                <div className="header-text">
                    <h1>ניהול שירים</h1>
                    <p>הוסיפי, עדכני או מחקי שירים מהקטלוג</p>
                </div>
            </header>

            <div className="admin-grid">
                {/* טופס הוספה/עריכה */}
                <div className="form-side">
                    <div className="admin-card">
                        <div className="card-header">
                            {editingSong ? <Edit3 size={20} /> : <Plus size={20} />}
                            <h3>{editingSong ? `עריכת שיר: ${editingSong.songName}` : "הוספת שיר חדש"}</h3>
                        </div>

                        <form onSubmit={editingSong ? handleUpdate : handleSubmit} className="admin-form">
                            <div className="input-group">
                                <label>שם השיר</label>
                                <input 
                                    value={editingSong ? editName : songName} 
                                    onChange={e => editingSong ? setEditName(e.target.value) : setSongName(e.target.value)} 
                                    placeholder="הזיני שם שיר..." 
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <label>אמן</label>
                                <select 
                                    value={editingSong ? editArtistId : artistId} 
                                    onChange={e => editingSong ? setEditArtistId(Number(e.target.value)) : setArtistId(Number(e.target.value))} 
                                    required
                                >
                                    <option value="0">בחרי אמן</option>
                                    {artists.map(a => <option key={a.id} value={a.id}>{a.artistName}</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                <label>ז'אנר</label>
                                <select 
                                    value={editingSong ? editGenere : genere} 
                                    onChange={e => editingSong ? setEditGenere(e.target.value) : setGenere(e.target.value)}
                                >
                                    {genereOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="file-upload-row">
                                <div className="file-input-wrapper">
                                    <label><Upload size={14} /> תמונת קאבר</label>
                                    <input 
                                        key={`img-${fileKey}`}
                                        type="file" 
                                        accept="image/*" 
                                        onChange={e => editingSong ? setEditImage(e.target.files?.[0] ?? null) : setImageFile(e.target.files?.[0] ?? null)} 
                                    />
                                </div>
                                <div className="file-input-wrapper">
                                    <label><Music size={14} /> קובץ שמע</label>
                                    <input 
                                        key={`audio-${fileKey}`}
                                        type="file" 
                                        accept="audio/*" 
                                        onChange={e => editingSong ? setEditSongFile(e.target.files?.[0] ?? null) : setSongFile(e.target.files?.[0] ?? null)} 
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary">
                                    {editingSong ? <><Check size={18} /> שמירת שינויים</> : <><Plus size={18} /> הוספת שיר</>}
                                </button>
                                {editingSong && (
                                    <button type="button" className="btn-secondary" onClick={() => setEditingSong(null)}>
                                        <X size={18} /> ביטול
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* רשימת השירים */}
                <div className="list-side">
                    <div className="songs-scroll-list">
                        {songs.map(song => (
                            <div key={song.id} className="song-admin-item">
                                <div className="song-item-info">
                                    {song.arrImage ? (
                                        <img src={`data:image/jpeg;base64,${song.arrImage}`} className="song-thumb" alt="" />
                                    ) : (
                                        <div className="song-thumb-placeholder"><Music size={20} /></div>
                                    )}
                                    <div className="song-details">
                                        <span className="song-name">{song.songName}</span>
                                        <span className="artist-name"><Mic2 size={12} /> {song.artistName}</span>
                                        <span className="genre-tag">{song.genere}</span>
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button className="icon-btn edit" title="ערוך" onClick={() => handleEditClick(song)}>
                                        <Edit3 size={18} />
                                    </button>
                                    <button className="icon-btn delete" title="מחק" onClick={() => handleDeleteClick(song.id, song.songName)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSongs;