import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Heart, Share2, Download, MessageCircle, Repeat, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSongById } from "../services/song.service";
import { Sidebar } from "./Sidebar"; 
import '../style/NowPlayingPage.css';

const NowPlaying = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [song, setSong] = useState<any>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchSongData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getSongById(Number(id));
                if (data) {
                    if (data.arrSong) {
                        const binaryString = window.atob(data.arrSong);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        const blob = new Blob([bytes], { type: 'audio/mpeg' });
                        setAudioUrl(URL.createObjectURL(blob));
                    }
                    setSong(data);
                }
            } catch (error) {
                console.error("Error loading song:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSongData();
    }, [id]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.volume = volume;

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
        };
    }, [audioUrl, volume]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getImageSrc = (base64: string | null) => 
        base64 ? `data:image/jpeg;base64,${base64}` : 'https://via.placeholder.com/300';

    if (loading) return <div className="loading-screen">StreamWave Experience...</div>;

    return (
        <div className="now-playing-page-layout">
            {/* התוכן המרכזי שכולל את התקליט והפאנל */}
            <main className="now-playing-main-content">
                <div className="figma-bg-glow"></div>

                <button onClick={() => navigate(-1)} className="figma-close-btn">
                    <X size={20} />
                </button>

                {/* התקליט במרכז השטח הפנוי */}
                <section className="vinyl-display-area">
                    <motion.div 
                        className="vinyl-record"
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    >
                        {[...Array(25)].map((_, i) => (
                            <div key={i} className="record-groove" style={{ margin: `${i * 2}%` }} />
                        ))}
                        <img src={getImageSrc(song?.arrImage)} alt="Cover" className="record-center-art" />
                        <div className="record-hole" />
                    </motion.div>
                </section>

                {/* פאנל שליטה צמוד לשמאל */}
                <aside className="song-details-sidebar">
                    <div className="artist-hero-img">
                        <img src={getImageSrc(song?.arrArtist || song?.arrImage)} alt="Artist" />
                    </div>

                    <div className="title-and-actions">
                        <h1>{song?.songName}</h1>
                        <h3>{song?.artistName}</h3>
                        <div className="meta-icons">
                            <MessageCircle size={18} /> <Download size={18} /> <Share2 size={18} /> <Heart size={18} />
                        </div>
                    </div>

                    <div className="lyrics-scroller">
                        <div className="player-tabs"><span>Lyrics</span> <span>Live Chat</span> <span>Info</span></div>
                        <p>In the midnight hour</p>
                        <p>When the stars align</p>
                        <p className="active-line">Feel the rhythm take over</p>
                    </div>

                    <div className="playback-footer">
                        <div className="scrubber-container">
                            <input 
                                type="range" 
                                min="0" 
                                max={duration || 0} 
                                value={currentTime} 
                                onChange={handleSeek} 
                                className="progress-slider-fix"
                                style={{
                                    background: `linear-gradient(to right, #00f5e1 ${(currentTime / (duration || 1)) * 100}%, #222 0%)`
                                }}
                            />
                            <div className="time-labels">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="controls-group">
                            <div className="sub-btns"><Shuffle size={18} /> <Repeat size={18} /></div>
                            
                            <div className="main-btns">
                                <SkipBack size={24} fill="white" />
                                <button onClick={togglePlay} className="play-circle">
                                    {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" style={{marginLeft: 4}} />}
                                </button>
                                <SkipForward size={24} fill="white" />
                            </div>

                            <div className="vol-btns">
                                <Volume2 size={18} />
                                <input type="range" className="vol-slider" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* הסיידבר של האפליקציה נמצא בסוף כדי שיופיע מימין */}
            <Sidebar />

            <audio ref={audioRef} src={audioUrl || ""} autoPlay />
        </div>
    );
};

export default NowPlaying;