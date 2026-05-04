import React, { useState } from "react";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2';
import { Music, Mail, Lock, User as UserIcon, Camera, ChevronLeft } from 'lucide-react';

import { useAuthContext } from "../auth/useAuthContext";
import { setSession } from "../auth/auth.utils";
import { register, login, verifyEmail } from "../services/auth.service";
import { Paths } from "../routes/paths";
import type { User } from "../types/user.types";

import "../style/RegisterPage.css";

const RegisterPage = () => {
    const { setUser } = useAuthContext();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. בדיקה מקומית של התאמת סיסמאות
    if (formData.password !== formData.confirmPassword) {
        Swal.fire({
            title: 'Wait!',
            text: "Passwords do not match",
            icon: 'warning',
            confirmButtonColor: '#00eeff',
            background: '#1a1a1a',
            color: '#fff'
        });
        return;
    }

    try {
        const data = new FormData();
        data.append('userName', formData.userName);
        data.append('email', formData.email);
        data.append('password', formData.password);
        if (profileImage) data.append('fileProfile', profileImage);
        
        await register(data);
        setStep(4); 
    } catch (error: any) {
        console.error("Registration error details:", error);

        // 2. חילוץ הודעת השגיאה האמיתית מהשרת (אם קיימת)
        const serverErrorMessage = error.response?.data?.message || error.message;

        let finalMessage = 'Please check your details and try again.';
        
        // בדיקה אם השגיאה קשורה לסיסמה (לפי טקסט נפוץ מהשרת)
        if (serverErrorMessage?.toLowerCase().includes('password')) {
            finalMessage = 'The password does not meet the requirements (e.g., too short or missing characters).';
        } else if (serverErrorMessage?.toLowerCase().includes('email')) {
            finalMessage = 'This email is already registered or invalid.';
        }

        Swal.fire({
            title: 'Registration Failed',
            text: finalMessage, // עכשיו ההודעה תהיה מדויקת יותר
            icon: 'error',
            confirmButtonColor: '#00eeff',
            background: '#1a1a1a',
            color: '#fff'
        });
    }
};

    const handleVerifyAndLogin = async () => {
        try {
            await verifyEmail(formData.email, verificationCode);

            // התחברות אוטומטית לאחר אימות מוצלח
            const token = await login(formData.email, formData.password);
            const user = jwtDecode<User>(token);
            
            setSession(token);
            setUser(user);
            
            Swal.fire({
                title: 'Success!',
                text: 'Email verified. Welcome to StreamWave!',
                icon: 'success',
                confirmButtonColor: '#00eeff'
            });

            navigate(Paths.home);
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Verification Failed',
                text: 'Please check the code and try again.',
                icon: 'error',
                confirmButtonColor: '#00eeff'
            });
        }
    };

    return (
        <div className="register-page-wrapper">
            <div className="side-hero">
                <img src="https://images.unsplash.com/photo-1634717037148-4dc76c09a328?q=80&w=1080" alt="Music" />
                <div className="hero-overlay">
                    <div className="hero-content">
                        <div className="hero-logo">
                            <Music size={40} color="#00eeff" />
                            <span>StreamWave</span>
                        </div>
                        <h2>Join the Music Revolution</h2>
                        <p>Discover music like never before. Connect with millions of music lovers.</p>
                    </div>
                </div>
            </div>

            <div className="form-container-side">
                <div className="form-card-step">
                    <div className="stepper">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>{s}</div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="step-content">
                                <h1>Create Account</h1>
                                <p>Start your music journey today</p>
                                <div className="input-group-label">Email</div>
                                <div className="input-box">
                                    <Mail className="input-icon" size={18} />
                                    <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="input-group-label">Password</div>
                                <div className="input-box">
                                    <Lock className="input-icon" size={18} />
                                    <input type="password" name="password" placeholder="Min. 8 characters" value={formData.password} onChange={handleChange} required />
                                </div>
                                <div className="input-group-label">Confirm Password</div>
                                <div className="input-box">
                                    <Lock className="input-icon" size={18} />
                                    <input type="password" name="confirmPassword" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required />
                                </div>
                                <button type="button" className="btn-main-cyan" onClick={() => setStep(2)}>Continue</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-content">
                                <h1>Personal Info</h1>
                                <p>Choose how others will see you</p>
                                <div className="input-group-label">Username</div>
                                <div className="input-box">
                                    <UserIcon className="input-icon" size={18} />
                                    <input type="text" name="userName" placeholder="johndoe123" value={formData.userName} onChange={handleChange} required />
                                </div>
                                <div className="navigation-buttons">
                                    <button type="button" className="btn-back-figma" onClick={() => setStep(1)}>
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                    <button type="button" className="btn-main-cyan flex-1" onClick={() => setStep(3)}>Continue</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="step-content">
                                <h1>Final Step</h1>
                                <p>Set up your profile picture</p>
                                <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                <div className="custom-upload-box" onClick={() => document.getElementById('file-upload')?.click()}>
                                    {previewUrl ? (
                                        <img src={previewUrl} className="image-preview" alt="Preview" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Camera size={42} />
                                            <span>Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="navigation-buttons">
                                    <button type="button" className="btn-back-figma" onClick={() => setStep(2)}>
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                    <button type="submit" className="btn-main-cyan flex-1">Finish & Register</button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="step-content">
                                <h1>Verify Your Email</h1>
                                <p>We sent a 6-digit code to <b>{formData.email}</b></p>
                                
                                <div className="input-group-label">Verification Code</div>
                                <div className="input-box">
                                    <Lock className="input-icon" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="000000" 
                                        value={verificationCode} 
                                        onChange={(e) => setVerificationCode(e.target.value)} 
                                        maxLength={6}
                                        required 
                                    />
                                </div>
                                
                                <button 
                                    type="button" 
                                    className="btn-main-cyan" 
                                    onClick={handleVerifyAndLogin} 
                                >
                                    Verify & Start Listening
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;