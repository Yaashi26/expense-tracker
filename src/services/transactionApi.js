const API_URL = "http://localhost:5000/api/transactions";

// Get all transactions
export const getTransactions = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
};

// Post transaction
export const addTransaction = async (transaction) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to add transaction");
  }

  return response.json();
};

// Get transaction by ID
export const getTransactionById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch transaction");
  }

  return response.json();
};

// Update transaction
export const updateTransaction = async (id, transaction) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to update transaction");
  }

  return response.json();
};

// Delete transaction
export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete transaction");
  }

  return response.json();
};