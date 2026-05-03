import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// ייבוא של Redux
import { useSelector } from "react-redux"; 
import { type RootState } from "../store/store";
// ייבוא ה-Context המקורי (נשמר לצורך ה-ID ב-useEffect)
import { useAuthContext } from "../auth/useAuthContext";
import { getRecommendedSongs, getFavoriteArtists } from "../services/song.service";
import type { Song } from "../types/song.types";
import { TrendingUp, Sparkles, Flame } from 'lucide-react';
import "../style/HomePage.css"; 


const HomePage = () => {
    // שליפת המשתמש מה-Redux Store
    const reduxUser = useSelector((state: RootState) => state.auth.user);
    
    // שימוש ב-Context רק לצורך ה-ID כדי להריץ את ה-API
    const { user } = useAuthContext();
    
    const navigate = useNavigate();
    const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
    const [favoriteArtists, setFavoriteArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getImageSrc = (arrImage: string | null) => {
        if (!arrImage) return 'https://via.placeholder.com/150?text=No+Image';
        return `data:image/jpeg;base64,${arrImage}`;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'בוקר טוב';
        if (hour < 18) return 'צהריים טובים';
        return 'ערב טוב';
    };

    useEffect(() => {
        const fetchHomeData = async () => {
            // משתמשים ב-ID מה-Context כדי למשוך נתונים
            if (user?.userId) {
                try {
                    setLoading(true);
                    const userIdNum = Number(user.userId);
                    const [songs, artists] = await Promise.all([
                        getRecommendedSongs(userIdNum),
                        getFavoriteArtists(userIdNum)
                    ]);
                    setRecommendedSongs(songs);
                    setFavoriteArtists(artists);
                } catch (error) {
                    console.error("שגיאה בטעינת נתוני דף הבית", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchHomeData();
    }, [user?.userId]);

    const handleSongClick = (id: number) => {
        navigate(`/now-playing/${id}`);
    };

    return (
        <div id="home-page-container">
            {/* Header Section - כאן אנחנו משתמשים במידע מ-Redux */}
            <header className="home-header">
                <h1 className="greeting-text">
                    {getGreeting()}, {reduxUser?.userName || 'אורח'}!
                </h1>
                <p className="subtitle-text">מוכנה להיכנס לקצב עם האמנים האהובים עליך?</p>
            </header>

            {/* Featured Banner */}
            <div className="featured-banner">
                <img
                    src="https://images.unsplash.com/photo-1762788109986-8dcd959eeccb?q=80&w=1080"
                    alt="Featured"
                    className="banner-img"
                />
                <div className="banner-overlay" />
                <div className="banner-content">
                    <div className="trending-badge">
                        <Flame size={20} className="text-primary" />
                        <span>Trending Now</span>
                    </div>
                    <h2 className="banner-title">Summer Vibes 2026</h2>
                    <p className="banner-description">הטרקים הכי חמים ששורפים את הפלייליסט שלך עכשיו</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">טוען המלצות עבורך...</div>
            ) : (
                <>
                    <section className="home-section">
                        <div className="section-title-wrapper">
                            <Sparkles className="icon-primary" />
                            <h2>המלצות במיוחד עבורך</h2>
                        </div>
                        <p className="section-subtitle">מבוסס על האמנים שאת אוהבת</p>
                        <div className="cards-grid">
                            {recommendedSongs.map(song => (
                                <div key={song.id} className="song-card-figma" onClick={() => handleSongClick(song.id)}>
                                    <div className="image-wrapper">
                                        <img src={getImageSrc(song.arrImage)} alt={song.songName} />
                                    </div>
                                    <div className="card-info">
                                        <h4 className="song-name">{song.songName}</h4>
                                        <p className="artist-name">{song.artistName} • {song.genere}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="home-section">
                        <div className="section-title-wrapper">
                            <TrendingUp className="icon-primary" />
                            <h2>אמנים שאת עשויה לאהוב</h2>
                        </div>
                        <div className="artists-grid">
                            {favoriteArtists.map(artist => (
                                <div key={artist.id} className="artist-card-figma">
                                    <div className="artist-image-wrapper">
                                        <img src={getImageSrc(artist.arrImage)} alt={artist.artistName} />
                                    </div>
                                    <p className="artist-label">{artist.artistName}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default HomePage;