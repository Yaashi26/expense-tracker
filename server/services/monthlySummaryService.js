import cron from "node-cron";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import MonthlySummary from "../models/MonthlySummary.js";
import { sendEmail } from "./emailService.js";

const IST_OFFSET = 330 * 60 * 1000;

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const getPreviousMonthDetails = () => {
  const nowIST = new Date(Date.now() + IST_OFFSET);

  const currentYear = nowIST.getUTCFullYear();
  const currentMonth = nowIST.getUTCMonth();

  const year =
    currentMonth === 0 ? currentYear - 1 : currentYear;

  const monthIndex =
    currentMonth === 0 ? 11 : currentMonth - 1;

  const start = new Date(
    Date.UTC(year, monthIndex, 1) - IST_OFFSET
  );

  const end = new Date(
    Date.UTC(currentYear, currentMonth, 1) - IST_OFFSET
  );

  const month = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  const monthName = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(Date.UTC(year, monthIndex, 15)));

  return { start, end, month, monthName };
};

const sendSummaryToUser = async (
  user,
  { start, end, month, monthName }
) => {
  let summaryRecord;

  try {
    const transactions = await Transaction.find({
      userId: user._id,
      createdAt: { $gte: start, $lt: end },
    });

    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const balance = income - expenses;

    // Claim this user's summary for the month
    try {
      summaryRecord = await MonthlySummary.create({
        userId: user._id,
        month,
      });
    } catch (error) {
      if (error.code === 11000) {
        return; // Summary already sent or attempted
      }

      throw error;
    }

    await sendEmail({
      to: user.email,
      subject: `Expense Tracker - Your ${monthName} Summary`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${escapeHtml(user.name)}!</h2>
          <h3>Your Expense Tracker summary for ${monthName}</h3>

          <p><strong>Total Income:</strong> ₹${income.toFixed(2)}</p>
          <p><strong>Total Expenses:</strong> ₹${expenses.toFixed(2)}</p>
          <p><strong>Remaining Balance:</strong> ₹${balance.toFixed(2)}</p>
          <p><strong>Total Transactions:</strong> ${transactions.length}</p>

          <p>Thank you for using Expense Tracker.</p>
          <p>Regards,<br/>Expense Tracker Team</p>
        </div>
      `,
    });

    console.log(`Monthly summary sent to ${user.email} for ${month}`);
  } catch (error) {
    // Remove only our own claim if sending failed so a later run can retry
    if (summaryRecord) {
      await MonthlySummary.deleteOne({
        _id: summaryRecord._id,
        userId: user._id,
      });
    }

    console.error(
      `Monthly summary failed for ${user.email}:`,
      error.message
    );
  }
};

export const sendPreviousMonthSummaries = async () => {
  const details = getPreviousMonthDetails();

  try {
    const users = await User.find({}).select("_id name email");

    for (const user of users) {
      await sendSummaryToUser(user, details);
    }

    console.log(
      `Monthly summary job completed for ${details.month}`
    );
  } catch (error) {
    console.error("Monthly summary job failed:", error.message);
  }
};

export const startMonthlySummaryJob = () => {
  cron.schedule(
    "0 9 1 * *",
    () => {
      sendPreviousMonthSummaries();
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  // Catch up if the backend starts on the first day after 9 AM IST
  const nowIST = new Date(Date.now() + IST_OFFSET);
  const isFirstDay = nowIST.getUTCDate() === 1;
  const isAfterNine = nowIST.getUTCHours() >= 9;

  if (isFirstDay && isAfterNine) {
    sendPreviousMonthSummaries();
  }

  console.log("Monthly summary scheduler started (9 AM IST, 1st of each month).");
};