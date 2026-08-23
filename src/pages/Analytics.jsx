function Analytics() {
  const categories = [
    { name: "Shopping", amount: 5500, color: "bg-pink-500" },
    { name: "Entertainment", amount: 500, color: "bg-purple-500" },
    { name: "Food", amount: 0, color: "bg-yellow-500" },
    { name: "Travel", amount: 0, color: "bg-blue-500" },
    { name: "Bills", amount: 0, color: "bg-orange-500" },
  ];

  const totalExpense = categories.reduce(
    (total, category) => total + category.amount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Analytics
        </h1>
        <p className="text-gray-500 mt-1">
          Understand your spending patterns
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Total Income
          </p>
          <h2 className="text-2xl font-bold text-gray-800">
            ₹100000
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Total Expense
          </p>
          <h2 className="text-2xl font-bold text-gray-800">
            ₹{totalExpense}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Highest Spending
          </p>
          <h2 className="text-xl font-bold text-gray-800">
            Shopping
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Savings
          </p>
          <h2 className="text-2xl font-bold text-green-600">
            ₹94000
          </h2>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <h2 className="font-semibold text-gray-800 mb-6">
            Spending by Category
          </h2>

          <div className="space-y-5">

            {categories.map((category) => (
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
                    className={`h-full ${category.color} rounded-full`}
                    style={{
                      width:
                        totalExpense === 0
                          ? "0%"
                          : `${(category.amount / totalExpense) * 100}%`,
                    }}
                  ></div>
                </div>

              </div>
            ))}

          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <h2 className="font-semibold text-gray-800 mb-6">
            Income vs Expense
          </h2>

          <div className="h-64 flex items-end justify-center gap-12">

            <div className="flex flex-col items-center gap-2">
              <div
                className="w-24 bg-indigo-600 rounded-t-xl"
                style={{ height: "220px" }}
              ></div>
              <span className="text-sm text-gray-600">
                Income
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div
                className="w-24 bg-indigo-300 rounded-t-xl"
                style={{ height: "40px" }}
              ></div>
              <span className="text-sm text-gray-600">
                Expense
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Analytics;