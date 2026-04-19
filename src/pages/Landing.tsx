import { useNavigate } from "react-router-dom";
import { useDataContext } from "@data/Context";
import { ArrowRight, LogIn } from "lucide-react";

export default function Landing() {
  const { user } = useDataContext();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-6">
      
      {/* Hero Section */}
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          {user ? `Welcome back, ${user.firstName}` : "SmartQueue"}
        </h1>

        <p className="text-lg text-gray-300 mb-8">
          Efficiently manage appointments, queues, and users with a fast,
          modern system built for real-world workflows.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          {user ? (
            <button
              onClick={() => navigate("/account")}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition"
              >
                Get Started
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-6 py-3 border border-gray-500 hover:bg-gray-700 rounded-xl transition"
              >
                Sign In
                <LogIn size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full">
        {[
          {
            title: "Real-Time Updates",
            desc: "Instant queue updates and live tracking."
          },
          {
            title: "Role-Based Access",
            desc: "Different dashboards for clients, admins, and providers."
          },
          {
            title: "Smart Scheduling",
            desc: "Book and manage appointments effortlessly."
          }
        ].map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10 hover:scale-105 transition"
          >
            <h3 className="text-xl font-semibold mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}