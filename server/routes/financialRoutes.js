import express from "express";
import { body, validationResult } from "express-validator";
import FinancialSettings from "../models/FinancialSettings.js";

const router = express.Router();

// GET financial settings
router.get("/", async (req, res, next) => {
  try {
    let settings = await FinancialSettings.findOne();

    if (!settings) {
      settings = await FinancialSettings.create({
        monthlySavingsTarget: 0,
        spendingLimitPercentage: 70,
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// UPDATE financial settings
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

      const {
        monthlySavingsTarget,
        spendingLimitPercentage,
      } = req.body;

      const settings = await FinancialSettings.findOneAndUpdate(
        {},
        {
          monthlySavingsTarget: Number(monthlySavingsTarget),
          spendingLimitPercentage: Number(
            spendingLimitPercentage
          ),
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

      res.json(settings);
    } catch (error) {
      next(error);
    }
  }
);

export default router;