import { useEffect, useState } from "react"
import { getSongs, createSong, updateSong, deleteSong } from "../../services/song.service"
import { getArtists } from "../../services/artist.service"
import type { Song } from "../../types/song.types"
import type { Artist } from "../../types/artist.types"

const ManageSongs = () => {
    const [songs, setSongs] = useState<Song[]>([])
    const [artists, setArtists] = useState<Artist[]>([])

    // Add Form State
    const [songName, setSongName] = useState('')
    const [artistId, setArtistId] = useState<number>(0)
    const [genere, setGenere] = useState('0')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [songFile, setSongFile] = useState<File | null>(null)
    const [fileKey, setFileKey] = useState(Date.now())

    // Edit Form State
    const [editingSong, setEditingSong] = useState<Song | null>(null)
    const [editName, setEditName] = useState('')
    const [editArtistId, setEditArtistId] = useState<number>(0)
    const [editGenere, setEditGenere] = useState('0')
    const [editImage, setEditImage] = useState<File | null>(null)
    const [editSongFile, setEditSongFile] = useState<File | null>(null)

    const genereOptions = [
        { value: 0, label: 'Pop' },
        { value: 1, label: 'Rock' },
        { value: 2, label: 'Folk' },
        { value: 3, label: 'Country' },
        { value: 4, label: 'Jewish' },
    ];
    const fetchData = async () => {
        const [songsData, artistsData] = await Promise.all([getSongs(), getArtists()])
        setSongs(songsData)
        setArtists(artistsData)
    }

    useEffect(() => { fetchData() }, [])

    const resetForm = () => {
        setSongName('')
        setArtistId(0)
        setGenere('0')
        setImageFile(null)
        setSongFile(null)
        setFileKey(Date.now()) // Clears both file inputs
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('SongName', songName)
        formData.append('ArtistId', artistId.toString())
        formData.append('Genere', genere)
        if (imageFile) formData.append('FileImage', imageFile)
        if (songFile) formData.append('FileSong', songFile)

        await createSong(formData)
        resetForm()
        fetchData()
    }


const handleEditClick = (song: Song) => {
    
    setEditingSong(song);
    setEditName(song.songName);
    
    // נשתמש בשם השדה בדיוק כפי שמופיע ב-Type שלך
    setEditArtistId(song.artistId); 

    // המרת הז'אנר למספר (Value) מתוך המערך, כי השרת מצפה למספר ה-Enum
    const genreObj = genereOptions.find(opt => opt.label === song.genere);
    setEditGenere(genreObj ? genreObj.value.toString() : "0");
};

const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    const formData = new FormData();
    
    formData.append('SongName', editName);
    
    // התיקון כאן: שימוש ב-String() במקום .toString() 
    // String(undefined) יחזיר "undefined" כטקסט ולא יקריס את כל האתר
    formData.append('ArtistId', String(editArtistId));
    formData.append('Genere', String(editGenere));

    if (editImage) formData.append('FileImage', editImage);
    if (editSongFile) formData.append('FileSong', editSongFile);


    try {


        await updateSong(editingSong.id, formData);
        setEditingSong(null);
        fetchData();
        alert("השיר עודכן בהצלחה!");
    } catch (error:any) {

    
            console.error("General Error:", error);
    }
};


    const handleDelete = async (id: number) => {
        if (confirm('Delete this song?')) {
            await deleteSong(id)
            fetchData()
        }
    }

    return (
        <div style={{ direction: 'ltr', padding: '20px' }}>
            <h2>Manage Songs</h2>
            
            {/* ADD SONG FORM */}
            <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
                <h3>Add New Song</h3>
                <input placeholder="Song Name" value={songName} onChange={e => setSongName(e.target.value)} required />
                
                <select value={artistId} onChange={e => setArtistId(Number(e.target.value))} required>
                    <option value="0">Select Artist</option>
                    {artists.map(a => <option key={a.id} value={a.id}>{a.artistName}</option>)}
                </select>

                {/* שימוש ב-MAP ליצירת האופציות בטופס הוספה */}
                <select value={genere} onChange={e => setGenere(e.target.value)}>
                    {genereOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <div style={{ marginTop: '10px' }}>
                    <label>Cover Image: </label>
                    <input 
                        key={`img-${fileKey}`} 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setImageFile(e.target.files?.[0] ?? null)} 
                    />
                </div>
                
                <div style={{ marginTop: '10px' }}>
                    <label>Audio File: </label>
                    <input 
                        key={`audio-${fileKey}`} 
                        type="file" 
                        accept="audio/*" 
                        onChange={e => setSongFile(e.target.files?.[0] ?? null)} 
                    />
                </div>

                <button type="submit" style={{ marginTop: '15px' }}>Add Song</button>
            </form>

{/* EDIT SONG FORM */}
{editingSong && (
    <div style={{ backgroundColor: '#f0fdf4', padding: '15px', marginBottom: '20px', border: '2px solid #22c55e' }}>
        <h3>Editing: {editingSong.songName}</h3>
        <form onSubmit={handleUpdate}>
            <input value={editName} onChange={e => setEditName(e.target.value)} required />
            
            <select value={editArtistId} onChange={e => setEditArtistId(Number(e.target.value))}>
                {artists.map(a => <option key={a.id} value={a.id}>{a.artistName}</option>)}
            </select>

            {/* התיקון כאן: שימוש ב-editGenere במקום ב-genere */}
            <select value={editGenere} onChange={e => setEditGenere(e.target.value)}>
                {genereOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <div style={{ marginTop: '10px' }}>
                <label>Change Cover (Optional): </label>
                <input type="file" accept="image/*" onChange={e => setEditImage(e.target.files?.[0] ?? null)} />
            </div>

            <div style={{ marginTop: '10px' }}>
                <label>Change Audio (Optional): </label>
                <input type="file" accept="audio/*" onChange={e => setEditSongFile(e.target.files?.[0] ?? null)} />
            </div>

            <button type="submit" style={{ marginTop: '10px' }}>Save Changes</button>
            <button type="button" onClick={() => setEditingSong(null)}>Cancel</button>
        </form>
    </div>
)}

            <hr />

            {/* SONGS LIST */}
            <div className="songs-list">
                {songs.map(song => (
                    <div key={song.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {song.arrImage && <img src={`data:image/jpeg;base64,${song.arrImage}`} width={50} height={50} style={{objectFit: 'cover'}} alt="" />}
                        <div style={{ flex: 1 }}>
                            <strong>{song.songName}</strong> by {song.artistName} <br />
                            <small>Genre: {song.genere}</small>
                        </div>
                        <button onClick={() => handleEditClick(song)}>✏️ Edit</button>
                        <button onClick={() => handleDelete(song.id)}>🗑️ Delete</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ManageSongs