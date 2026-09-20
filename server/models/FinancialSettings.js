import mongoose from "mongoose";

const financialSettingsSchema = new mongoose.Schema(
  {
    monthlySavingsTarget: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    spendingLimitPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 70,
    },
  },
  {
    timestamps: true,
  }
);

const FinancialSettings = mongoose.model(
  "FinancialSettings",
  financialSettingsSchema
);

export default FinancialSettings;