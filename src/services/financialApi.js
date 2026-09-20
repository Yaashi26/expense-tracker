const API_URL =
  "http://localhost:5000/api/financial-settings";

export const getFinancialSettings = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch financial settings");
  }

  return response.json();
};

export const updateFinancialSettings = async (settings) => {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const data = await response.json();

    throw new Error(
      data.message || "Failed to update financial settings"
    );
  }

  return response.json();
};