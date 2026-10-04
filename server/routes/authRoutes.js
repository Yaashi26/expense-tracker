import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
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

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "user",
      });

      res.status(201).json({
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

      res.json({
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

      res.json(user);
    } catch (error) {
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