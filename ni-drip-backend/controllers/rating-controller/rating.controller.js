/**
 * @fileoverview Rating controller – manages product ratings
 * @module controllers/ratingController
 * @description Handles rating submission (upsert) and average recalculation.
 */

const Rating = require("../../models/rating-model/rating.model");
const Product = require("../../models/product-model/product.model");

/**
 * Add or update rating for a product
 * @body {string} productId
 * @body {number} stars (1–5)
 * @access Private
 */
exports.addRating = async (req, res) => {
  try {
    const { productId, stars } = req.body;
    const userId = req.user.id;

    if (!productId || !stars || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID and rating (1–5) required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Upsert rating (prevents duplicates)
    await Rating.findOneAndUpdate(
      { user: userId, product: productId },
      { stars: Number(stars) },
      { upsert: true, new: true, runValidators: true },
    );

    // Recalculate average
    const ratings = await Rating.find({ product: productId });
    const total = ratings.length;
    const avg =
      total > 0
        ? (ratings.reduce((sum, r) => sum + r.stars, 0) / total).toFixed(1)
        : 0;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Number(avg),
      totalRatings: total,
    });

    res.status(200).json({
      success: true,
      message: "Rating submitted",
      stats: { averageRating: avg, totalRatings: total },
    });
  } catch (error) {
    console.error("Add rating error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get all ratings for a product
 * @param {string} productId
 * @access Public
 */
exports.getAllRatings = async (req, res) => {
  try {
    const { productId } = req.params;

    const ratings = await Rating.find({ product: productId })
      .populate("user", "userName profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Ratings fetched successfully",
      count: ratings.length,
      allRatings: ratings,
    });
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
