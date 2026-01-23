/**
 * @fileoverview Express routes for product reviews
 * @module routes/reviewRoutes
 */

const express = require("express");
const router = express.Router();

const reviewController = require("../../controllers/review-controller/review.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @description Add a new review for a product
 * @route   POST /api/review/add-review
 * @access  Private (Authenticated users)
 */
router.post("/add-review", encryptedAuthMiddleware, reviewController.addReview);

/**
 * @description Get all reviews for a specific product
 * @route   GET /api/review/get-all-reviews/:productId
 * @access  Public
 */
router.get("/get-all-reviews/:productId", reviewController.getAllReviews);

/**
 * @description Update an existing review
 * @route   PATCH /api/review/update-review/:reviewId
 * @access  Private (Review owner)
 */
router.patch(
  "/update-review/:reviewId",
  encryptedAuthMiddleware,
  reviewController.updateReview,
);

/**
 * @description Delete a review
 * @route   DELETE /api/review/delete-review/:reviewId
 * @access  Private (Review owner or SuperAdmin)
 */
router.delete(
  "/delete-review/:reviewId",
  encryptedAuthMiddleware,
  reviewController.deleteReview,
);

module.exports = router;
