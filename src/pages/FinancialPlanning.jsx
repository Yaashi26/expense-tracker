import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useTransactions } from "../context/TransactionContext";
import {
  getFinancialSettings,
  updateFinancialSettings,
} from "../services/financialApi";
import { getAISuggestions } from "../services/aiApi";

function FinancialPlanning() {
  const navigate = useNavigate();

  const { transactions } = useTransactions();

  const [settings, setSettings] = useState({
    monthlySavingsTarget: 0,
    spendingLimitPercentage: 70,
  });

  const [targetInput, setTargetInput] = useState("");
  const [limitInput, setLimitInput] = useState("70");

  const [loadingSettings, setLoadingSettings] =
    useState(true);

  const [savingSettings, setSavingSettings] =
    useState(false);

  const [suggestions, setSuggestions] = useState([]);

  const [loadingAI, setLoadingAI] = useState(false);

  const [aiMessage, setAiMessage] = useState("");

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce(
          (sum, t) => sum + Number(t.amount),
          0
        ),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce(
          (sum, t) => sum + Number(t.amount),
          0
        ),
    [transactions]
  );

  const savings = totalIncome - totalExpense;

  const spendingPercentage =
    totalIncome > 0
      ? (totalExpense / totalIncome) * 100
      : 0;

  const savingsProgress =
    Number(settings.monthlySavingsTarget) > 0
      ? Math.min(
          Math.max(
            (savings /
              Number(settings.monthlySavingsTarget)) *
              100,
            0
          ),
          100
        )
      : 0;

  const limitReached =
    totalIncome > 0 &&
    spendingPercentage >=
      Number(settings.spendingLimitPercentage);

  const categoryBreakdown = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryBreakdown[t.category] =
        (categoryBreakdown[t.category] || 0) +
        Number(t.amount);
    });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getFinancialSettings();

        setSettings(data);
        setTargetInput(data.monthlySavingsTarget);
        setLimitInput(data.spendingLimitPercentage);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();

    const target = Number(targetInput);
    const limit = Number(limitInput);

    if (target < 0 || limit < 1 || limit > 100) {
      alert(
        "Please enter a valid savings target and spending limit."
      );
      return;
    }

    try {
      setSavingSettings(true);

      const updated = await updateFinancialSettings({
        monthlySavingsTarget: target,
        spendingLimitPercentage: limit,
      });

      setSettings(updated);

      alert("Financial settings saved successfully.");
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const generateSuggestions = async () => {
    try {
      setLoadingAI(true);
      setAiMessage("");

      const data = await getAISuggestions({
        totalIncome,
        totalExpense,
        savings,
        spendingPercentage,
        savingsTarget:
          Number(settings.monthlySavingsTarget),
        categoryBreakdown,
      });

      setSuggestions(data.suggestions || []);

      if (data.source === "fallback") {
        setAiMessage(
          "AI key is not configured, so demo suggestions are being shown."
        );
      } else {
        setAiMessage(
          "Suggestions generated using Gemini AI."
        );
      }
    } catch (error) {
      setAiMessage(
        "Could not generate suggestions right now."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">
          Loading financial planner...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Smart Money Planner
          </h1>

          <p className="text-gray-500 mt-1">
            Set savings goals and get personalized money suggestions.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-medium"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Warning */}
      {limitReached && totalIncome > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl mb-6">
          <h2 className="font-bold text-lg">
            ⚠️ Spending Limit Reached
          </h2>

          <p className="text-sm mt-1">
            You have spent {spendingPercentage.toFixed(1)}%
            of your monthly income. New expenses above your
            configured limit will be blocked.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Monthly Income
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            ₹{totalIncome}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Monthly Expense
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            ₹{totalExpense}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Current Savings
          </p>

          <h2
            className={`text-2xl font-bold mt-2 ${
              savings >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ₹{savings}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Spending
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {spendingPercentage.toFixed(1)}%
          </h2>
        </div>

      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Financial Targets
        </h2>

        <form
          onSubmit={saveSettings}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end"
        >

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Savings Target
            </label>

            <input
              type="number"
              min="0"
              value={targetInput}
              onChange={(e) =>
                setTargetInput(e.target.value)
              }
              placeholder="Example: 20000"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spending Limit (% of Income)
            </label>

            <input
              type="number"
              min="1"
              max="100"
              value={limitInput}
              onChange={(e) =>
                setLimitInput(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <p className="text-xs text-gray-500 mt-1">
              Default limit is 70%.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-3 rounded-lg font-medium"
          >
            {savingSettings
              ? "Saving..."
              : "Save Targets"}
          </button>

        </form>
      </div>

      {/* Savings Progress */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">

        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-800">
            Savings Goal Progress
          </h2>

          <span className="font-semibold text-gray-700">
            {savingsProgress.toFixed(0)}%
          </span>
        </div>

        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{
              width: `${savingsProgress}%`,
            }}
          ></div>
        </div>

        <div className="flex justify-between text-sm text-gray-500 mt-3">
          <span>
            Saved: ₹{Math.max(savings, 0)}
          </span>

          <span>
            Target: ₹
            {settings.monthlySavingsTarget}
          </span>
        </div>

      </div>

      {/* AI Suggestions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              🤖 AI Money Suggestions
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Suggestions based on your expense pattern.
            </p>
          </div>

          <button
            onClick={generateSuggestions}
            disabled={loadingAI}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-2 rounded-lg font-medium"
          >
            {loadingAI
              ? "Generating..."
              : "Get AI Suggestions"}
          </button>

        </div>

        {aiMessage && (
          <p className="text-sm text-gray-500 mb-4">
            {aiMessage}
          </p>
        )}

        {suggestions.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-5 text-gray-500 text-sm">
            Click "Get AI Suggestions" to analyze your
            spending.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-5"
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  {suggestion.title}
                </h3>

                <p className="text-sm text-gray-600 leading-6">
                  {suggestion.text}
                </p>
              </div>
            ))}

          </div>
        )}

        <p className="text-xs text-gray-400 mt-5">
          AI suggestions are for educational purposes only
          and are not guaranteed financial advice.
        </p>

      </div>

    </div>
  );
}

export default FinancialPlanning;