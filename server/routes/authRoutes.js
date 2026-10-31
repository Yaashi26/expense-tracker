import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import {
  verifyToken,
  verifyAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Signup
router.post(
  "/signup",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Invalid input",
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
      });

      // Welcome email notification
      try {
        await sendEmail({
          to: user.email,
          subject: "Welcome to Expense Tracker!",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2>Welcome to Expense Tracker!</h2>
              <p>Hello ${user.name},</p>
              <p>Your account has been created successfully.</p>
              <p>You can now manage your income, expenses and savings in one place.</p>
              <p>Thank you for joining us!</p>
              <h3>Team Expense Tracker</h3>
            </div>
          `,
        });

        console.log("Welcome email sent to:", user.email);
      } catch (emailError) {
        console.error("Welcome email failed:", emailError.message);
      }

      return res.status(201).json({
        message: "Signup successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Invalid input",
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (
        !user ||
        !(await bcrypt.compare(password, user.password))
      ) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          id: user._id.toString(),
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Protected profile
router.get(
  "/profile",
  verifyToken,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id)
        .select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Update profile
router.patch(
  "/profile",
  verifyToken,
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Enter a valid email"),
    body("phone")
      .optional()
      .isString()
      .trim(),
    body("currency")
      .optional()
      .isIn(["INR", "USD", "EUR", "GBP"])
      .withMessage("Invalid currency"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Invalid profile details",
          errors: errors.array(),
        });
      }

      const allowedFields = ["name", "email", "phone", "currency"];
      const updates = {};

      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          updates[field] =
            typeof req.body[field] === "string"
              ? req.body[field].trim()
              : req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message: "No profile details provided",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "This email is already registered",
        });
      }

      next(error);
    }
  }
);

// Admin-only route
router.get(
  "/admin",
  verifyToken,
  verifyAdmin,
  (req, res) => {
    res.json({
      message: "Welcome, Admin!",
    });
  }
);

export default router;