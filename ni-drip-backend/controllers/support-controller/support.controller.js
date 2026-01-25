/**
 * @fileoverview Support / ticket controller
 * @module controllers/supportController
 * @description Manages user support tickets with email notifications.
 */

const Support = require("../../models/support-model/support.model");
const {
  sendTicketConfirmationToUser,
  sendNewTicketNotificationToAdmin,
  sendTicketStatusUpdateEmail,
} = require("../../helpers/email-helper/email.helper");

/**
 * Create new support ticket
 * @body {string} subject
 * @body {string} description
 * @body {string} [priority="MEDIUM"]
 * @access Private
 */
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const userId = req.user.id;

    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject and description required",
      });
    }

    const ticket = await Support.create({
      user: userId,
      subject: subject.trim(),
      description: description.trim(),
      priority: priority?.toUpperCase() || "MEDIUM",
    });

    const populated = await Support.findById(ticket._id).populate(
      "user",
      "userName email",
    );

    await sendTicketConfirmationToUser(
      populated.user.email,
      populated.user.userName,
      ticket,
    );

    await sendNewTicketNotificationToAdmin(populated);

    res.status(201).json({
      success: true,
      message:
        "Ticket created successfully. You will receive a confirmation email shortly.",
      newTicket: ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get all tickets (admin view)
 * @query {string} [status]
 * @query {string} [priority]
 * @query {string} [userId]
 * @query {number} [page=1]
 * @query {number} [limit=20]
 * @access Private (SuperAdmin)
 */
exports.getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { status, priority, userId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (priority) filter.priority = priority.toUpperCase();
    if (userId) filter.user = userId;

    const skip = (Number(page) - 1) * Number(limit);

    const tickets = await Support.find(filter)
      .populate("user", "userName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      count: tickets.length,
      allTickets: tickets,
    });
  } catch (error) {
    console.error("Get all tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get single ticket by ID
 * @param {string} ticketId
 * @access Private (owner or admin)
 */
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "SUPERADMIN";

    const ticket = await Support.findById(ticketId).populate(
      "user",
      "userName email",
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.user.toString() !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this ticket",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      ticket,
    });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Delete/close ticket
 * @param {string} ticketId
 * @access Private (owner or admin)
 */
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "SUPERADMIN";

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.user.toString() !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own tickets",
      });
    }

    await Support.findByIdAndDelete(ticketId);

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Update ticket status (admin only)
 * @param {string} ticketId
 * @body {string} status
 * @access Private (SuperAdmin)
 */
exports.updateTicketStatus = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { ticketId } = req.params;
    const { status } = req.body;

    const valid = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const newStatus = status?.toUpperCase();

    if (!newStatus || !valid.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Use: ${valid.join(", ")}`,
      });
    }

    const ticket = await Support.findById(ticketId).populate(
      "user",
      "userName email",
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.status === newStatus) {
      return res.status(200).json({
        success: true,
        message: `Already ${newStatus}`,
        ticket,
      });
    }

    ticket.status = newStatus;
    await ticket.save();

    await sendTicketStatusUpdateEmail(
      ticket.user.email,
      ticket.user.userName,
      ticket._id,
      newStatus,
      ticket.subject,
    );

    res.status(200).json({
      success: true,
      message: `Ticket status updated successfully to ${newStatus}`,
      updatedStatus: newStatus,
    });
  } catch (error) {
    console.error("Update ticket status error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
