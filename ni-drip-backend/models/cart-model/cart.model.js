/**
 * @fileoverview Mongoose schema for user's shopping cart
 * @module models/cartModel
 */

const mongoose = require("mongoose");

/**
 * Schema for cart items
 * @typedef {Object} Cart
 * @property {ObjectId} userId - Reference to the owning user
 * @property {ObjectId} productId - Reference to the Product/Book
 * @property {number} quantity - Number of items
 * @property {number} unitPrice - Price per unit at time of addition
 * @property {number} totalPrice - quantity × unitPrice
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const cartSchema = new mongoose.Schema(
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

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },

    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },

    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual alias for totalPrice
cartSchema.virtual("subtotal").get(function () {
  return this.totalPrice;
});

// Keep totalPrice in sync with quantity & unitPrice
cartSchema.pre("save", function (next) {
  if (this.isModified("quantity") || this.isModified("unitPrice")) {
    this.totalPrice = this.quantity * this.unitPrice;
  }
  next();
});

// Prevent duplicate items for the same user + product
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);
