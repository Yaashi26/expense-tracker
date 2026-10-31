
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

  const [currentUserId, setCurrentUserId] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null")?.id || null
  );

  useEffect(() => {
    const handleUserChange = () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const nextUserId = user?.id || null;

      setCurrentUserId(nextUserId);
    };

    window.addEventListener("auth-change", handleUserChange);

    return () => {
      window.removeEventListener("auth-change", handleUserChange);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTransactions = async () => {
      setTransactions([]);

      if (!currentUserId || !localStorage.getItem("token")) return;

      try {
        const data = await getTransactions();

        if (!cancelled) {
          setTransactions(data);
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const createTransaction = async (transaction) => {
    const newTransaction = await addTransaction(transaction);
    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  };

  const editTransaction = async (id, transaction) => {
    const updatedTransaction = await updateTransaction(id, transaction);

    setTransactions((prev) =>
      prev.map((item) => item._id === id ? updatedTransaction : item)
    );

    return updatedTransaction;
  };

  const removeTransaction = async (id) => {
    await deleteTransaction(id);
    setTransactions((prev) => prev.filter((item) => item._id !== id));
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
