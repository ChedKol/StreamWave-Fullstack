import { useContext } from "react"
import { AuthContext } from "./AuthContext"
//ה-hook של האותנטיקציה שמאפשר לכל קומפוננטה לגשת למידע על המשתמש הנוכחי והאם הוא מחובר או לא   
export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuthContext must be used within AuthProvider')
    return context
}
