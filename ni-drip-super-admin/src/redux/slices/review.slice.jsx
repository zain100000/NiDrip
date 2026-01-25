/**
 * @file review.slice.js
 * @module Redux/Slices/Review
 * @description
 * Redux Toolkit slice managing the global state for customer reviews.
 * * Core Features:
 * - Full Retrieval: Fetches the complete review dataset.
 * - Secure Requests: Attaches Bearer tokens from localStorage for admin-level operations.
 * - State Syncing: Automatically filters local state upon successful deletion.
 * * @requires @reduxjs/toolkit
 * @requires axios
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * @function getAllReviews
 * @async
 * @description Fetches the complete list of reviews from the database.
 * @returns {Array<Object>} Array of all review records.
 */
export const getAllReviews = createAsyncThunk(
  "review/getAllReviews",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token)
      return rejectWithValue({
        message: "Admin is not authenticated.",
        success: false,
      });

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/review/get-all-reviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { allReviews, message, success } = response.data;

      if (!success) throw new Error(message);

      return {
        success: true,
        message: message,
        allReviews: allReviews || response.data,
      };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message: backendError?.message || error.message,
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * @function deleteReview
 * @async
 * @description Removes a review and updates the state.
 * @param {string} reviewId - The unique ID of the review to delete.
 */
export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    const token = getToken();
    if (!token)
      return rejectWithValue({
        message: "Admin is not authenticated.",
        success: false,
      });

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/review/delete-review/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const { message, success } = response.data;

      if (!success) {
        throw new Error(message || "Failed to delete review");
      }

      return {
        success: true,
        message: message,
        deletedReviewId: reviewId,
      };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message: backendError?.message || error.message,
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    allReviews: [],
    loading: false,
    error: null,
    message: null,
    success: null,
  },
  reducers: {
    setReviews: (state, action) => {
      state.allReviews = action.payload;
    },
    clearReviewMessage: (state) => {
      state.message = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.allReviews = action.payload.allReviews;
        state.message = action.payload.message;
        state.success = action.payload.success;
      })
      .addCase(getAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch reviews";
        state.message = action.payload?.message;
        state.success = false;
      })

      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.allReviews = state.allReviews.filter(
          (review) => review._id !== action.payload.deletedReviewId,
        );
        state.message = action.payload.message;
        state.success = action.payload.success;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Deletion failed";
        state.message = action.payload?.message;
        state.success = false;
      });
  },
});

export const { setReviews, clearReviewMessage } = reviewSlice.actions;

export default reviewSlice.reducer;
