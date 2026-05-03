import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  isInitialized: boolean;
  isAuthorized: boolean;
}

const initialState: AuthState = {
  user: null,
  isInitialized: false,
  isAuthorized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // שימי לב ל- <User | null> - זה המפתח לפתרון
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthorized = !!action.payload;
      state.isInitialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthorized = false;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;