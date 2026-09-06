import { useTransactions } from "../context/TransactionContext";

function Analytics() {
  const { transactions } = useTransactions();

  const incomeTransactions = transactions.filter(
    (transaction) => transaction.type === "income"
  );

  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense"
  );

  const totalIncome = incomeTransactions.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0
  );

  const totalExpense = expenseTransactions.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0
  );

  const savings = totalIncome - totalExpense;

  // Calculate spending by category
  const categoryTotals = {};

  expenseTransactions.forEach((transaction) => {
    categoryTotals[transaction.category] =
      (categoryTotals[transaction.category] || 0) +
      Number(transaction.amount);
  });

  const categories = Object.entries(categoryTotals).map(
    ([name, amount]) => ({
      name,
      amount,
    })
  );

  const highestSpending =
    categories.length > 0
      ? categories.reduce((highest, category) =>
          category.amount > highest.amount ? category : highest
        )
      : null;

  const categoryColors = {
    Shopping: "bg-pink-500",
    Entertainment: "bg-purple-500",
    Food: "bg-yellow-500",
    Travel: "bg-blue-500",
    Bills: "bg-orange-500",
  };

  const maxAmount = Math.max(totalIncome, totalExpense, 1);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Analytics
        </h1>

        <p className="text-gray-500 mt-1">
          Understand your spending patterns
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Total Income
          </p>

          <h2 className="text-2xl font-bold text-gray-800">
            ₹{totalIncome}
          </h2>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Total Expense
          </p>

          <h2 className="text-2xl font-bold text-gray-800">
            ₹{totalExpense}
          </h2>
        </div>

        {/* Highest Spending */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Highest Spending
          </p>

          <h2 className="text-xl font-bold text-gray-800">
            {highestSpending
              ? highestSpending.name
              : "No expenses"}
          </h2>

          {highestSpending && (
            <p className="text-sm text-gray-500 mt-1">
              ₹{highestSpending.amount}
            </p>
          )}
        </div>

        {/* Savings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Savings
          </p>

          <h2
            className={`text-2xl font-bold ${
              savings >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ₹{savings}
          </h2>
        </div>

      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Spending by Category */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <h2 className="font-semibold text-gray-800 mb-6">
            Spending by Category
          </h2>

          <div className="space-y-5">

            {categories.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No expense data available.
              </p>
            ) : (
              categories.map((category) => (

                <div key={category.name}>

                  <div className="flex justify-between mb-2">

                    <span className="text-gray-700 font-medium">
                      {category.name}
                    </span>

                    <span className="text-gray-600">
                      ₹{category.amount}
                    </span>

                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className={`h-full ${
                        categoryColors[category.name] ||
                        "bg-cyan-500"
                      } rounded-full`}
                      style={{
                        width:
                          totalExpense === 0
                            ? "0%"
                            : `${
                                (category.amount /
                                  totalExpense) *
                                100
                              }%`,
                      }}
                    ></div>

                  </div>

                </div>

              ))
            )}

          </div>
        </div>

        {/* Income vs Expense */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <h2 className="font-semibold text-gray-800 mb-6">
            Income vs Expense
          </h2>

          <div className="h-64 flex items-end justify-center gap-12">

            {/* Income */}
            <div className="flex flex-col items-center gap-2">

              <div
                className="w-24 bg-indigo-600 rounded-t-xl"
                style={{
                  height: `${(totalIncome / maxAmount) * 220}px`,
                  minHeight:
                    totalIncome > 0 ? "10px" : "0px",
                }}
              ></div>

              <span className="text-sm text-gray-600">
                Income
              </span>

              <span className="text-sm font-medium">
                ₹{totalIncome}
              </span>

            </div>

            {/* Expense */}
            <div className="flex flex-col items-center gap-2">

              <div
                className="w-24 bg-indigo-300 rounded-t-xl"
                style={{
                  height: `${(totalExpense / maxAmount) * 220}px`,
                  minHeight:
                    totalExpense > 0 ? "10px" : "0px",
                }}
              ></div>

              <span className="text-sm text-gray-600">
                Expense
              </span>

              <span className="text-sm font-medium">
                ₹{totalExpense}
              </span>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Analytics;