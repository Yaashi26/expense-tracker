import { useState } from "react";

import { useTransactions } from "../context/TransactionContext";

function Transactions() {
  const { transactions, setTransactions, categories, setCategories, createTransaction, editTransaction, removeTransaction } =
  useTransactions();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingId, setEditingId] = useState(null);


    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [newCategory, setNewCategory] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "Food",
    type: "expense",
    amount: "",
  });

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "all" || transaction.type === filter;

    return matchesSearch && matchesFilter;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };
 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.title || !formData.amount) {
    alert("Please enter title and amount.");
    return;
  }

  const transactionData = {
    title: formData.title,
    category:
      formData.type === "income" ? "Income" : formData.category,
    type: formData.type,
    amount: Number(formData.amount),
  };

  try {
    if (editingId !== null) {
      await editTransaction(editingId, transactionData);
    } else {
      await createTransaction(transactionData);
    }

    setEditingId(null);
    setShowTransactionForm(false);

    setFormData({
      title: "",
      category: categories[0] || "",
      type: "expense",
      amount: "",
    });
  } catch (error) {
    console.error("Transaction operation failed:", error);
    alert("Failed to save transaction.");
  }
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

  const deleteTransaction = async (id) => {
  try {
    await removeTransaction(id);
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete transaction.");
  }
};
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-500 mt-1">
            Manage all your income and expenses
          </p>
        </div>
            <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-medium"
            >
            Add Category
            </button>
            <button
  onClick={() => {
    setEditingId(null);
    setFormData({
      title: "",
      category: categories[0] || "",
      type: "expense",
      amount: "",
    });
    setShowTransactionForm(true);
  }}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
>
  + Add Transaction
</button>

            
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 outline-none"
          >
            <option value="all">All Transactions</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Transaction History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="text-left py-4 px-5">Category</th>
                <th className="text-left py-4">Title</th>
                <th className="text-left py-4">Type</th>
                <th className="text-left py-4">Amount</th>
                <th className="text-left py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-5">
                    <span className="font-medium text-gray-700">
                      {transaction.category}
                    </span>
                  </td>

                  <td className="py-4 text-gray-700">{transaction.title}</td>

                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td className="py-4 font-semibold text-gray-800">
                    ₹{transaction.amount}
                  </td>

                  <td className="py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                            setEditingId(transaction._id);

                            setFormData({
                            title: transaction.title,
                            category:
                                transaction.category === "Income"
                                ? "Food"
                                : transaction.category,
                            type: transaction.type,
                            amount: transaction.amount,
                            });

                            setShowTransactionForm(true);
                        }}
                        className="text-yellow-500 hover:text-yellow-600"
                        >
                        ✏️
                        </button>

                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-500"
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
    {showTransactionForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {editingId !== null
          ? "Update Transaction"
          : "Add Transaction"}
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
            <h3 className="text-xl font-bold text-gray-800">
              Add Category
            </h3>

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

export default Transactions;
