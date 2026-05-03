import { Navigate, RouterProvider, createBrowserRouter, Outlet } from "react-router-dom"; // 1. הוספתי Outlet
import { Paths } from "./paths";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AuthGuard from "../auth/AuthGuard";
import GuestGuard from "../auth/GuestGuard";
import AdminGuard from "../auth/AdminGuard";
import AdminLayout from "../pages/admin/AdminLayout";
import ManageArtists from "../pages/admin/ManageArtists";
import ManageSongs from "../pages/admin/ManageSongs";
import ManageUsers from "../pages/admin/ManageUsers";
import ProfilePage from "../pages/ProfilePage";    
import NowPlaying from "../pages/NowPlaying";
import SearchPage from "../pages/SearchPage";
import CreatePlaylist from "../pages/CreatePlaylist";
import PlaylistDetailsPage from "../pages/PlaylistDetailsPage";
import { Sidebar } from "../pages/Sidebar"; // 2. הוספתי ייבוא לסרגל
import LibraryPage from "../pages/LibraryPage";
import ManagePlaylists from "../pages/admin/ManagePlaylists";

// 3. יצרתי קומפוננטת Layout חדשה שמכילה את הסרגל
const MainLayout = () => (
    <div className="app-layout">
        <Sidebar />
        <main className="main-content">
            <Outlet /> {/* כאן ירונדרו הדפים השונים (Home, Profile וכו') */}
        </main>
    </div>
);

const Router = () => {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <Navigate to={Paths.login} />
        },
        // --- תחילת השינוי המרכזי ---
        {
            element: <AuthGuard><MainLayout /></AuthGuard>, // עוטף את כל דפי המשתמש ב-Layout וב-Guard
            children: [
                {
                    path: Paths.home,
                    element: <HomePage />
                },
                {
                    path: Paths.profile,
                    element: <AuthGuard><ProfilePage /></AuthGuard>
                },
                {
                    path: Paths.createPlaylist,
                    element: <AuthGuard><CreatePlaylist /></AuthGuard>
                },
                {
                    path: Paths.library,
                    element: <AuthGuard><LibraryPage /></AuthGuard>
                },
                {
                    path: Paths.nowPlaying + '/:id',
                    element: <AuthGuard><NowPlaying /></AuthGuard>
                },
                {
                    path: Paths.search,
                    element: <AuthGuard><SearchPage /></AuthGuard>
                },
                {
                    path: '/playlist/:id',
                    element: <PlaylistDetailsPage />
                },
            ]
        },
        // --- סוף השינוי המרכזי ---
        {
            path: Paths.login,
            element: <GuestGuard><LoginPage /></GuestGuard>
        },
        {
            path: Paths.register,
            element: <GuestGuard><RegisterPage /></GuestGuard>
        },
        {
            path: Paths.admin.root,
            element: <AdminGuard><AdminLayout /></AdminGuard>,
            children: [
                { path: 'artists', element: <ManageArtists /> },
                { path: 'songs', element: <ManageSongs /> },
                { path: 'users', element: <ManageUsers /> },
                { path: 'playlists', element: <ManagePlaylists /> },
            ]
        },
        {
            path: '*',
            element: <h1>404 - Page not found</h1>
        }
    ]);

    return <RouterProvider router={router} />
};

export default Router;