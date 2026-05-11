import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { type RootState } from "../store/store";
import { useAuthContext } from "../auth/useAuthContext";
import { getRecommendedSongs, getFavoriteArtists } from "../services/song.service";
import type { Song } from "../types/song.types";
import { TrendingUp, Sparkles, Flame } from 'lucide-react';
import "../style/HomePage.css"; 

const HomePage = () => {
    const reduxUser = useSelector((state: RootState) => state.auth.user);
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
    const getSeasonTitle = () => {

    const month = new Date().getMonth();

    if (month >= 2 && month <= 4) {
        return 'Spring Vibes';
    }

    if (month >= 5 && month <= 7) {
        return 'Summer Vibes';
    }

    if (month >= 8 && month <= 10) {
        return 'Autumn Vibes';
    }

    return 'Winter Vibes';
};

    useEffect(() => {
        const fetchHomeData = async () => {
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

    const handleArtistClick = (id: number) => {
        navigate(`/artist/${id}`);
    };

    return (
        <div id="home-page-container">
            <header className="home-header">
                <h1 className="greeting-text">
                    {getGreeting()}, {reduxUser?.userName || 'אורח'}!
                </h1>
                <p className="subtitle-text">מוכנה להיכנס לקצב עם האמנים האהובים עליך?</p>
            </header>

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
                    <h2 className="banner-title">
                        {getSeasonTitle()} {new Date().getFullYear()}
                    </h2>
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
                                <div 
                                    key={artist.id} 
                                    className="artist-card-figma" 
                                    onClick={() => handleArtistClick(artist.id)}
                                >
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