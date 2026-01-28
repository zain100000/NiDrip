/**
 * @file authSlice.js
 * @module Redux/Slices/Auth
 * @description
 * Redux Toolkit slice managing the complete authentication flow.
 *
 * Handles:
 * - User registration (multipart/form-data support for profile pictures etc.)
 * - User login with JWT token storage in AsyncStorage
 * - Secure logout (server-side invalidation + local token clearance)
 * - Initial auth state check on app start (token validation + user fetch)
 *
 * Features:
 * - Proper loading, success, error, and message states
 * - Async thunks with rejectWithValue for clean error handling
 * - Automatic token persistence & removal
 * - Fail-safe local logout even if server request fails
 * - Optional server-side token verification on checkAuth
 *
 * Exports:
 * - Thunks: registerUser, loginUser, logoutUser, checkAuth
 * - Action: clearAuthState (manual reset)
 * - Reducer: default export for store configuration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

/**
 * Register a new user (supports file upload e.g. profile picture)
 * @param {Object} formData - FormData object containing registration fields
 */
export const registerUser = createAsyncThunk(
  'user/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/user/signup-user`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const { message, success } = response.data;

      if (typeof success !== 'boolean') {
        throw new Error('Invalid registration response');
      }

      return { message, success };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Registration failed',
        success: backend?.success ?? false,
      });
    }
  },
);

/**
 * Login user and store JWT token
 * @param {Object} loginData - { email, password }
 */
export const loginUser = createAsyncThunk(
  'user/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/user/signin-user`,
        loginData,
      );

      const { token, user, message, success } = response.data;

      if (!success || !token || !user) {
        throw new Error('Invalid login response');
      }

      await AsyncStorage.setItem('authToken', token);

      return { user, token, message };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Login failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * Forgot Password
 * @param {Object} data - { email, role }
 */

export const forgotPassword = createAsyncThunk(
  'user/forgot-password',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/auth/forgot-password`, {
        email,
        role: 'USER',
      });

      const { message, success } = response.data;

      if (!success) throw new Error(message);

      return { message };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Forgot password failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);


/**
 * Reset Password
 * @param {Object} data - { newPassword, role }
 */

export const resetPassword = createAsyncThunk(
  'user/reset-password',
  async ({ newPassword, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/auth/reset-password/${token}`,
        {
          newPassword,
          role: 'USER',
        },
      );

      const { message, success } = response.data;

      if (!success) throw new Error(message);

      return { message };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Reset failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * Logout user - calls server logout endpoint and clears local token
 */
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      await axios.post(
        `${BACKEND_API_URL}/user/logout-user`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await AsyncStorage.removeItem('authToken');

      return true;
    } catch (error) {
      await AsyncStorage.removeItem('authToken');

      return rejectWithValue({
        message: error.response?.data?.message || 'Logout failed',
      });
    }
  },
);

/**
 * Check Auth
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        return { isAuthenticated: false };
      }

      const response = await axios.get(`${BACKEND_API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        isAuthenticated: true,
        user: response.data.user,
        token,
      };
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
      return rejectWithValue({ isAuthenticated: false });
    }
  },
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.token;
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logoutUser.pending, state => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.message = 'Logged out successfully';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      .addCase(checkAuth.pending, state => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        if (action.payload.isAuthenticated) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      })
      .addCase(checkAuth.rejected, state => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;
