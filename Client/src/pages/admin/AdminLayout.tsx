import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, Music, Mic2, ListMusic, ArrowRight } from 'lucide-react';
import { useAuthContext } from "../../auth/useAuthContext";
import { getUserById } from "../../services/user.service"; // וודאי שהנתיב נכון
import { Paths } from "../../routes/paths";
import type { AdminUser } from "../../types/user.types"; // וודאי שהנתיב נכון
import "../../style/Admin.Layout.css";

const AdminLayout = () => {
    const location = useLocation();
    const { user } = useAuthContext();
    // יצירת State לנתונים המלאים בדיוק כמו בסיידבר הרגיל
    const [fullAdminData, setFullAdminData] = useState<AdminUser | null>(null);
    
    const isActive = (path: string) => location.pathname === path;

    // משיכת הנתונים המלאים (כולל התמונה) לפי ה-ID
    useEffect(() => {
        const fetchAdminData = async () => {
            if (user?.userId) {
                try {
                    const data = await getUserById(Number(user.userId));
                    setFullAdminData(data);
                } catch (error) {
                    console.error("שגיאה במשיכת נתוני מנהל", error);
                }
            }
        };
        fetchAdminData();
    }, [user]);

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-logo-section">
                    <div className="admin-badge">Admin</div>
                    <h2 className="admin-title">ניהול מערכת</h2>
                </div>

                <nav className="admin-nav">
                    <Link to={Paths.home} className="nav-item back-link">
                        <ArrowRight size={20} />
                        <span>חזרה לאתר</span>
                    </Link>
                    
                    <div className="nav-separator"></div>

                    <Link to={Paths.admin.users} className={`nav-item ${isActive(Paths.admin.users) ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>משתמשים</span>
                    </Link>

                    <Link to={Paths.admin.artists} className={`nav-item ${isActive(Paths.admin.artists) ? 'active' : ''}`}>
                        <Mic2 size={20} />
                        <span>אמנים</span>
                    </Link>

                    <Link to={Paths.admin.songs} className={`nav-item ${isActive(Paths.admin.songs) ? 'active' : ''}`}>
                        <Music size={20} />
                        <span>שירים</span>
                    </Link>

                    <Link to={Paths.admin.playlists} className={`nav-item ${isActive(Paths.admin.playlists) ? 'active' : ''}`}>
                        <ListMusic size={20} />
                        <span>פלייליסטים</span>
                    </Link>
                </nav>

                {/* שימוש ב-fullAdminData כדי להציג את התמונה */}
                <div className="admin-profile-card">
                    <div className="admin-avatar-large">
                        {fullAdminData?.arrProfile ? (
                            <img src={`data:image/jpeg;base64,${fullAdminData.arrProfile}`} alt="Admin" />
                        ) : (
                            <span>{fullAdminData?.userName?.charAt(0).toUpperCase() || user?.userName?.charAt(0).toUpperCase() || 'A'}</span>
                        )}
                    </div>
                    <div className="admin-info">
                        <span className="admin-name">@{fullAdminData?.userName || user?.userName || 'Admin'}</span>
                        <span className="admin-role">מנהל מערכת</span>
                    </div>
                </div>
            </aside>

            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;