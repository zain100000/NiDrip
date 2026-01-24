const cron = require("node-cron");
const Order = require("../../models/order-model/order.model");
const User = require("../../models/user-model/user.model");

/**
 * Scheduled Task: Every Sunday at 00:00 (Midnight)
 * Deletes orders that were DELIVERED more than 7 days ago.
 */
const startOrderCleanupJob = () => {
  // Cron syntax: minute hour day-of-month month day-of-week
  cron.schedule("0 0 * * 0", async () => {
    try {
      console.log("--- Running Weekly Delivered Order Cleanup ---");

      // Calculate the date 7 days ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // 1. Find the orders to be deleted (for history syncing)
      const ordersToDelete = await Order.find({
        status: "DELIVERED",
        updatedAt: { $lte: oneWeekAgo },
      });

      if (ordersToDelete.length === 0) {
        console.log("No old delivered orders to delete.");
        return;
      }

      const orderIds = ordersToDelete.map((order) => order._id);

      // 2. Remove references from all Users' order history arrays
      await User.updateMany(
        { "orders.orderId": { $in: orderIds } },
        { $pull: { orders: { orderId: { $in: orderIds } } } },
      );

      // 3. Delete the orders from the collection
      const result = await Order.deleteMany({ _id: { $in: orderIds } });

      console.log(`Cleanup Successful: Removed ${result.deletedCount} orders.`);
    } catch (error) {
      console.error("Error in Weekly Order Cleanup Cron:", error);
    }
  });
};

module.exports = startOrderCleanupJob;
