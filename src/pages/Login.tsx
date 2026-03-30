import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import handleSubmit from "@/components/auth";
import { useDataContext } from "@data/Context";
import {CREATE_USER} from "@data/v";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useDataContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const user = await handleSubmit(email, password);
      setUser(user);

      if (user.role === "ADMIN") {
        navigate("/profile");
        return;
      }

      if (user.role === "SERVICE_PROVIDER") {
        navigate("/profile");
        return;
      }

      if (user.role === "CUSTOMER") {
        navigate("/profile");
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Welcome Back</h1>
          <p className="mt-3 text-sm text-gray-300">
            Sign in to access your SmartQueue account
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Email
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-blue-500 transition">
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-blue-500 transition">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <LogIn size={18} />}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-gray-300 transition hover:text-white"
            type="button"
          >
            Forgot password?
          </button>

          <button
            onClick={() => navigate("/register")}
            className="font-medium text-blue-400 transition hover:text-blue-300"
            type="button"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;