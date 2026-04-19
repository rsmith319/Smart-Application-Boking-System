import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "@data/Context";
import {
  ArrowRight,
  LogIn,
  User,
  CalendarDays,
  LayoutDashboard,
  ShieldCheck,
  Bell,
} from "lucide-react";

type Role = "ADMIN" | "CUSTOMER" | "PROVIDER" | "STAFF";

type LegacyUser = {
  id?: string | String;
  firstName?: string | String;
  lastName?: string | String;
  email?: string | String;
  phoneNumber?: string | String;
  enabled?: boolean | Boolean;
  role?: string | String;
};

type NormalizedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  enabled: boolean;
  role: Role;
};

function normalizeUser(raw: LegacyUser | null | undefined): NormalizedUser | null {
  if (!raw) return null;

  return {
    id: String(raw.id ?? ""),
    firstName: String(raw.firstName ?? ""),
    lastName: String(raw.lastName ?? ""),
    email: String(raw.email ?? ""),
    phoneNumber: raw.phoneNumber != null ? String(raw.phoneNumber) : "",
    enabled: Boolean(raw.enabled),
    role: String(raw.role ?? "CUSTOMER") as Role,
  };
}

function getDashboardPath(role?: Role) {
  switch (role) {
    case "PROVIDER":
      return "/provider";
    case "ADMIN":
      return "/admin";
    case "STAFF":
      return "/staff";
    case "CUSTOMER":
    default:
      return "/customer";
  }
}

function getAppointmentsPath(role?: Role) {
  switch (role) {
    case "PROVIDER":
      return "/appointments/provider";
    default:
      return "/appointments";
  }
}

export default function Landing() {
  const { user } = useDataContext();
  const navigate = useNavigate();

  const currentUser = useMemo(() => normalizeUser(user as LegacyUser), [user]);
  const dashboardPath = getDashboardPath(currentUser?.role);
  const appointmentsPath = getAppointmentsPath(currentUser?.role);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            <Bell size={14} />
            Modern scheduling platform
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {currentUser ? `Welcome back, ${currentUser.firstName}` : "SmartQueue"}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
            Efficiently manage appointments, queues, and users with a fast,
            modern system built for real-world workflows.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(dashboardPath)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  Go to Dashboard
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/account")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Profile
                  <User size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                  Get Started
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-500 bg-transparent px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                  Sign In
                  <LogIn size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-semibold sm:text-2xl">
            {currentUser ? "Quick Access" : "Platform Highlights"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            {currentUser
              ? "Use the shortcuts below to move around faster."
              : "Built for modern appointment and queue workflows."}
          </p>

          <div className="mt-6 grid gap-4">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(appointmentsPath)}
                  className="group rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <CalendarDays size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        Appointments
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        Open your appointment workspace.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-300">
                        Open
                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/account")}
                  className="group rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <User size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        Account
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        View and update your profile details.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-300">
                        Open
                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(dashboardPath)}
                  className="group rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <LayoutDashboard size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        Dashboard
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        Return to your main workspace.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-300">
                        Open
                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </div>
                </button>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        Real-Time Updates
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        Instant queue updates and live appointment visibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        Role-Based Access
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        Separate workflows for customers, staff, providers, and admins.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white sm:text-base">
                        Smart Scheduling
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        Book, review, and manage appointments with less friction.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}