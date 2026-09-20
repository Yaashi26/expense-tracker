const API_URL =
  "http://localhost:5000/api/ai/suggestions";

export const getAISuggestions = async (data) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to generate AI suggestions");
  }

  return response.json();
};