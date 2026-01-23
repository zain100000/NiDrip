/**
 * @fileoverview Mongoose schema for Order management.
 * @module models/orderModel
 * @description Represents a finalized transaction, including items purchased,
 * shipping details, and payment tracking.
 */

const mongoose = require("mongoose");

/**
 * @schema OrderSchema
 */
const orderSchema = new mongoose.Schema(
  {
    /**
     * The customer who placed the order
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
      index: true,
    },

    /**
     * List of products purchased
     */
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
          description: "Price of the product at the exact moment of checkout",
        },
      },
    ],

    /**
     * Financial Totals
     */
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Shipping Information
     */
    shippingAddress: {
      type: String,
      required: [true, "Shipping address is required for delivery"],
    },

    /**
     * Shipping Cost
     */
    shippingCost: {
      type: Number,
      required: [true, "Shipping cost is required"],
      min: 0,
    },

    /**
     * Order Fulfillment Status
     */
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    /**
     * Payment Information
     */
    paymentMethod: {
      type: String,
      enum: ["PAY_ON_DELIVERY"], // COD = Cash on Delivery
      default: "PAY_ON_DELIVERY",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Mongoose model for Order
 * @type {import('mongoose').Model}
 */
module.exports = mongoose.model("Order", orderSchema);
