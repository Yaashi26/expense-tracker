
import { CircleUserRound } from "lucide-react";

const transactions = [
  {
    category: "Income",
    title: "Salary",
    type: "income",
    amount: 100000,
  },
  {
    category: "Entertainment",
    title: "Movie",
    type: "expense",
    amount: 500,
  },
  {
    category: "Shopping",
    title: "Shopping",
    type: "expense",
    amount: 5500,
  },
];

export default function App() {
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
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Logout
          </button>

          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
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
            Your trial ends in 30 days. Pay now to continue enjoying the service.
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
          <h3 className="text-2xl font-bold text-gray-900">₹100000</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Total Expense</p>
          <h3 className="text-2xl font-bold text-gray-900">₹6000</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Most Spent Category</p>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-sm font-bold">
              🛍
            </span>
            <span className="font-semibold text-gray-800">Shopping</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Least Spent Category</p>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
              🎬
            </span>
            <span className="font-semibold text-gray-800">Entertainment</span>
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
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Expenses Breakdown</h3>

          <div className="flex justify-center mb-4">
            <div className="w-36 h-36 rounded-full border-[14px] border-pink-500 border-t-green-500"></div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                <span className="text-gray-700">Shopping</span>
              </div>
              <span className="font-medium text-gray-700">₹5500</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-700">Entertainment</span>
              </div>
              <span className="font-medium text-gray-700">₹500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Income vs Expense */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-semibold text-gray-800 mb-4">Monthly Income vs Expense</h3>

        <div className="h-64 flex items-end justify-center gap-10">
          <div className="w-28 md:w-36 bg-indigo-600 rounded-t-xl" style={{ height: "85%" }}></div>
          <div className="w-28 md:w-36 bg-indigo-300 rounded-t-xl" style={{ height: "18%" }}></div>
        </div>
      </div>

      {/* Transactions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium">
            Add Transaction
          </button>

          <button className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-medium">
            Add Category
          </button>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Breakdown Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Overall Expenses Breakdown</h3>

          <div className="flex justify-center mb-5">
            <div className="w-40 h-40 rounded-full border-[16px] border-pink-500 border-t-green-500"></div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                  <span className="font-medium text-gray-700">Shopping</span>
                </div>
                <span className="text-gray-600">₹5500</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-[92%] bg-pink-500 rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="font-medium text-gray-700">Entertainment</span>
                </div>
                <span className="text-gray-600">₹500</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full w-[8%] bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="xl:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="font-semibold text-gray-800 mb-4">Transaction History</h3>

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
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            t.category === "Income"
                              ? "bg-green-600"
                              : t.category === "Shopping"
                              ? "bg-pink-500"
                              : "bg-green-500"
                          }`}
                        >
                          {t.category === "Income" ? "₹" : t.category === "Shopping" ? "🛍" : "🎬"}
                        </div>

                        <span className="font-medium text-gray-700">{t.category}</span>
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

                    <td className="py-4 font-semibold text-gray-800">₹{t.amount}</td>

                    <td className="py-4">
                      <div className="flex items-center gap-3 text-lg">
                        <button className="text-yellow-500 hover:text-yellow-600">✏️</button>
                        <button className="text-red-500 hover:text-red-600">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}