/**
 * @fileoverview Mongoose schema for support tickets and complaints
 * @module models/supportModel
 */

const mongoose = require("mongoose");

/**
 * Schema for support tickets / complaints
 * @typedef {Object} Support
 * @property {ObjectId} user         - Reference to the submitting user
 * @property {string}   subject      - Short title of the issue
 * @property {string}   description  - Detailed explanation of the problem
 * @property {string}   status       - Current ticket status
 * @property {string}   priority     - Urgency level
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */
const supportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Support ticket must be associated with a user"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [50, "Subject cannot exceed 50 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [50, "Description must be at least 50 characters long"],
      maxlength: [200, "Description cannot exceed 200 characters"],
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
      required: [true, "Priority is required"],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Support", supportSchema);
