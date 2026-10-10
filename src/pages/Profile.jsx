
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
} from "../services/authApi";

const currencyOptions = [
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
];

function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    currency: "INR",
    role: "user",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currency: "INR",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Make sure this key matches the one used in Login.jsx.
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in again to view your profile.");
        }

        const user = await getUserProfile(token);

        const details = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          currency: user.currency || "INR",
          role: user.role || "user",
        };

        setProfile(details);
        setFormData({
          name: details.name,
          email: details.email,
          phone: details.phone,
          currency: details.currency,
        });
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      currency: profile.currency,
    });
    setError("");
    setSuccess("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      currency: profile.currency,
    });
    setEditing(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const updatedUser = await updateUserProfile(token, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        currency: formData.currency,
      });

      const details = {
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        currency: updatedUser.currency || "INR",
        role: updatedUser.role || "user",
      };

      setProfile(details);
      setFormData({
        name: details.name,
        email: details.email,
        phone: details.phone,
        currency: details.currency,
      });

      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCurrency =
    currencyOptions.find(
      (item) => item.value === profile.currency
    )?.label || profile.currency;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Profile
        </h1>
        <p className="mt-1 text-gray-500">
          Manage your account information
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-white">
            <CircleUserRound size={50} />
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            {profile.name}
          </h2>

          <p className="text-sm text-gray-500">
            {profile.role === "admin" ? "Admin Account" : "User Account"}
          </p>

          {!editing && (
            <button
              type="button"
              onClick={handleEdit}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Personal Information
          </h2>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm text-gray-500"
                >
                  Full Name
                </label>
                {editing ? (
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="mt-1 break-words rounded-lg border border-gray-200 px-4 py-3 text-gray-700">
                    {profile.name || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="text-sm text-gray-500"
                >
                  Email
                </label>
                {editing ? (
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="mt-1 break-words rounded-lg border border-gray-200 px-4 py-3 text-gray-700">
                    {profile.email || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="text-sm text-gray-500"
                >
                  Phone
                </label>
                {editing ? (
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={20}
                    placeholder="Enter phone number"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="mt-1 break-words rounded-lg border border-gray-200 px-4 py-3 text-gray-700">
                    {profile.phone || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="text-sm text-gray-500"
                >
                  Currency
                </label>
                {editing ? (
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-blue-500"
                  >
                    {currencyOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 rounded-lg border border-gray-200 px-4 py-3 text-gray-700">
                    {selectedCurrency}
                  </div>
                )}
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
