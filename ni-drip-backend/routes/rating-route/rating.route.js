/**
 * @fileoverview Express routes for product ratings
 * @module routes/ratingRoutes
 */

const express = require("express");
const router = express.Router();

const ratingController = require("../../controllers/rating-controller/rating.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @description Add or update rating for a product
 * @route   POST /api/rating/add-rating
 * @access  Private (Authenticated users)
 */
router.post("/add-rating", encryptedAuthMiddleware, ratingController.addRating);

/**
 * @description Get all ratings for a specific product
 * @route   GET /api/rating/get-all-ratings/:productId
 * @access  Public
 */
router.get("/get-all-ratings/:productId", ratingController.getAllRatings);

module.exports = router;
