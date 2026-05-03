/* LoginPage.tsx */
import { useState } from "react";
import { useAuthContext } from "../auth/useAuthContext";
import { setSession } from "../auth/auth.utils";
import { login } from "../services/auth.service";
import { jwtDecode } from "jwt-decode";
import type { User } from "../types/user.types";
import { useNavigate, Link } from "react-router";
import { Paths } from "../routes/paths";
import { Music, Mail, Lock, Sparkles } from 'lucide-react';
import '../style/LoginPage.css';

const LoginPage = () => {
    const { setUser } = useAuthContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const token = await login(formData.email, formData.password);
            const user = jwtDecode<User>(token);
            setSession(token);
            setUser(user);
            navigate(Paths.home);
        } catch (error) {
            console.error(error);
            setError('התחברות נכשלה');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="hero-section">
                <img 
                    src="https://images.unsplash.com/photo-1709877769536-20bf1043b210?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMHR1cnF1b2lzZXxlbnwxfHx8fDE3NzQxOTgxMjh8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                    className="hero-bg-image" 
                    alt="Music" 
                />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="brand-header">
                        <Music className="brand-icon-white" />
                        <h1 className="brand-name">StreamWave</h1>
                    </div>
                    <h2 className="hero-title">Welcome Back!</h2>
                    <p className="hero-description">
                        Your music journey continues here. Dive back into your favorite tracks.
                    </p>
                    {/* המלבן המוגדל */}
                    <div className="whats-new-card">
                        <div className="card-header">
                            <Sparkles className="sparkle-icon" />
                            <h3>What's New</h3>
                        </div>
                        <ul className="news-list">
                            <li>New collaborative playlist features</li>
                            <li>Enhanced lyrics display</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="form-section">
                <div className="form-wrapper">
                    <form onSubmit={handleSubmit} className="auth-form">
                        <header className="form-header">
                            <h2>Sign In</h2>
                            <p>Continue your music journey</p>
                        </header>

                        {error && <div className="error-box">{error}</div>}

                        <div className="input-group">
                            <label>Email</label>
                            <div className="input-relative">
                                <Mail className="input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-relative">
                                <Lock className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? "Signing In..." : "Sign In"}
                        </button>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <p className="footer-text">
                            Don't have an account? 
                            <Link to={Paths.register} className="link"> Create Account</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;