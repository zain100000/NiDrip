/**
 * @file Email service utility for NIDRIP application
 * @module services/emailService
 * @description Comprehensive email service using Nodemailer with Gmail SMTP.
 * Supports sending generic emails, password reset emails with secure links, and HTML templates.
 * @version 1.0.0
 * @requires nodemailer
 */

const nodemailer = require("nodemailer");

// === Environment Validation ===
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error(
    "Missing required environment variables: EMAIL_USER and EMAIL_PASS",
  );
}

/**
 * Nodemailer transporter configured for Gmail SMTP
 * @type {import('nodemailer').Transporter}
 * @constant
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

/**
 * Send email using configured transporter
 * @async
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of email
 * @returns {Promise<boolean>} True if sent successfully
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: "NIDRIP <no-reply@nidrip.com>",
      to: to.trim(),
      subject,
      html,
      text: html.replace(/<[^>]+>/g, " ").substring(0, 200) + "...",
    });

    console.log(
      `Email sent successfully to ${to} | MessageId: ${info.messageId}`,
    );
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return false;
  }
};

/**
 * Generates a premium, professional NIDRIP-branded HTML email template
 * @param {string} content - HTML body content
 * @param {string} [title="NIDRIP Notification"] - Page title
 * @returns {string} Complete HTML email document
 */
const getEmailTemplate = (content, title = "NIDRIP Notification") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <!-- Full Inter font family with all weights and italic support -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #f4f4f9;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
    }
    a {
      color: #E32264;
      text-decoration: none;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #E32264 0%, #A3268E 100%);
      padding: 48px 32px;
      text-align: center;
      position: relative;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #ffffff33, transparent);
    }
    .logo {
      width: 160px;
      height: auto;
      margin-bottom: 16px;
    }
    .brand-title {
      color: #ffffff;
      font-size: 36px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -1.2px;
    }
    .main-content {
      padding: 56px 48px;
      background: #ffffff;
      color: #2d2d2d;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #E32264 0%, #A3268E 100%);
      color: #ffffff !important;
      font-weight: 700;
      font-size: 17px;
      padding: 18px 44px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 8px 25px rgba(227, 34, 100, 0.3);
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 35px rgba(227, 34, 100, 0.4);
    }
    .info-box {
      background: #f8f9fa;
      border-left: 5px solid #E32264;
      padding: 24px;
      border-radius: 8px;
      margin: 32px 0;
      font-size: 15px;
    }
    .footer {
      background: #0f0f1a;
      padding: 48px 40px;
      text-align: center;
      color: #888888;
    }
    .footer-title {
      color: #E32264;
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 12px 0;
    }
    .footer-copy {
      font-size: 14px;
      margin: 16px 0;
    }
    .footer-note {
      font-size: 13px;
      color: #666666;
      line-height: 1.6;
      margin-top: 24px;
    }
    @media (max-width: 600px) {
      .main-content {
        padding: 40px 32px;
      }
      .header {
        padding: 40px 24px;
      }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <img 
              src="https://res.cloudinary.com/dd524q9vc/image/upload/v1769081264/NiDrip/logo/logo_ny2do0.png" 
              alt="NIDRIP" 
              class="logo"
            />
            <h1 class="brand-title">NIDRIP</h1>
          </div>

          <!-- Main Content -->
          <div class="main-content">
            ${content}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-title">NIDRIP</p>
            <p class="footer-copy">
              &copy; ${new Date().getFullYear()} <strong style="color:#E32264;">NIDRIP</strong>. All rights reserved.
            </p>
            <p class="footer-note">
              This is an automated message from NIDRIP.<br>
              If you didn't initiate this action, please ignore this email or contact support.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Get frontend URL for a specific user role
 * @param {string} role - User role
 * @returns {string} Base frontend URL
 * @throws {Error} If role URL is not configured
 */
function getFrontendUrl(role) {
  switch (role) {
    case "SUPERADMIN":
      if (!process.env.FRONTEND_URL) {
        throw new Error("URL is not defined");
      }
      return process.env.FRONTEND_URL.replace(/\/+$/, "");
    default:
      throw new Error(`No frontend URL configured for role: ${role}`);
  }
}

/**
 * Send a password reset email with premium NIDRIP styling
 * @async
 * @param {string} toEmail - Recipient email
 * @param {string} resetToken - Reset token
 * @param {string} role - User role
 * @returns {Promise<boolean>} True if email sent successfully
 */
const sendPasswordResetEmail = async (toEmail, resetToken, role) => {
  const frontendUrl = getFrontendUrl(role);
  const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const content = `
    <div style="text-align:center;max-width:520px;margin:0 auto;">
      <h2 style="color:#1a1a1a;font-size:32px;margin-bottom:24px;font-weight:800;">
        Reset Your Password
      </h2>
      <p style="color:#444444;line-height:1.8;margin-bottom:40px;font-size:17px;">
        We received a request to reset your NIDRIP account password.<br>
        Click the button below to set a new password.
      </p>
      
      <div style="margin:50px 0;">
        <a href="${resetLink}" class="btn-primary">
          Reset Password Now
        </a>
      </div>

      <p style="color:#666666;font-size:15px;line-height:1.7;margin-top:40px;">
        This link will expire in <strong style="color:#E32264;">1 hour</strong> for your security.<br><br>
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "NIDRIP • Reset Your Password",
    html: getEmailTemplate(content, "Password Reset - NIDRIP"),
  });
};

// ────────────────────────────────────────────────────────────────
//   Support Ticket Email Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Send confirmation email to the user who created the ticket
 */
const sendTicketConfirmationToUser = async (userEmail, userName, ticket) => {
  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Hello ${userName},</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Thank you for contacting NIDRIP Support. Your ticket has been successfully received.
    </p>
    
    <div class="info-box">
      <strong>Ticket ID:</strong> ${ticket._id}<br><br>
      <strong>Subject:</strong> ${ticket.subject}<br><br>
      <strong>Priority:</strong> <span style="color:#E32264;font-weight:700;">${ticket.priority}</span><br><br>
      <strong>Submitted:</strong> ${new Date(ticket.createdAt).toLocaleDateTimeString()}
    </div>
    
    <p style="font-size:17px;color:#444444;">
      Our support team will review your request and get back to you as soon as possible.
    </p>
    
    <p style="margin-top:40px;font-size:16px;">
      Thank you for your patience,<br>
      <strong>NIDRIP Support Team</strong>
    </p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `NIDRIP Support: Ticket Received [#${ticket._id}]`,
    html: getEmailTemplate(content, "Support Ticket Confirmation"),
  });
};

/**
 * Send notification to Super Admin when a new ticket is created
 */
const sendNewTicketNotificationToAdmin = async (ticket) => {
  const adminEmail = process.env.EMAIL_USER || "support@nidrip.com";

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">New Support Ticket</h2>
    
    <p style="font-size:17px;color:#444444;">
      A new support ticket has been submitted by a user.
    </p>
    
    <div class="info-box">
      <strong>Ticket ID:</strong> ${ticket._id}<br><br>
      <strong>User:</strong> ${ticket.user.userName} (${ticket.user.email})<br><br>
      <strong>Subject:</strong> ${ticket.subject}<br><br>
      <strong>Priority:</strong> <span style="color:#E32264;font-weight:700;">${ticket.priority}</span><br><br>
      <strong>Submitted:</strong> ${new Date(ticket.createdAt).toLocaleString()}
    </div>
    
    <div style="text-align:center;margin:40px 0;">
      <a href="${process.env.FRONTEND_URL}/super-admin/tickets/${ticket._id}"
         class="btn-primary">
        View & Respond to Ticket
      </a>
    </div>
    
    <p style="font-size:16px;color:#666666;">
      Please review this ticket at your earliest convenience.
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Support Ticket [#${ticket._id}] - ${ticket.priority} Priority`,
    html: getEmailTemplate(content, "New Support Ticket Notification"),
  });
};

/**
 * Send email notification to user when ticket status is updated
 */
const sendTicketStatusUpdateEmail = async (
  userEmail,
  userName,
  ticketId,
  newStatus,
  subject,
) => {
  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Ticket Status Update</h2>
    
    <p style="font-size:17px;color:#444444;">
      Hello ${userName},
    </p>
    
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Great news! Your support ticket has been updated.
    </p>
    
    <div class="info-box">
      <strong>Ticket ID:</strong> ${ticketId}<br><br>
      <strong>Subject:</strong> ${subject}<br><br>
      <strong>New Status:</strong> <span style="color:#E32264;font-weight:700;font-size:18px;">${newStatus}</span><br><br>
      <strong>Updated on:</strong> ${new Date().toLocaleString()}
    </div>
    
    <p style="font-size:17px;color:#444444;">
      You can view full details and history in your <strong>My Tickets</strong> section.
    </p>
    
    <p style="margin-top:40px;font-size:16px;">
      Thank you for your patience,<br>
      <strong>NIDRIP Support Team</strong>
    </p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `NIDRIP Support: Ticket [#${ticketId}] Updated to ${newStatus}`,
    html: getEmailTemplate(content, "Ticket Status Update"),
  });
};

module.exports = {
  sendEmail,
  getEmailTemplate,
  sendPasswordResetEmail,
  sendTicketConfirmationToUser,
  sendNewTicketNotificationToAdmin,
  sendTicketStatusUpdateEmail,
};
