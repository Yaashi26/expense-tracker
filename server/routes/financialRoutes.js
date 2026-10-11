
import express from "express";
import { body, validationResult } from "express-validator";

import FinancialSettings from "../models/FinancialSettings.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// GET logged-in user's financial settings
router.get("/", async (req, res, next) => {
  try {
    const settings = await FinancialSettings.findOneAndUpdate(
      { userId: req.user.id },
      {
        $setOnInsert: {
          monthlySavingsTarget: 0,
          spendingLimitPercentage: 70,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// UPDATE logged-in user's financial settings
router.put(
  "/",
  [
    body("monthlySavingsTarget")
      .isFloat({ min: 0 })
      .withMessage("Savings target must be a non-negative number."),
    body("spendingLimitPercentage")
      .isFloat({ min: 1, max: 100 })
      .withMessage("Spending limit must be between 1 and 100."),
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

      const settings = await FinancialSettings.findOneAndUpdate(
        { userId: req.user.id },
        {
          $set: {
            monthlySavingsTarget: Number(req.body.monthlySavingsTarget),
            spendingLimitPercentage: Number(
              req.body.spendingLimitPercentage
            ),
          },
          $setOnInsert: {
            userId: req.user.id,
          },
        },
        { new: true, upsert: true, runValidators: true }
      );

      res.json(settings);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
