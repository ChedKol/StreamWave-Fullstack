import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../services/user.service";
import type { AdminUser } from "../../types/user.types";
import { useAuthContext } from "../../auth/useAuthContext";
import { Trash2, User, Crown, Mail, Loader2 } from 'lucide-react';
import "../../style/Admin.ManageUsers.css";

const ManageUsers = () => {
    const { isInitialized, user } = useAuthContext();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);


    const fetchUsers = async () => {
        try {
            console.log("3. API call started");
            setLoading(true);
            const data = await getAllUsers();
            console.log("4. API response received:", data);
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isInitialized && user) {
            console.log("Current Role:", user.role);
            if (user.role === "Admin") {
                fetchUsers();
            }
        }
    }, [isInitialized, user]);

    const handleDelete = async (id: number) => {
        if (!confirm('האם את בטוחה שברצונך למחוק משתמש זה?')) return;
        try {
            await deleteUser(id);
            fetchUsers();
        } catch (error) {
            alert("מחיקה נכשלה");
        }
    }

    const toImageSrc = (arrImage: string) => {
        return `data:image/jpeg;base64,${arrImage}`;
    }

    if (!isInitialized || (loading && users.length === 0)) {
        return (
            <div className="admin-loader">
                <Loader2 className="spinner" />
                <span>טוען נתוני מערכת...</span>
            </div>
        );
    }

    if (user?.role !== "Admin") {
        return <div className="admin-error">אין לך הרשאות לצפות בדף זה.</div>;
    }

    return (
        <div className="manage-users-container">
            <header className="page-header">
                <div className="header-text">
                    <h1>ניהול לקוחות רשומים</h1>
                    <p>קיימים {users.length} משתמשים במערכת</p>
                </div>
            </header>
            
            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>משתמש</th>
                            <th>פרטי קשר</th>
                            <th>סטטוס</th>
                            <th className="actions-column">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(userItem => (
                            <tr key={userItem.id}>
                                <td>
                                    <div className="user-info-cell">
                                        <div className="user-avatar-wrapper">
                                            {userItem.arrProfile ? (
                                                <img 
                                                    src={toImageSrc(userItem.arrProfile)} 
                                                    alt={userItem.userName} 
                                                    className="table-avatar"
                                                />
                                            ) : (
                                                <div className="table-avatar-placeholder">
                                                    <User size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="user-name-text">{userItem.userName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="email-cell">
                                        <Mail size={14} />
                                        <span>{userItem.email}</span>
                                    </div>
                                </td>
                                <td>
                                    {userItem.isAdmin ? (
                                        <span className="status-badge admin">
                                            <Crown size={12} />
                                            מנהל
                                        </span>
                                    ) : (
                                        <span className="status-badge user">לקוח</span>
                                    )}
                                </td>
                                <td className="actions-column">
                                    <button 
                                        className="btn-delete"
                                        onClick={() => handleDelete(userItem.id)}
                                        title="מחק משתמש"
                                    >
                                        <Trash2 size={18} />
                                        <span>מחק</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageUsers;