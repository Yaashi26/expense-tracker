import { useState, useEffect } from "react";
import { CircleUserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "../context/TransactionContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { transactions, setTransactions, categories, setCategories } =
  useTransactions();

  const [formData, setFormData] = useState({
    title: "",
    category: "Food",
    type: "expense",
    amount: "",
  });

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount) {
      alert("Please enter title and amount.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      title: formData.title,
      category: formData.type === "income" ? "Income" : formData.category,
      type: formData.type,
      amount: Number(formData.amount),
    };

    if (editingId) {
      setTransactions(
        transactions.map((transaction) =>
          transaction.id === editingId ? newTransaction : transaction,
        ),
      );
    } else {
      setTransactions([...transactions, newTransaction]);
    }

    setFormData({
      title: "",
      category: "Food",
      type: "expense",
      amount: "",
    });

    setEditingId(null);
    setShowTransactionForm(false);
  };

  const handleAddCategory = () => {
    const category = newCategory.trim();

    if (!category) {
      alert("Please enter a category name.");
      return;
    }

    if (categories.includes(category)) {
      alert("Category already exists.");
      return;
    }

    setCategories([...categories, category]);

    setNewCategory("");
    setShowCategoryForm(false);
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);

    setFormData({
      title: transaction.title,
      category: transaction.category,
      type: transaction.type,
      amount: transaction.amount,
    });

    setShowTransactionForm(true);
  };

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [mostSpentCategory, setMostSpentCategory] = useState("");
  const [leastSpentCategory, setLeastSpentCategory] = useState("");

  useEffect(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const expense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0); //reduce(...) → sab categories mein se sabse zyada spent wali category find karta hai.

    setTotalIncome(income);
    setTotalExpense(expense);

    const categoryTotals = {}; // categoryTotals = {} → har expense category ka total amount store karega.

    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        categoryTotals[transaction.category] =
          (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    const mostSpent = Object.keys(categoryTotals).reduce(
      (highest, category) =>
        categoryTotals[category] > (categoryTotals[highest] || 0)
          ? category
          : highest,
      "",
    );

    setMostSpentCategory(mostSpent);

    const leastSpent = Object.keys(categoryTotals).reduce(
      (lowest, category) =>
        categoryTotals[category] < (categoryTotals[lowest] || Infinity)
          ? category
          : lowest,
      "",
    );

    setLeastSpentCategory(leastSpent);
  }, [transactions]);

  const expenseByCategory = {};

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      expenseByCategory[transaction.category] =
        (expenseByCategory[transaction.category] || 0) + transaction.amount;
    });

  const incomeTotal = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenseTotal = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const maxAmount = Math.max(incomeTotal, expenseTotal, 1);

  const categoryColors = {
    Shopping: "#ec4899",
    Entertainment: "#a855f7",
    Food: "#eab308",
    Travel: "#3b82f6",
    Bills: "#f97316",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Navbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            ₹
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Logout
          </button>

          <div
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white cursor-pointer"
          >
            <CircleUserRound size={20} />
          </div>
        </div>
      </div>

      {/* Dashboard Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>

      {/* Trial Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Trial Ending Soon!</h3>
          <p className="text-sm text-gray-500">
            Your trial ends in 30 days. Pay now to continue enjoying the
            service.
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium self-start md:self-auto">
          Subscribe
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Total Income</p>
          <h3 className="text-2xl font-bold text-gray-900">₹{totalIncome}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Total Expense</p>
          <h3 className="text-2xl font-bold text-gray-900">₹{totalExpense}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Most Spent Category</p>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
              {mostSpentCategory === "Shopping"
                ? "🛍"
                : mostSpentCategory === "Entertainment"
                  ? "🎬"
                  : mostSpentCategory === "Food"
                    ? "🍔"
                    : mostSpentCategory === "Travel"
                      ? "✈️"
                      : mostSpentCategory === "Bills"
                        ? "🧾"
                        : "💰"}
            </span>
            <span className="font-semibold text-gray-800">
              {mostSpentCategory || "No expenses"}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Least Spent Category</p>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
              {leastSpentCategory === "Shopping"
                ? "🛍"
                : leastSpentCategory === "Entertainment"
                  ? "🎬"
                  : leastSpentCategory === "Food"
                    ? "🍔"
                    : leastSpentCategory === "Travel"
                      ? "✈️"
                      : leastSpentCategory === "Bills"
                        ? "🧾"
                        : "📁"}
            </span>
            <span className="font-semibold text-gray-800">
              {leastSpentCategory || "No expenses"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Balance Overtime</h3>

          <div className="h-64 rounded-xl bg-gradient-to-b from-indigo-50 to-white border border-dashed border-indigo-200 flex items-center justify-center text-indigo-400 text-sm">
            Line Chart Placeholder
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Monthly Expenses Breakdown
            </h3>

            <button
              onClick={() => navigate("/analytics")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              View Analytics
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <div
              className="w-36 h-36 rounded-full"
              style={{
                background: (() => {
                  const entries = Object.entries(expenseByCategory);

                  if (entries.length === 0 || expenseTotal === 0) {
                    return "#e5e7eb";
                  }

                  let currentDegree = 0;

                  const categoryColors = {
                    Shopping: "#ec4899",
                    Entertainment: "#a855f7",
                    Food: "#eab308",
                    Travel: "#3b82f6",
                    Bills: "#f97316",
                  };

                  const parts = entries.map(([category, amount]) => {
                    const start = currentDegree;
                    currentDegree += (amount / expenseTotal) * 360;

                    return `${categoryColors[category] || "#06b6d4"} ${start}deg ${currentDegree}deg`;
                  });

                  return `conic-gradient(${parts.join(", ")})`;
                })(),
              }}
            ></div>
          </div>

          <div className="space-y-3 text-sm">
            {Object.entries(expenseByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: categoryColors[category] || "#06b6d4",
                    }}
                  ></span>
                  <span className="text-gray-700">{category}</span>
                </div>

                <span className="font-medium text-gray-700">₹{amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Income vs Expense */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">
          Monthly Income vs Expense
        </h3>

        <div className="h-64 flex items-end justify-center gap-10">
          <div
            className="w-28 md:w-36 bg-indigo-600 rounded-t-xl"
            style={{ height: `${(incomeTotal / maxAmount) * 100}%` }}
          ></div>
          <div
            className="w-28 md:w-36 bg-indigo-300 rounded-t-xl"
            style={{ height: `${(expenseTotal / maxAmount) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-center gap-10 text-sm text-gray-600">
          <div className="w-28 md:w-36 text-center">Income</div>
          <div className="w-28 md:w-36 text-center">Expense</div>
        </div>
      </div>

      {/* Transactions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/transactions")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium"
          >
            View All Transactions
          </button>

          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                title: "",
                category: "Food",
                type: "expense",
                amount: "",
              });
              setShowTransactionForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
          >
            Add Transaction
          </button>

          <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-medium"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Breakdown Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">
            Overall Expenses Breakdown
          </h3>

          <div className="flex justify-center mb-4">
            <div
              className="w-36 h-36 rounded-full"
              style={{
                background: (() => {
                  const entries = Object.entries(expenseByCategory);

                  if (entries.length === 0 || expenseTotal === 0) {
                    return "#e5e7eb";
                  }

                  let currentDegree = 0;

                  const categoryColors = {
                    Shopping: "#ec4899",
                    Entertainment: "#a855f7",
                    Food: "#eab308",
                    Travel: "#3b82f6",
                    Bills: "#f97316",
                  };

                  const parts = entries.map(([category, amount], index) => {
                    const start = currentDegree;
                    currentDegree += (amount / expenseTotal) * 360;

                    return `${categoryColors[category] || "#14b8a6"} ${start}deg ${currentDegree}deg`;
                  });

                  return `conic-gradient(${parts.join(", ")})`;
                })(),
              }}
            ></div>
          </div>
          <div className="space-y-4 text-sm">
            {Object.entries(expenseByCategory).map(([category, amount]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-600">₹{amount}</span>
                </div>

                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(amount / expenseTotal) * 100}%`,
                      backgroundColor: categoryColors[category] || "#06b6d4",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="xl:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="font-semibold text-gray-800 mb-4">
            Transaction History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-3 font-medium">Category</th>
                  <th className="text-left py-3 font-medium">Title</th>
                  <th className="text-left py-3 font-medium">Type</th>
                  <th className="text-left py-3 font-medium">Amount</th>
                  <th className="text-left py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((t, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            t.category === "Income"
                              ? "bg-green-600"
                              : t.category === "Shopping"
                                ? "bg-pink-500"
                                : t.category === "Entertainment"
                                  ? "bg-purple-500"
                                  : t.category === "Food"
                                    ? "bg-yellow-500"
                                    : t.category === "Travel"
                                      ? "bg-blue-500"
                                      : t.category === "Bills"
                                        ? "bg-orange-500"
                                        : "bg-cyan-500"
                          }`}
                        >
                          {t.category === "Income"
                            ? "₹"
                            : t.category === "Shopping"
                              ? "🛍"
                              : t.category === "Entertainment"
                                ? "🎬"
                                : t.category === "Food"
                                  ? "🍔"
                                  : t.category === "Travel"
                                    ? "✈️"
                                    : t.category === "Bills"
                                      ? "🧾"
                                      : "📌"}
                        </div>

                        <span className="font-medium text-gray-700">
                          {t.category}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 text-gray-700">{t.title}</td>

                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          t.type === "income"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>

                    <td className="py-4 font-semibold text-gray-800">
                      ₹{t.amount}
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-3 text-lg">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            setTransactions(
                              transactions.filter(
                                (transaction) => transaction.id !== t.id,
                              ),
                            )
                          }
                          className="text-red-500 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? "Update Transaction" : "Add Transaction"}
              </h3>
              <button
                type="button"
                onClick={() => setShowTransactionForm(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter transaction title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formData.type !== "income" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
                >
                  {editingId ? "Update Transaction" : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Add Category</h3>

              <button
                type="button"
                onClick={() => setShowCategoryForm(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCategory();
              }}
            >
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
