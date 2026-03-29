import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/api/v1/users/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMessage("Password reset request sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Forgot Password</h1>
          <p className="mt-3 text-sm text-gray-300">
            Enter your email to reset your password
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Email
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          {message && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
            {!loading && <KeyRound size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="font-medium text-blue-400 transition hover:text-blue-300"
            type="button"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;