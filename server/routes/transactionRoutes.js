import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";

import Transaction from "../models/Transaction.js";
import FinancialSettings from "../models/FinancialSettings.js";

const router = express.Router();

// Get start and end of current month
const getCurrentMonthRange = () => {
  const now = new Date();

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  return { start, end };
};

// Check spending limit
const checkSpendingLimit = async (additionalExpense, excludeId = null) => {
  let settings = await FinancialSettings.findOne();

  if (!settings) {
    settings = await FinancialSettings.create({
      monthlySavingsTarget: 0,
      spendingLimitPercentage: 70,
    });
  }

  const { start, end } = getCurrentMonthRange();

  const query = {
    type: "expense",
    createdAt: {
      $gte: start,
      $lt: end,
    },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const transactions = await Transaction.find(query);

  const currentExpense = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0
  );

  const incomeTransactions = await Transaction.find({
    type: "income",
    createdAt: {
      $gte: start,
      $lt: end,
    },
  });

  const currentIncome = incomeTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount),
    0
  );

  const newExpense = currentExpense + additionalExpense;

  const spendingPercentage =
    currentIncome > 0
      ? (newExpense / currentIncome) * 100
      : 0;

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

// GET all transactions
router.get("/", async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({
      createdAt: -1,
    });

    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// GET transaction by ID
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findById(
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
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

    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required."),

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

      const {
        title,
        category,
        type,
        amount,
      } = req.body;

      // Apply spending limit only to expenses
      if (type === "expense") {
        const limitCheck = await checkSpendingLimit(
          Number(amount)
        );

        if (!limitCheck.allowed) {
          return res.status(400).json({
            message:
              "Spending limit reached. This expense cannot be added.",
            details: {
              currentIncome: limitCheck.currentIncome,
              currentExpense: limitCheck.currentExpense,
              attemptedExpense: limitCheck.newExpense,
              spendingPercentage:
                Number(
                  limitCheck.spendingPercentage.toFixed(2)
                ),
              limitPercentage:
                limitCheck.limitPercentage,
            },
          });
        }
      }

      const transaction = await Transaction.create({
        title,
        category,
        type,
        amount: Number(amount),
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
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .isLength({ max: 100 }),

    body("category")
      .optional()
      .trim()
      .notEmpty(),

    body("type")
      .optional()
      .isIn(["income", "expense"]),

    body("amount")
      .optional()
      .isFloat({ min: 0.01 }),
  ],
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid transaction ID",
        });
      }

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const existingTransaction =
        await Transaction.findById(req.params.id);

      if (!existingTransaction) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }

      const updatedType =
        req.body.type || existingTransaction.type;

      const updatedAmount =
        req.body.amount !== undefined
          ? Number(req.body.amount)
          : Number(existingTransaction.amount);

      // Check limit when updated transaction is an expense
      if (updatedType === "expense") {
        const limitCheck = await checkSpendingLimit(
          updatedAmount,
          req.params.id
        );

        if (!limitCheck.allowed) {
          return res.status(400).json({
            message:
              "Spending limit reached. This update cannot be saved.",
            details: {
              currentIncome: limitCheck.currentIncome,
              currentExpense: limitCheck.currentExpense,
              attemptedExpense: limitCheck.newExpense,
              spendingPercentage:
                Number(
                  limitCheck.spendingPercentage.toFixed(2)
                ),
              limitPercentage:
                limitCheck.limitPercentage,
            },
          });
        }
      }

      const transaction =
        await Transaction.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            runValidators: true,
          }
        );

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
      return res.status(400).json({
        message: "Invalid transaction ID",
      });
    }

    const transaction =
      await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;