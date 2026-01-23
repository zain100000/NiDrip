/**
 * @fileoverview Express routes for user favorites
 * @module routes/favoriteRoutes
 */

const express = require("express");
const router = express.Router();

const favoriteController = require("../../controllers/favorite-controller/favorite.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @description Add a product to user's favorites
 * @route POST /api/favorite/add-to-favorite
 * @access Protected
 */
router.post(
  "/add-to-favorite",
  encryptedAuthMiddleware,
  favoriteController.addToFavorites,
);

/**
 * @description Remove a product from user's favorites
 * @route POST /api/favorite/remove-from-favorite
 * @access Protected
 */
router.post(
  "/remove-from-favorite",
  encryptedAuthMiddleware,
  favoriteController.removeFromFavorites,
);

/**
 * Get all favorited products for the authenticated user
 * @route GET /api/favorite/get-favorites
 * @access Protected
 */
router.get(
  "/get-favorites",
  encryptedAuthMiddleware,
  favoriteController.getFavorites,
);

module.exports = router;
