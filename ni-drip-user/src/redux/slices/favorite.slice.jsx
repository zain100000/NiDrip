/**
 * @file favoritesSlice.js
 * @module Redux/Slices/Favorites
 * @description
 * Redux Toolkit slice managing user favorites/wishlist.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

/**
 * Add product to favorites
 * @param {string} productId
 */
export const addToFavorites = createAsyncThunk(
  'favorites/add',
  async (productId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BACKEND_API_URL}/favorite/add-to-favorite`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return response.data;
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message:
          backend?.message || error.message || 'Failed to add to favorites',
        success: false,
      });
    }
  },
);

/**
 * Remove product from favorites
 * @param {string} productId
 */
export const removeFromFavorites = createAsyncThunk(
  'favorites/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BACKEND_API_URL}/favorite/remove-from-favorite`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return { productId, ...response.data };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || 'Failed to remove from favorites',
        success: false,
      });
    }
  },
);

/**
 * Get all user's favorites
 */
export const getFavorites = createAsyncThunk(
  'favorites/get',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(
        `${BACKEND_API_URL}/favorite/get-favorites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || 'Failed to fetch favorites',
        success: false,
      });
    }
  },
);

const initialState = {
  favorites: [],
  loading: false,
  error: null,
  message: null,
  success: false,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    resetFavoritesState: state => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addToFavorites.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = false;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        if (action.payload.favorite) {
          state.favorites.unshift(action.payload.favorite);
        }
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromFavorites.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.favorites = state.favorites.filter(
          fav => fav.productId._id !== action.meta.arg,
        );
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFavorites.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload.favorites || [];
        state.message = action.payload.message;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetFavoritesState } = favoritesSlice.actions;
export default favoritesSlice.reducer;
