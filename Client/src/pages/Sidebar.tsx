import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../auth/useAuthContext';
import { getUserById } from "../services/user.service";
import { Paths } from '../routes/paths';
import { Home, Search, Library, PlusSquare, User as UserIcon, ShieldCheck } from 'lucide-react'; 
import type { AdminUser } from "../types/user.types";
import '../style/Sidebar.css';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext(); 
  const [fullUserData, setFullUserData] = useState<AdminUser | null>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchSidebarData = async () => {
      if (user?.userId) {
        try {
          const data = await getUserById(Number(user.userId));
          setFullUserData(data);
        } catch (error) {
          console.error("שגיאה במשיכת נתוני סיידבר", error);
        }
      }
    };
    fetchSidebarData();
  }, [user]);

  return (
    <div className="sidebar">
      {/* לוגו StreamWave */}
      <div className="sidebar-logo" onClick={() => navigate(Paths.home)}>
        <div className="logo-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="6" width="20" height="14" rx="2" stroke="#00CEEA" strokeWidth="2"/>
            <circle cx="7" cy="13" r="2" fill="#00CEEA"/>
            <line x1="12" y1="10" x2="18" y2="10" stroke="#00CEEA" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="13" x2="18" y2="13" stroke="#00CEEA" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 6L13 2" stroke="#00CEEA" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="logo-text">StreamWave</span>
      </div>

      <nav className="sidebar-nav">
        <div className={`nav-item ${isActive(Paths.home) ? 'active' : ''}`} onClick={() => navigate(Paths.home)}>
          <Home size={22} />
          <span>דף הבית</span>
        </div>
        
        <div className={`nav-item ${isActive(Paths.search) ? 'active' : ''}`} onClick={() => navigate(Paths.search)}>
          <Search size={20} />
          <span>חיפוש</span>
        </div>

        <div className={`nav-item ${isActive(Paths.library) ? 'active' : ''}`} onClick={() => navigate(Paths.library)}>
          <Library size={22} />
          <span>הספרייה שלי</span>
        </div>

        <div className="nav-separator"></div>

        <div className={`nav-item ${isActive(Paths.createPlaylist) ? 'active' : ''}`} onClick={() => navigate(Paths.createPlaylist)}>
          <PlusSquare size={22} />
          <span>צור פלייליסט</span>
        </div>
        
        <div className={`nav-item ${isActive(Paths.profile) ? 'active' : ''}`} onClick={() => navigate(Paths.profile)}>
          <UserIcon size={22} />
          <span>פרופיל</span>
        </div>

        {/* --- 2. תוספת: כפתור ניהול מערכת למנהלים בלבד --- */}
        {user?.role === "Admin" && (
          <>
            <div className="nav-separator"></div> 
            <div 
              className={`nav-item admin-item ${isActive(Paths.admin.root) ? 'active' : ''}`} 
              onClick={() => navigate(Paths.admin.root)}
              style={{ color: '#00CEEA' }} 
            >
              <ShieldCheck size={22} />
              <span>ניהול מערכת</span>
            </div>
          </>
        )}
      </nav>

      {/* אזור המשתמש למטה */}
      <div className="sidebar-footer" onClick={() => navigate(Paths.profile)}>
        <div className="user-avatar-small">
          {fullUserData?.arrProfile ? (
             <img 
               src={`data:image/jpeg;base64,${fullUserData.arrProfile}`} 
               alt="profile" 
             />
          ) : (
            <div className="avatar-placeholder">
              {fullUserData?.userName?.charAt(0).toUpperCase() || user?.userName?.charAt(0).toUpperCase() || 'N'}
            </div>
          )}
        </div>
        <div className="user-details">
          <span className="user-name">@{fullUserData?.userName || user?.userName || 'naama'}</span>
          <span className="user-email">{fullUserData?.email || user?.email || 'naamawe06@gmail.com'}</span>
        </div>
      </div>
    </div>
  );
};