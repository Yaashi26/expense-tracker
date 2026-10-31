import mongoose from "mongoose";

const monthlySummarySchema = new mongoose.Schema(
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
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

monthlySummarySchema.index(
  { userId: 1, month: 1 },
  { unique: true }
);

const MonthlySummary = mongoose.model(
  "MonthlySummary",
  monthlySummarySchema
);

export default MonthlySummary;