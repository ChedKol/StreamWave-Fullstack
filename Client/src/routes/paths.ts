// Define the paths for the application routes
export const Paths = {
    home: '/home',
    login: '/login',
    register: '/register',
    profile: '/profile',
    nowPlaying: '/now-playing',
    search: '/search',
    createPlaylist: '/create-playlist',
    library: '/library',
    artist: (id: number) => `/artist/${id}`,
    playlistDetails: (id: number) => `/playlist/${id}`,
    admin: {
        root: '/admin',
        artists: '/admin/artists',
        songs: '/admin/songs',
        users: '/admin/users',
        playlists: '/admin/playlists',
    }
}