import { type ReactNode } from "react"
import { Navigate } from "react-router"
import { useAuthContext } from "./useAuthContext"

type Props = {
    children: ReactNode
}
//הרכיב שמגן על המסכים שדורשים התחברות ומפנה למסך ההתחברות אם המשתמש לא מחובר
const GuestGuard = ({ children }: Props) => {
    const { isAuthorized, isInitialized } = useAuthContext()

    if (!isInitialized) return <div>Loading...</div>

    if (isAuthorized) return <Navigate to="/home" />

    return <>{children}</>
}

export default GuestGuard