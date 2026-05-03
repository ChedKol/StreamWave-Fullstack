import { Navigate } from "react-router"
import { useAuthContext } from "../auth/useAuthContext"
import { Paths } from "../routes/paths"

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, isInitialized } = useAuthContext()
    
    console.log('AdminGuard:', { user, isInitialized })
    
    if (!isInitialized) return null
    if (!user) return <Navigate to={Paths.login} />
    if (user.role !== "Admin") return <Navigate to={Paths.home} />
    
    return <>{children}</>
}
export default AdminGuard