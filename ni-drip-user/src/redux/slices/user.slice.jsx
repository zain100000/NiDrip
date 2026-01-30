/**
 * @file userSlice.js
 * @module Redux/Slices/User
 * @description
 * Redux Toolkit slice for managing user profile operations.
 *
 * Handles:
 * - Fetching current user profile by ID (authenticated)
 * - Updating user profile (multipart/form-data support for avatar, etc.)
 * - Send Email Verification
 * - Verify Email
 * - Update User Location
 * - Deleting user account with server-side removal + local cleanup
 *
 * Features:
 * - Token-based authentication via AsyncStorage
 * - Proper loading/error state management
 * - Multipart/form-data support for profile picture uploads
 * - Safe local cleanup on delete (removes token & user data)
 * - Integration point with auth slice via clearUser action
 *
 * Exports:
 * - Thunks: getUser, updateUser, deleteAccount
 * - Action: clearUser (manual user state reset)
 * - Reducer: default export for store configuration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('User is not authenticated');
    }
    return token;
  } catch (error) {
    return rejectWithValue(
      error.message || 'Failed to retrieve authentication token',
    );
  }
};

export const getUser = createAsyncThunk(
  'user/getUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BACKEND_API_URL}/user/get-user-by-id/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || 'Failed to fetch user',
        },
      );
    }
  },
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/user/update-user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const { updatedUser, message, success } = response.data;

      if (!success || !updatedUser) {
        throw new Error('Invalid update response');
      }

      return { user: updatedUser, message, success };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to update user',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

export const requestEmailVerification = createAsyncThunk(
  'user/requestEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/user/send-verification-email`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { message, success } = response.data;

      if (!success) {
        throw new Error(message || 'Failed to send verification code');
      }

      return { message, success };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message:
          backend?.message ||
          error.message ||
          'Failed to send verification code',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

export const verifyEmail = createAsyncThunk(
  'user/verifyEmail',
  async (otp, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/user/verify-email`,
        { otp },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { message, success, user } = response.data;

      if (!success) {
        throw new Error(message || 'Verification failed');
      }

      return { message, success, user };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Verification failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.delete(
        `${BACKEND_API_URL}/user/delete-user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { reason },
        },
      );

      await AsyncStorage.removeItem('authToken');

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete account',
      );
    }
  },
);

export const updateLocation = createAsyncThunk(
  'user/updateLocation',
  async ({ userId, latitude, longitude }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.patch(
        `${BACKEND_API_URL}/user/update-user-location/${userId}`,
        { latitude, longitude },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to sync location with server',
      );
    }
  },
);

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: state => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(requestEmailVerification.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestEmailVerification.fulfilled, state => {
        state.loading = false;
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.isEmailVerified = true;
          if (action.payload.user) {
            state.user = { ...state.user, ...action.payload.user };
          }
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAccount.pending, state => {
        state.loading = true;
      })
      .addCase(deleteAccount.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateLocation.pending, state => {
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.user = {
            ...state.user,
            ...action.payload.updatedLocation,
          };
        }
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
