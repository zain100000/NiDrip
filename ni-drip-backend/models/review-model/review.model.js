/**
 * @fileoverview Mongoose schema for product reviews
 * @module models/reviewModel
 */

const mongoose = require("mongoose");

/**
 * Schema for individual product reviews
 * @typedef {Object} Review
 * @property {ObjectId} user       - User who submitted the review
 * @property {ObjectId} product    - Product being reviewed
 * @property {string}   reviewText - The review content
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    reviewText: {
      type: String,
      required: [true, "Review text cannot be empty"],
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Review", reviewSchema);
