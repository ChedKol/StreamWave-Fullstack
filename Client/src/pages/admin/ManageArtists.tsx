import { useEffect, useState } from "react"
import { getArtists, createArtist, updateArtist, deleteArtist } from "../../services/artist.service"
import type { Artist } from "../../types/artist.types"
import { Pencil, Trash2, Plus, X, Upload, UserCircle } from "lucide-react"
import "../../style/Admin.ManageArtists.css"

const ManageArtists = () => {
    const [artists, setArtists] = useState<Artist[]>([])
    const [artistName, setArtistName] = useState('')
    const [about, setAbout] = useState('')
    const [image, setImage] = useState<File | null>(null)

    const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
    const [editName, setEditName] = useState('')
    const [editAbout, setEditAbout] = useState('')
    const [editImage, setEditImage] = useState<File | null>(null)

    const fetchArtists = async () => {
        try {
            const data = await getArtists()
            console.log("נתוני אמנים מהשרת:", data)
            setArtists(data || [])
        } catch (error) {
            console.error("שגיאה בטעינת אמנים", error)
        }
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
        fetchArtists()
    }

    const handleEditClick = (artist: Artist) => {
        setEditingArtist(artist)
        setEditName(artist.artistName)
        setEditAbout(artist.about)
        setEditImage(null)
    }
    
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

    const handleDelete = async (id: number) => {
        if (!confirm('האם למחוק את האמן?')) return
        await deleteArtist(id)
        fetchArtists()
    }

    const toImageSrc = (arrImage: string) => `data:image/jpeg;base64,${arrImage}`

    return (
        <div className="manage-artists-container">
            <header className="page-header">
                <div className="header-text">
                    <h1>ניהול אמנים</h1>
                    <p>הוספה, עריכה ומחיקה של אמנים במערכת</p>
                </div>
            </header>

            <section className="add-artist-section">
                <form onSubmit={handleSubmit} className="admin-card-form">
                    <div className="form-grid">
                        <div className="file-upload-wrapper">
                            <label className="file-label">
                                <Upload size={20} />
                                <span>{image ? image.name : 'בחר תמונת אמן'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImage(e.target.files?.[0] ?? null)}
                                    hidden
                                />
                            </label>
                        </div>
                        <div className="inputs-wrapper">
                            <input
                                type="text"
                                placeholder="שם האמן"
                                value={artistName}
                                onChange={e => setArtistName(e.target.value)}
                                required
                                className="admin-input"
                            />
                            <textarea
                                placeholder="אודות האמן..."
                                value={about}
                                onChange={e => setAbout(e.target.value)}
                                className="admin-textarea"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary">
                        <Plus size={18} /> הוסף אמן חדש
                    </button>
                </form>
            </section>

            <div className="artists-grid">
                {artists.map(artist => (
                    <div key={artist.id} className="artist-admin-card">
                        <div className="artist-card-image">
                            {artist.arrImage ? (
                                <img src={toImageSrc(artist.arrImage)} alt={artist.artistName} />
                            ) : (
                                <div className="artist-icon-placeholder"><UserCircle size={40} /></div>
                            )}
                            <div className="card-overlay">
                                <button onClick={() => handleEditClick(artist)} className="overlay-btn edit"><Pencil size={18} /></button>
                                <button onClick={() => handleDelete(artist.id)} className="overlay-btn delete"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <div className="artist-card-info">
                            <h3>{artist.artistName}</h3>
                            <p>{artist.about || 'אין תיאור זמין'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {editingArtist && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="modal-header">
                            <h3>עריכת אמן: {editingArtist.artistName}</h3>
                            <button className="close-btn" onClick={() => setEditingArtist(null)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="modal-form">
                            <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                required
                                className="admin-input"
                            />
                            <textarea
                                value={editAbout}
                                onChange={e => setEditAbout(e.target.value)}
                                className="admin-textarea"
                            />
                            <label className="file-label">
                                <Upload size={18} />
                                <span>{editImage ? editImage.name : 'החלף תמונה (אופציונלי)'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setEditImage(e.target.files?.[0] ?? null)}
                                    hidden
                                />
                            </label>
                            <div className="modal-actions">
                                <button type="submit" className="btn-save">שמור שינויים</button>
                                <button type="button" className="btn-cancel" onClick={() => setEditingArtist(null)}>ביטול</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageArtists;