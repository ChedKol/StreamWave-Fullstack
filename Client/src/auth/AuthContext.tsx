import { createContext, useState, useEffect, type ReactNode } from "react"
import type { User, AdminUser } from "../types/user.types"
import { getSession, removeSession, setSession } from "./auth.utils"
import { jwtDecode } from "jwt-decode"
import { getUserById } from "../services/user.service"
import { useDispatch } from "react-redux" 
import { setUser as setReduxUser } from "../store/authSlice" 

type AuthStateType = {
    user: User | null
    isInitialized: boolean
}

type AuthContextType = AuthStateType & {
    isAuthorized: boolean
    setUser: (user: User) => void
    fetchUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useDispatch(); // הכלי של Redux
    const [authState, setAuthState] = useState<AuthStateType>({
        user: null,
        isInitialized: false
    })

    const setUser = (user: User | null) => {
        setAuthState(prev => ({ ...prev, user }));
        dispatch(setReduxUser(user)); 
    }

    const fetchUser = async () => {
        const token = getSession();
        if (token) {
            setSession(token);
            try {
                const decoded: any = jwtDecode(token);
                const userId = decoded.userId || decoded.nameid || decoded.sub; 

                if (!userId) throw new Error("No user ID found in token");

                const freshUserData: AdminUser = await getUserById(Number(userId));
                
                const userToSet: User = {
                    userId: freshUserData.id.toString(),
                    userName: freshUserData.userName,
                    email: freshUserData.email,
                    role: freshUserData.isAdmin ? "Admin" : "User"
                };

                setUser(userToSet); 
            } catch (error) {
                console.error("Failed to fetch fresh user data", error);
                removeSession(); 
                setUser(null);
            }
        }
        setAuthState(prev => ({ ...prev, isInitialized: true }));
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{
            ...authState,
            setUser: (user: User) => setUser(user),
            fetchUser,
            isAuthorized: !!authState.user
        }}>
            {children}
        </AuthContext.Provider>
    )
}