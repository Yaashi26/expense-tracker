const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000") +
  "/api/transactions";

const getAuthHeaders = (includeContentType = false) => {
  const token = localStorage.getItem("token");

  return {
    ...(includeContentType && {
      "Content-Type": "application/json",
    }),
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

const handleResponse = async (response, fallbackMessage) => {
  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error(
      result.message || "Session expired or invalid. Please login again."
    );
  }

  if (!response.ok) {
    throw new Error(result.message || fallbackMessage);
  }

  return result;
};

export const getTransactions = async () => {
  const response = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Failed to fetch transactions");
};

export const addTransaction = async (transaction) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(transaction),
  });

  return handleResponse(response, "Failed to add transaction");
};

export const getTransactionById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Failed to fetch transaction");
};

export const updateTransaction = async (id, transaction) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(transaction),
  });

  return handleResponse(response, "Failed to update transaction");
};

export const deleteTransaction = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Failed to delete transaction");
};