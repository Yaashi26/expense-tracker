import { CircleUserRound } from "lucide-react";

function Profile() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Profile
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">

          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white mb-4">
            <CircleUserRound size={50} />
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Yaashi
          </h2>

          <p className="text-gray-500 text-sm">
            User Account
          </p>

          <button className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">
            Edit Profile
          </button>

        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="text-sm text-gray-500">
                Full Name
              </label>
              <div className="mt-1 border border-gray-200 rounded-lg px-4 py-3 text-gray-700">
                Yaashi
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Email
              </label>
              <div className="mt-1 border border-gray-200 rounded-lg px-4 py-3 text-gray-700">
                user@example.com
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Phone
              </label>
              <div className="mt-1 border border-gray-200 rounded-lg px-4 py-3 text-gray-700">
                +91 XXXXX XXXXX
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Currency
              </label>
              <div className="mt-1 border border-gray-200 rounded-lg px-4 py-3 text-gray-700">
                Indian Rupee (₹)
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;