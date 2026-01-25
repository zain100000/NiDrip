/**
 * @file support.slice.js
 * @module Redux/Slices/Support
 * @description
 * Redux Toolkit slice managing the global state for customer support tickets.
 * * Core Features:
 * - Full Retrieval: Fetches the complete support tickets dataset.
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
 * @function getAllTickets
 * @async
 * @description Fetches the complete list of support tickets from the database.
 * @returns {Array<Object>} Array of all support tickets records.
 */
export const getAllTickets = createAsyncThunk(
  "support/getAllTickets",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token)
      return rejectWithValue({
        message: "Admin is not authenticated.",
        success: false,
      });

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/support/get-all-tickets`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { allTickets, message, success } = response.data;

      if (!success) throw new Error(message);

      return {
        success: true,
        message: message,
        allTickets: allTickets || response.data,
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
 * @function deleteTicket
 * @async
 * @description Removes a support ticket and updates the state.
 * @param {string} reviewId - The unique ID of the support ticket to delete.
 */
export const deleteTicket = createAsyncThunk(
  "support/deleteTicket",
  async (ticketId, { rejectWithValue }) => {
    const token = getToken();
    if (!token)
      return rejectWithValue({
        message: "Admin is not authenticated.",
        success: false,
      });

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/support/delete-ticket/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const { message, success } = response.data;

      if (!success) {
        throw new Error(message || "Failed to delete support ticket");
      }

      return {
        success: true,
        message: message,
        deletedticketId: ticketId,
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

const supportSlice = createSlice({
  name: "support",
  initialState: {
    allTickets: [],
    loading: false,
    error: null,
    message: null,
    success: null,
  },
  reducers: {
    setTickets: (state, action) => {
      state.allTickets = action.payload;
    },
    clearTicketMessage: (state) => {
      state.message = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.allTickets = action.payload.allTickets;
        state.message = action.payload.message;
        state.success = action.payload.success;
      })
      .addCase(getAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch reviews";
        state.message = action.payload?.message;
        state.success = false;
      })

      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.allTickets = state.allTickets.filter(
          (ticket) => ticket._id !== action.payload.deletedticketId,
        );
        state.message = action.payload.message;
        state.success = action.payload.success;
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Deletion failed";
        state.message = action.payload?.message;
        state.success = false;
      });
  },
});

export const { setTickets, clearTicketMessage } = supportSlice.actions;

export default supportSlice.reducer;
