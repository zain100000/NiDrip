/**
 * @fileoverview Express routes for Order
 * @module routes/orderRoutes
 * @description Provides endpoints for:
 * - Placing an order (User Only)
 */

const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order-controller/order.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @desc Create a new order
 */
router.post(
  "/place-order",
  encryptedAuthMiddleware,
  orderController.placeOrder,
);

module.exports = router;
