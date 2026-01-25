/**
 * @file User.slice.js
 * @module Redux/Slices/User
 * @description
 * Redux Toolkit slice managing administrative user-list operations.
 * * **Primary Workflow:**
 * - **Admin Data Fetching:** Provides a secure, token-verified thunk to retrieve the complete user directory.
 * - **State Mapping:** Correctly maps backend property `allUsers` to the localized Redux state.
 */

import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Get All Users (Admin functionality)
 * @returns {Promise<Object>} Aggregated users array and server response metadata.
 */
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, { rejectWithValue }) => {
    const token = getToken();

    if (!token) {
      return rejectWithValue({
        message: "Admin is not authenticated",
        success: false,
        status: 401,
      });
    }

    try {
      // Remove any query parameters since we want all users
      const response = await axios.get(
        `${BACKEND_API_URL}/user/get-all-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Destructuring 'allUsers' to match backend response key
      const { allUsers, message, success } = response.data;

      if (!success) {
        throw new Error(message || "Failed to fetch users");
      }

      return { allUsers: allUsers || [], message, success };
    } catch (error) {
      console.error(
        "Get All Users Error:",
        error.response?.data || error.message,
      );

      const backendError = error.response?.data;

      return rejectWithValue({
        message:
          backendError?.message || error.message || "Network error occurred",
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    allUsers: [],
    loading: false,
    error: null,
    message: null,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearAllUsers: (state) => {
      state.allUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload.allUsers; // Mapping backend data to state
        state.message = action.payload.message;
        state.success = action.payload.success;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
        state.success = action.payload?.success || false;
      });
  },
});

export const { clearError, clearAllUsers } = userSlice.actions;
export default userSlice.reducer;
