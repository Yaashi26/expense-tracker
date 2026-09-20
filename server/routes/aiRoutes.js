import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

router.post("/suggestions", async (req, res, next) => {
  try {
    const {
      totalIncome = 0,
      totalExpense = 0,
      savings = 0,
      spendingPercentage = 0,
      savingsTarget = 0,
      categoryBreakdown = {},
    } = req.body;

    // Fallback if API key is not configured
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        source: "fallback",
        suggestions: [
          {
            title: "Control discretionary spending",
            text: "Review shopping and entertainment expenses before making non-essential purchases.",
          },
          {
            title: "Build savings consistently",
            text: "Try to move a fixed amount into savings when income is received.",
          },
          {
            title: "Consider SIP learning",
            text: "Learn about diversified mutual-fund SIPs and understand risk, fees and time horizon before investing.",
          },
          {
            title: "Look for discounts",
            text: "Compare prices, student offers and available coupons before online purchases.",
          },
        ],
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are a personal finance education assistant inside an Expense Tracker college project.

Analyze this user's monthly financial summary:

Income: ₹${totalIncome}
Expense: ₹${totalExpense}
Savings: ₹${savings}
Spending percentage: ${spendingPercentage.toFixed(2)}%
Savings target: ₹${savingsTarget}

Category breakdown:
${JSON.stringify(categoryBreakdown)}

Give exactly 4 concise suggestions.

The suggestions should cover:
1. One spending-saving suggestion.
2. One coupon/discount/deal-finding suggestion.
3. One savings goal suggestion.
4. One educational investment/SIP suggestion.

Rules:
- Do not promise returns.
- Do not recommend a specific stock.
- Do not present financial advice as guaranteed.
- Mention risk awareness where relevant.
- Keep each suggestion under 35 words.
- Return plain text with each suggestion on a new line.
`;

    const response = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
    });

    const text =
      response.output_text ||
      "No AI suggestions were generated.";

    const suggestions = text
      .split("\n")
      .map((item) => item.replace(/^[0-9*#.\-\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 4)
      .map((item, index) => ({
        title: `AI Suggestion ${index + 1}`,
        text: item,
      }));

    res.json({
      source: "Gemini AI",
      suggestions,
    });
  } catch (error) {
    console.error("AI suggestion error:", error);

    res.status(500).json({
      message: "Unable to generate AI suggestions.",
    });
  }
});

export default router;