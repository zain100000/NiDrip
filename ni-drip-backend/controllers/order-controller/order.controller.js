/**
 * @file Order Controller
 * @description Controller module for managing customer orders in the e-commerce application.
 * Supports:
 * - Placing a new order from the user's cart (Cash on Delivery only for now)
 * - Stock validation and deduction
 * - Order creation with item snapshots
 * - Updating user's order history
 * - Clearing the cart after successful checkout
 *
 * @module controllers/orderController
 */

const Order = require("../../models/order-model/order.model");
const User = require("../../models/user-model/user.model");
const Product = require("../../models/product-model/product.model");
const {
  sendOrderConfirmationToUser,
  sendNewOrderNotificationToAdmin,
} = require("../../helpers/email-helper/email.helper");

/**
 * Place a new order from the user's cart
 * POST /api/order/place-order
 * Private access (authenticated user)
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // Optional: Allow override of shipping address and cost
    const { shippingAddress: overrideAddress, shippingCost = 0 } = req.body;

    // Fetch user with populated cart items and product details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add items before placing an order.",
      });
    }

    // Use user's saved address or override from body
    const shippingAddress = overrideAddress?.trim() || user.address;
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address is required. Please update your profile or provide one.",
      });
    }

    // Validate stock and collect order items with current prices
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${cartItem.productId} not found`,
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.title} (only ${product.stock} available)`,
        });
      }

      const itemTotal = cartItem.quantity * product.price;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        priceAtPurchase: product.price,
      });

      // Deduct stock
      product.stock -= cartItem.quantity;
      await product.save();
    }

    const totalAmount = subtotal + shippingCost;

    // Create the order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      shippingCost,
      status: "PENDING",
      paymentMethod: "PAY_ON_DELIVERY",
      paymentStatus: "PENDING",
    });

    // Update user's order history
    user.orders.push({
      orderId: order._id,
      userId: userId,
      status: "PENDING",
      paymentStatus: "PENDING",
      placedAt: new Date(),
    });

    // Clear the cart
    user.cart = [];

    await user.save();

    // Populate order for email and response
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone");

    // ────────────────────────────────────────────────────────
    //  Send Order Confirmation Email to User
    // ────────────────────────────────────────────────────────
    await sendOrderConfirmationToUser(populatedOrder);

    // ────────────────────────────────────────────────────────
    //  Send New Order Notification to Admin
    // ────────────────────────────────────────────────────────
    await sendNewOrderNotificationToAdmin(populatedOrder);

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Confirmation email sent.",
      order: populatedOrder,
      summary: {
        subtotal,
        shippingCost,
        totalAmount,
        itemsCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while placing order",
      error: error.message,
    });
  }
};
