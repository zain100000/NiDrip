/**
 * @fileoverview Mongoose schema for product ratings
 * @module models/ratingModel
 */

const mongoose = require("mongoose");

/**
 * Schema for individual product ratings
 * @typedef {Object} Rating
 * @property {ObjectId} user      - User who submitted the rating
 * @property {ObjectId} product   - Product being rated
 * @property {number}   stars     - Rating score (1–5)
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */
const ratingSchema = new mongoose.Schema(
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

    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each user can rate a product only once
ratingSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);