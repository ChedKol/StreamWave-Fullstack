import { useEffect, useState } from "react"
import { getArtists, createArtist , updateArtist, deleteArtist} from "../../services/artist.service"
import type { Artist } from "../../types/artist.types"

const ManageArtists = () => {
    const [artists, setArtists] = useState<Artist[]>([])
    const [artistName, setArtistName] = useState('')
    const [about, setAbout] = useState('')
    const [image, setImage] = useState<File | null>(null)

   // state לעריכה
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
    const [editName, setEditName] = useState('')
    const [editAbout, setEditAbout] = useState('')
    const [editImage, setEditImage] = useState<File | null>(null)

    const fetchArtists = async () => {
        const data = await getArtists()
        setArtists(data)
    }

    useEffect(() => {
        fetchArtists()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('artistName', artistName)
        formData.append('about', about)
        if (image) formData.append('fileImage', image)

        await createArtist(formData)
        setArtistName('')
        setAbout('')
        setImage(null)
        fetchArtists() // רענון הרשימה אחרי הוספה
    }

     //  פתיחת מצב עריכה
    const handleEditClick = (artist: Artist) => {
        setEditingArtist(artist)
        setEditName(artist.artistName)
        setEditAbout(artist.about)
        setEditImage(null)
    }
    
    //שמירת עדכון
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingArtist) return

        const formData = new FormData()
        formData.append('artistName', editName)
        formData.append('about', editAbout)
        if (editImage) formData.append('fileImage', editImage)

        await updateArtist(editingArtist.id, formData)
        setEditingArtist(null)
        fetchArtists()
    }

   //מחיקה
    const handleDelete = async (id: number) => {
        if (!confirm('האם למחוק את האמן?')) return
        await deleteArtist(id)
        fetchArtists()
    }

    const toImageSrc = (arrImage: string) => {
        return `data:image/jpeg;base64,${arrImage}`
    }
    return (
        <div>
            <h2>ניהול אמנים</h2>

            {/* טופס הוספה */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="שם אמן"
                    value={artistName}
                    onChange={e => setArtistName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="אודות"
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setImage(e.target.files?.[0] ?? null)}
                />
                <button type="submit">הוסף אמן</button>
            </form>

             {/* טופס עריכה — מוצג רק כשנבחר אמן לעריכה */}
            {editingArtist && (
                <form onSubmit={handleUpdate}>
                    <h3>עריכת: {editingArtist.artistName}</h3>
                    <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        required
                    />
                    <textarea
                        value={editAbout}
                        onChange={e => setEditAbout(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setEditImage(e.target.files?.[0] ?? null)}
                    />
                    <button type="submit">שמור</button>
                    <button type="button" onClick={() => setEditingArtist(null)}>ביטול</button>
                </form>
            )}

            {/* רשימת אמנים */}
            <div>
                {artists.map(artist => (
                    <div key={artist.id}>
                        {artist.arrImage && (
                            <img src={toImageSrc(artist.arrImage)} alt={artist.artistName} width={80} />
                        )}
                        <p>{artist.artistName}</p>
                        <button onClick={() => handleEditClick(artist)}>✏️ ערוך</button>
                        <button onClick={() => handleDelete(artist.id)}>🗑️ מחק</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ManageArtists