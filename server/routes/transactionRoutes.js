
import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

import Transaction from "../models/Transaction.js";
import FinancialSettings from "../models/FinancialSettings.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect every transaction route
router.use(verifyToken);

const getCurrentMonthRange = () => {
  const now = new Date();

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
};

// Get or create settings for the logged-in user
const getUserSettings = async (userId) => {
  return FinancialSettings.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        monthlySavingsTarget: 0,
        spendingLimitPercentage: 70,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );
};

// Check spending limit using only this user's transactions
const checkSpendingLimit = async (
  userId,
  additionalExpense,
  excludeId = null
) => {
  const settings = await getUserSettings(userId);
  const { start, end } = getCurrentMonthRange();

  const baseQuery = {
    userId,
    createdAt: { $gte: start, $lt: end },
  };

  const expenseQuery = { ...baseQuery, type: "expense" };

  if (excludeId) {
    expenseQuery._id = { $ne: excludeId };
  }

  const expenses = await Transaction.find(expenseQuery);
  const incomes = await Transaction.find({
    ...baseQuery,
    type: "income",
  });

  const currentExpense = expenses.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const currentIncome = incomes.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  const newExpense = currentExpense + additionalExpense;

  const spendingPercentage =
    currentIncome > 0 ? (newExpense / currentIncome) * 100 : 0;

  return {
    allowed:
      currentIncome === 0 ||
      spendingPercentage <= settings.spendingLimitPercentage,
    currentIncome,
    currentExpense,
    newExpense,
    spendingPercentage,
    limitPercentage: settings.spendingLimitPercentage,
  };
};

// GET all transactions belonging to the logged-in user
router.get("/", async (req, res, next) => {
  try {
    const transactions = await Transaction.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// GET one transaction belonging to the logged-in user
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// POST transaction
router.post(
  "/",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required.")
      .isLength({ max: 100 })
      .withMessage("Title cannot exceed 100 characters."),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("type")
      .isIn(["income", "expense"])
      .withMessage("Type must be income or expense."),
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be greater than 0."),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { title, category, type, amount } = req.body;

      if (type === "expense") {
        const limitCheck = await checkSpendingLimit(
          req.user.id,
          Number(amount)
        );

        if (!limitCheck.allowed) {
          return res.status(400).json({
            message: "Spending limit reached. This expense cannot be added.",
            details: {
              currentIncome: limitCheck.currentIncome,
              currentExpense: limitCheck.currentExpense,
              attemptedExpense: limitCheck.newExpense,
              spendingPercentage: Number(
                limitCheck.spendingPercentage.toFixed(2)
              ),
              limitPercentage: limitCheck.limitPercentage,
            },
          });
        }
      }

      const transaction = await Transaction.create({
        userId: req.user.id,
        title,
        category,
        type,
        amount: Number(amount),
      });

      req.app.get("io")?.emit("transaction:update", {
        userId: req.user.id,
        message: "A new transaction was added successfully!",
      });

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

// PUT transaction
router.put(
  "/:id",
  [
    body("title").optional().trim().notEmpty().isLength({ max: 100 }),
    body("category").optional().trim().notEmpty(),
    body("type").optional().isIn(["income", "expense"]),
    body("amount").optional().isFloat({ min: 0.01 }),
  ],
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const existingTransaction = await Transaction.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!existingTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const updatedType = req.body.type || existingTransaction.type;
      const updatedAmount =
        req.body.amount !== undefined
          ? Number(req.body.amount)
          : Number(existingTransaction.amount);

      if (updatedType === "expense") {
        const limitCheck = await checkSpendingLimit(
          req.user.id,
          updatedAmount,
          req.params.id
        );

        if (!limitCheck.allowed) {
          return res.status(400).json({
            message: "Spending limit reached. This update cannot be saved.",
            details: {
              currentIncome: limitCheck.currentIncome,
              currentExpense: limitCheck.currentExpense,
              attemptedExpense: limitCheck.newExpense,
              spendingPercentage: Number(
                limitCheck.spendingPercentage.toFixed(2)
              ),
              limitPercentage: limitCheck.limitPercentage,
            },
          });
        }
      }

      // Never allow the client to change ownership through the request body.
      const { userId, _id, ...safeUpdates } = req.body;

      const transaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        safeUpdates,
        { new: true, runValidators: true }
      );

      req.app.get("io")?.emit("transaction:update", {
        userId: req.user.id,
        message: "A transaction was updated successfully!",
      });

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE transaction
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    req.app.get("io")?.emit("transaction:update", {
      userId: req.user.id,
      message: "A transaction was deleted successfully!",
    });

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
