import { useEffect, useState } from "react";
import { useAuthContext } from "../auth/useAuthContext";
import { getUserById, updateUser } from "../services/user.service";
import { removeSession } from "../auth/auth.utils";
import type { AdminUser } from "../types/user.types";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, User,  ChevronUp } from 'lucide-react';
import '../style/ProfilePage.css';

const ProfilePage = () => {
    const { user, fetchUser } = useAuthContext(); 
    const navigate = useNavigate();
    const [userData, setUserData] = useState<AdminUser | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    
    // State חדש לניהול הצגת הטופס
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.userId) {
                try {
                    const data = await getUserById(Number(user.userId));
                    setUserData(data);
                } catch (error) {
                    console.error("שגיאה בטעינת נתוני משתמש", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserData();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (userData) {
            setUserData({ ...userData, [e.target.name]: e.target.value });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData) return;

        try {
            const data = new FormData();
            data.append('UserName', userData.userName); 
            data.append('Email', userData.email);
            
            if (newPassword.trim() !== "") {
                data.append('Password', newPassword);
            }
            
            if (profileImage) {
                data.append('FileProfile', profileImage);
            }

            await updateUser(userData.id, data); 

            await fetchUser(); 
            alert('הפרופיל עודכן בהצלחה!');
            setIsEditing(false); // סגירת הטופס לאחר עדכון
            navigate("/"); 
        } catch (error) {
            console.error("Update failed:", error);
            alert('עדכון הפרופיל נכשל');
        }
    };

    if (loading) return <div className="loading-container">טוען נתונים...</div>;

    return (
        <div className="new-profile-layout">
            
          
            <div className="profile-hero">
                <div className="avatar-halo-container large">
                    {userData?.arrProfile ? (
                        <img 
                            src={`data:image/jpeg;base64,${userData.arrProfile}`} 
                            alt="Profile" 
                            className="main-profile-avatar large-avatar" 
                        />
                    ) : (
                        <div className="main-profile-placeholder large-avatar">
                            {userData?.userName?.charAt(0).toUpperCase() || 'N'}
                        </div>
                    )}
                </div>
                
                <div className="user-text-info">
                   <h1 className="gradient-username">@{userData?.userName || 'naama'}</h1>
                   <p className="sub-email">{userData?.email || 'naamawe06@gmail.com'}</p>
                </div>

              
                <button 
                    className={`gradient-edit-btn ${isEditing ? 'active' : ''}`}
                    onClick={() => setIsEditing(!isEditing)}
                >
                   {isEditing ? <ChevronUp size={18} /> : <Sparkles size={18} />} 
                   {isEditing ? 'סגור עריכה' : 'ערוך פרופיל'}
                </button>
            </div>


            {isEditing && (
                <div className="profile-form-section animate-fade-in">
                    <form onSubmit={handleSubmit} className="new-form-grid">
                        
                        <div className="form-input-group">
                            <div className="input-header">
                                <User size={18} /> שם משתמש
                            </div>
                            <input
                                type="text"
                                name="userName"
                                value={userData?.userName || ''}
                                onChange={handleChange}
                                placeholder="הכנס שם משתמש..."
                            />
                        </div>

                        <div className="form-input-group">
                            <div className="input-header">
                                <Mail size={18} /> אימייל
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={userData?.email || ''}
                                onChange={handleChange}
                                placeholder="תקן אימייל..."
                            />
                        </div>

                        <div className="form-input-group">
                            <div className="input-header">
                                סיסמה חדשה
                            </div>
                            <input
                                type="password"
                                placeholder="השאר ריק אם אין שינוי..."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <label className="upload-btn-new">
                            החלף תמונה
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{display: 'none'}}
                            />
                        </label>

                        <button type="submit" className="save-changes-btn">
                            שמור שינויים
                        </button>
                    </form>
                </div>
            )}

            <div className="footer-actions">
                {!isEditing && <div className="form-divider-new"></div>}
                <button 
                    className="full-logout-btn" 
                    onClick={() => { removeSession(); window.location.reload(); }} 
                >
                    התנתק מהמערכת
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;