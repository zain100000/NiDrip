/**
 * @fileoverview Mongoose schema for user's favorite products
 * @module models/favoriteModel
 */

const mongoose = require("mongoose");

/**
 * Schema for favorite items
 * @typedef {Object} Favorite
 * @property {ObjectId} userId    - Reference to the owning user
 * @property {ObjectId} productId - Reference to the favorited Product
 * @property {Date}     addedAt   - When the product was favorited
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */
const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate favorites (same user + same product)
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
