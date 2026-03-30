import {
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import users from "@data/userSchema";
import { LOGIN } from "@/data/v";

type DataContextType = {
  user: users | null;
  setUser: React.Dispatch<React.SetStateAction<users | null>>;
  fetchUser: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const DataContext = createContext<DataContextType | null>(null);

function AppWrapper({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("AppWrapper must be used inside DataProvider");
  }

  const { user, logout } = context;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold tracking-tight"
          >
            SmartQueue
          </button>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                  <UserIcon size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/5"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700"
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<users | null>(null);

  const fetchUser = async (email: string, password: string) => {
    const response = await fetch(LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error("Failed to log in");
    }

    const data: users = await response.json();
    setUser(data);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <DataContext.Provider value={{ user, setUser, fetchUser, logout }}>
      <AppWrapper>{children}</AppWrapper>
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error("useDataContext must be used inside DataProvider");
  }

  return context;
}

export default DataContext;