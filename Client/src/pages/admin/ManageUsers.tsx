// components/admin/ManageUsers.tsx
import { useEffect, useState } from "react"
import { getAllUsers, deleteUser } from "../../services/user.service"
import type { AdminUser } from "../../types/user.types"
import { useAuthContext } from "../../auth/useAuthContext";

const ManageUsers = () => {
    const { isInitialized, user } = useAuthContext();
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        try {
            console.log("3. API call started"); // האם אנחנו מגיעים לפה?
            setLoading(true);
            const data = await getAllUsers();
            console.log("4. API response received:", data); // מה חזר מהשרת?
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

    // ... שאר הקוד

    const handleDelete = async (id: number) => {
        if (!confirm('האם את בטוחה שברצונך למחוק משתמש זה?')) return
        try {
            await deleteUser(id)
            fetchUsers() 
        } catch (error) {
            alert("מחיקה נכשלה");
        }
    }

    const toImageSrc = (arrImage: string) => {
        return `data:image/jpeg;base64,${arrImage}`
    }

    // אם עדיין לא אתחלנו את ה-Auth, נציג טעינה כללית
    if (!isInitialized || (loading && users.length === 0)) {
        return <div style={{ padding: '20px' }}>טוען נתוני מערכת...</div>
    }

    // הגנה למקרה שמישהו שאינו אדמין הגיע לכאן
    if (user?.role !== "Admin") {
        return <div style={{ padding: '20px', color: 'red' }}>אין לך הרשאות לצפות בדף זה.</div>
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>ניהול לקוחות רשומים ({users.length})</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'right' }}>
                        <th style={{ padding: '10px' }}>תמונה</th>
                        <th>שם משתמש</th>
                        <th>אימייל</th>
                        <th>סטטוס</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(userItem => (
                        <tr key={userItem.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>
                                {userItem.arrProfile ? (
                                    <img 
                                        src={toImageSrc(userItem.arrProfile)} 
                                        alt={userItem.userName} 
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        👤
                                    </div>
                                )}
                            </td>
                            <td>{userItem.userName}</td>
                            <td>{userItem.email}</td>
                            <td>
                                {userItem.isAdmin ? 
                                    <span style={{ color: '#d4af37', fontWeight: 'bold' }}>⭐ מנהל</span> : 
                                    'לקוח'
                                }
                            </td>
                            <td>
                                <button 
                                    onClick={() => handleDelete(userItem.id)}
                                    style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    🗑️ מחק
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default ManageUsers