/**
 * @fileoverview Express routes for support tickets
 * @module routes/supportRoutes
 */

const express = require("express");
const router = express.Router();

const supportController = require("../../controllers/support-controller/support.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @description Create a new support ticket
 * @route   POST /api/support/create-ticket
 * @access  Private (Authenticated users)
 */
router.post(
  "/create-ticket",
  encryptedAuthMiddleware,
  supportController.createTicket,
);

/**
 * @description Get details of a specific ticket
 * @route   GET /api/support/get-ticket-by-id/:ticketId
 * @access  Private (Ticket owner or SuperAdmin)
 */
router.get(
  "/get-ticket-by-id/:ticketId",
  encryptedAuthMiddleware,
  supportController.getTicketById,
);

/**
 * @description Get all tickets (usually admin view)
 * @route   GET /api/support/get-all-tickets
 * @access  Private (SuperAdmin)
 */
router.get(
  "/get-all-tickets",
  encryptedAuthMiddleware,
  supportController.getAllTickets,
);

/**
 * @description Delete a ticket
 * @route   DELETE /api/support/delete-ticket/:ticketId
 * @access  Private (SuperAdmin or ticket owner – check in controller)
 */
router.delete(
  "/delete-ticket/:ticketId",
  encryptedAuthMiddleware,
  supportController.deleteTicket,
);

/**
 * @description Update ticket status (e.g. OPEN → RESOLVED)
 * @route   PATCH /api/support/action/update-ticket-status/:ticketId
 * @access  Private (SuperAdmin)
 */
router.put(
  "/action/update-ticket-status/:ticketId",
  encryptedAuthMiddleware,
  supportController.updateTicketStatus,
);

module.exports = router;
