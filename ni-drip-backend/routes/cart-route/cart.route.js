/**
 * @fileoverview Express routes for shopping cart operations
 * @module routes/cartRoutes
 */

const express = require("express");
const router = express.Router();

const cartController = require("../../controllers/cart-controller/cart.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @description Add a product to the cart
 * @route POST /api/cart/add-to-cart
 * @access Protected
 */
router.post("/add-to-cart", encryptedAuthMiddleware, cartController.addToCart);

/**
 * @description Decrease the quantity of a specific product in the cart
 * @route POST /api/cart/remove-from-cart
 * @access Protected
 */
router.post(
  "/remove-from-cart",
  encryptedAuthMiddleware,
  cartController.decreaseCartItem,
);

/**
 * @description Remove a specific product from the cart
 * @route DELETE /api/cart/remove-product-from-cart
 */
router.delete(
  "/remove-product-from-cart",
  encryptedAuthMiddleware,
  cartController.removeProductFromCart,
);

/**
 * @description Clear all items from the user's cart
 * @route DELETE /api/cart/clear-cart
 */
router.delete("/clear-cart", encryptedAuthMiddleware, cartController.clearCart);

/**
 * @description Fetch current user's cart with populated product details
 * @route GET /api/cart/get-cart
 */
router.get("/get-cart", encryptedAuthMiddleware, cartController.getCart);

module.exports = router;
