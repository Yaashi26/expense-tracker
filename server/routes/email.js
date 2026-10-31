import express from "express";
import { sendEmail } from "../services/emailService.js";

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    await sendEmail({
      to: email,
      subject: "Expense Tracker - Test Email",
      html: `
        <h2>Welcome to Expense Tracker!</h2>
        <p>Your email integration is working successfully.</p>
      `,
    });

    res.status(200).json({
      message: "Test email sent successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send test email",
    });
  }
});

export default router;