import { createContext, useContext, useState } from "react";

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      category: "Income",
      title: "Salary",
      type: "income",
      amount: 100000,
    },
    {
      id: 2,
      category: "Entertainment",
      title: "Movie",
      type: "expense",
      amount: 500,
    },
    {
      id: 3,
      category: "Shopping",
      title: "Shopping",
      type: "expense",
      amount: 5500,
    },
  ]);

  const [categories, setCategories] = useState([
    "Food",
    "Shopping",
    "Entertainment",
    "Travel",
    "Bills",
  ]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        setTransactions,
        categories,
        setCategories,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}