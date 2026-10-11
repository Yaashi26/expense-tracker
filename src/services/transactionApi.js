
const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/transactions`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Session expired. Please log in again.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const handleResponse = async (response, defaultMessage) => {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("Session expired or invalid. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || defaultMessage);
  }

  return data;
};

// Get all transactions
export const getTransactions = async () => {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Failed to fetch transactions");
};

// Add transaction
export const addTransaction = async (transaction) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });

  return handleResponse(response, "Failed to add transaction");
};

// Get transaction by ID
export const getTransactionById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Failed to fetch transaction");
};

// Update transaction
export const updateTransaction = async (id, transaction) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(transaction),
  });

  return handleResponse(response, "Failed to update transaction");
};

// Delete transaction
export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Failed to delete transaction");
};
