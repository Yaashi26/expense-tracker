import mongoose from "mongoose";

const spendingAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    limitPercentage: {
      type: Number,
      required: true,
    },
    thresholdAmount: {
      type: Number,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

spendingAlertSchema.index(
  { userId: 1, month: 1 },
  { unique: true }
);

const SpendingAlert = mongoose.model(
  "SpendingAlert",
  spendingAlertSchema
);

export default SpendingAlert;