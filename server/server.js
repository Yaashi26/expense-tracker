import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";

import transactionRoutes from "./routes/transactionRoutes.js";
import financialRoutes from "./routes/financialRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";


dotenv.config();

const app = express();

app.disable("x-powered-by");

app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Allow frontend requests
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

// Limit request body size
app.use(express.json({ limit: "10kb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Expense Tracker API is running",
    status: "OK",
  });
});

// API routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/financial-settings", financialRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(err.statusCode || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });