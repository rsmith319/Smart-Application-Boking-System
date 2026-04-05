import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, UserPlus } from "lucide-react";
import { CREATE_USER } from "@/data/v";

const CreateAccount = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "CUSTOMER"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(CREATE_USER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error!: status: ${response.status}`);
      }

      setSuccess("Account created successfully");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-6 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Create Account</h1>
          <p className="mt-3 text-sm text-gray-300">
            Join SmartQueue and start managing your appointments
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                First Name
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <User size={18} className="text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Last Name
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <User size={18} className="text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Email
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Phone Number
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <Phone size={18} className="text-gray-400" />
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Role
            </label>
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-white outline-none"
              >
                <option value="CUSTOMER" className="bg-gray-900">
                  Customer
                </option>
                <option value="PROVIDER" className="bg-gray-900">
                  Provider
                </option>
                <option value="ADMIN" className="bg-gray-900">
                  Admin
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Account"}
            {!loading && <UserPlus size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-medium text-blue-400 transition hover:text-blue-300"
            type="button"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;