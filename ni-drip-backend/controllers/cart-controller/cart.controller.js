/**
 * @fileoverview Cart controller – manages user shopping cart
 * @module controllers/cartController
 * @description Handles add/remove/update/clear operations using separate Cart collection
 *              with sync to User.cart array for fast profile reads.
 */

const Cart = require("../../models/cart-model/cart.model");
const User = require("../../models/user-model/user.model");
const Product = require("../../models/product-model/product.model");

/**
 * Helper: Sync Cart collection → User.cart array
 * @param {string} userId
 */
const syncUserCart = async (userId) => {
  const cartItems = await Cart.find({ userId }).populate("productId");
  await User.findByIdAndUpdate(userId, { cart: cartItems }, { new: true });
};

/**
 * Add product to cart (or increase quantity)
 * @body { productId: string, quantity?: number = 1 }
 * @access Private
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} item(s) available in stock`,
      });
    }

    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      const newQuantity = cartItem.quantity + Number(quantity);
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more – only ${product.stock} in stock`,
        });
      }

      cartItem.quantity = newQuantity;
      cartItem.totalPrice = newQuantity * cartItem.unitPrice;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        userId,
        productId,
        quantity: Number(quantity),
        unitPrice: product.price,
        totalPrice: Number(quantity) * product.price,
      });
      await cartItem.save();
    }

    await syncUserCart(userId);

    const populatedItem = await Cart.findById(cartItem._id).populate(
      "productId",
    );

    res.status(200).json({
      success: true,
      message: cartItem ? "Quantity updated" : "Product added to cart",
      cartItem: populatedItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
      error: error.message,
    });
  }
};

/**
 * Decrease item quantity (remove if reaches 0)
 * @body { productId: string }
 * @access Private
 */
exports.decreaseCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice;
      await cartItem.save();
    } else {
      await Cart.findByIdAndDelete(cartItem._id);
    }

    await syncUserCart(userId);

    res.status(200).json({
      success: true,
      message: "Item quantity decreased",
    });
  } catch (error) {
    console.error("Decrease cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to decrease cart item",
    });
  }
};

/**
 * Completely remove one product from cart
 * @body { productId: string }
 * @access Private
 */
exports.removeProductFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const deleted = await Cart.deleteOne({ userId, productId });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    await syncUserCart(userId);

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error("Remove product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product",
    });
  }
};

/**
 * Clear entire cart
 * @access Private
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { cart: [] });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};

/**
 * Get current user's cart with populated products
 * @access Private
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.find({ userId })
      .populate({
        path: "productId",
        select: "title price productImages stock status",
      })
      .sort({ createdAt: -1 })
      .lean();

    const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      count: cartItems.length,
      itemsCount,
      cartTotal,
      items: cartItems,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};
