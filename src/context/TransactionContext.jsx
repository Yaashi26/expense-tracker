import { createContext, useContext, useEffect, useState } from "react";

import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionApi";

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  const [categories, setCategories] = useState([
    "Food",
    "Shopping",
    "Entertainment",
    "Travel",
    "Bills",
  ]);

  // Load transactions from MongoDB
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };

    loadTransactions();
  }, []);

  // Add transaction
  const createTransaction = async (transaction) => {
    try {
      const newTransaction = await addTransaction(transaction);

      setTransactions((prev) => [newTransaction, ...prev]);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // Update transaction
  const editTransaction = async (id, transaction) => {
    try {
      const updatedTransaction = await updateTransaction(
        id,
        transaction
      );

      setTransactions((prev) =>
        prev.map((item) =>
          item._id === id ? updatedTransaction : item
        )
      );
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  // Delete transaction
  const removeTransaction = async (id) => {
    try {
      await deleteTransaction(id);

      setTransactions((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        setTransactions,
        categories,
        setCategories,
        createTransaction,
        editTransaction,
        removeTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}