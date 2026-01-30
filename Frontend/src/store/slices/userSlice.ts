// src/store/slices/userSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  profile: Record<string, unknown> | null;
  preferences: Record<string, unknown>;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  preferences: {},
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.loading = false;
      state.profile = action.payload;
      state.error = null;
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePreferences: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const { 
  fetchProfileStart, 
  fetchProfileSuccess, 
  fetchProfileFailure,
  updatePreferences
} = userSlice.actions;
export default userSlice.reducer;
