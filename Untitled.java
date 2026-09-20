import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import transactionRoutes from "./routes/transactionRoutes.js";
import financialRoutes from "./routes/financialRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// Allow frontend requests
app.use(
  cors({
    origin: true,
  })
);

// Limit request body size
app.use(express.json({ limit: "10kb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Centralized error handler
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    message:
      error.message || "Internal server error",
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