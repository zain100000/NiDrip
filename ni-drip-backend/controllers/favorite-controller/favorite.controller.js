/**
 * @fileoverview Favorites / wishlist controller
 * @module controllers/favoriteController
 * @description Manages user favorites using separate Favorite collection
 *              with sync to User.favorites array for fast profile reads.
 */

const Favorite = require("../../models/favorite-model/favorite.model");
const User = require("../../models/user-model/user.model");
const Product = require("../../models/product-model/product.model");

/**
 * Helper: Sync Favorite collection → User.favorites array
 * @param {string} userId
 */
const syncUserFavorites = async (userId) => {
  const favorites = await Favorite.find({ userId }).populate("productId");
  const favoriteData = favorites.map((fav) => ({
    productId: fav.productId,
    addedAt: fav.addedAt,
  }));
  await User.findByIdAndUpdate(
    userId,
    { favorites: favoriteData },
    { new: true },
  );
};

/**
 * Add product to favorites
 * @body { productId: string }
 * @access Private
 */
exports.addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Prevent duplicates
    const existing = await Favorite.findOne({ userId, productId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your favorites",
      });
    }

    // Create favorite entry
    const favorite = new Favorite({
      userId,
      productId,
      addedAt: new Date(),
    });
    await favorite.save();

    // Sync to User document
    await syncUserFavorites(userId);

    // Return populated favorite
    const populated = await Favorite.findById(favorite._id).populate(
      "productId",
    );

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      favorite: populated,
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to favorites",
      error: error.message,
    });
  }
};

/**
 * Remove product from favorites
 * @body { productId: string }
 * @access Private
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const deleted = await Favorite.deleteOne({ userId, productId });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found in favorites",
      });
    }

    await syncUserFavorites(userId);

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from favorites",
    });
  }
};

/**
 * Get all user's favorited products
 * @access Private
 */
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({ userId })
      .populate({
        path: "productId",
        select: "title price productImages status averageRating stock",
      })
      .sort({ addedAt: -1 })
      .lean(); // faster response

    res.status(200).json({
      success: true,
      message: "Favorites retrieved successfully",
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
      error: error.message,
    });
  }
};
