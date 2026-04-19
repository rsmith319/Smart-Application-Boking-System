import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Trash2,
  Search,
  Bell,
  Settings,
  BarChart3,
  Activity,
  Clock3,
  Shield,
  RefreshCw,
  ChevronRight,
  Menu,
  UserCircle2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { BASE_URL, GET_ALL_USERS, DELETE_USER } from "@/data/v";

type Role = "CUSTOMER" | "PROVIDER" | "SERVICE_PROVIDER" | "ADMIN";

type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Appointment = {
  id: string;
  appointmentDate?: string;
  reason?: string;
  notes?: string;
  status?: string;
  customerId?: string;
  providerId?: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  provider?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

const GET_ALL_APPOINTMENTS = `${BASE_URL}/appointments`;

function normalizeRole(role?: string): "CUSTOMER" | "PROVIDER" | "ADMIN" | "UNKNOWN" {
  const value = String(role ?? "").toUpperCase().trim();

  if (value === "SERVICE_PROVIDER" || value === "PROVIDER") return "PROVIDER";
  if (value === "CUSTOMER") return "CUSTOMER";
  if (value === "ADMIN") return "ADMIN";

  return "UNKNOWN";
}

function formatName(user?: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const full = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  return full || user?.email || "Unknown";
}

function formatDate(date?: string) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function isUpcoming(date?: string) {
  if (!date) return false;
  const d = new Date(date);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

function isToday(date?: string) {
  if (!date) return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(date?: string) {
  if (!date) return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();
  const start = new Date(now);
  const day = start.getDay();
  const diffToMonday = (day + 6) % 7;
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return d >= start && d < end;
}

function getRoleBadge(role?: string) {
  switch (normalizeRole(role)) {
    case "ADMIN":
      return "bg-violet-500/15 text-violet-300 border-violet-400/20";
    case "PROVIDER":
      return "bg-blue-500/15 text-blue-300 border-blue-400/20";
    case "CUSTOMER":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
    default:
      return "bg-white/10 text-gray-300 border-white/10";
  }
}

function getRoleLabel(role?: string) {
  switch (normalizeRole(role)) {
    case "ADMIN":
      return "ADMIN";
    case "PROVIDER":
      return "PROVIDER";
    case "CUSTOMER":
      return "CUSTOMER";
    default:
      return "UNKNOWN";
  }
}

function getStatusBadge(status?: string) {
  const value = (status ?? "").toUpperCase();

  if (value.includes("CONFIRMED") || value.includes("COMPLETED")) {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/20";
  }

  if (value.includes("PENDING")) {
    return "bg-amber-500/15 text-amber-300 border-amber-400/20";
  }

  if (value.includes("CANCEL") || value.includes("FAILED")) {
    return "bg-rose-500/15 text-rose-300 border-rose-400/20";
  }

  return "bg-white/10 text-gray-300 border-white/10";
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [usersLoading, setUsersLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "CUSTOMER" | "PROVIDER" | "ADMIN">("ALL");

  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    const res = await fetch(GET_ALL_USERS);
    if (!res.ok) {
      throw new Error(`Failed to load users (${res.status})`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.users ?? data.data ?? []);
  }

  async function loadAppointments() {
    const res = await fetch(GET_ALL_APPOINTMENTS);
    if (!res.ok) {
      throw new Error(`Failed to load appointments (${res.status})`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.appointments ?? data.data ?? []);
  }

  async function loadDashboard() {
    setError(null);
    setUsersLoading(true);
    setAppointmentsLoading(true);

    try {
      const [usersData, appointmentsData] = await Promise.all([
        loadUsers(),
        loadAppointments(),
      ]);

      setUsers(usersData);
      setAppointments(appointmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setUsersLoading(false);
      setAppointmentsLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const [usersData, appointmentsData] = await Promise.all([
        loadUsers(),
        loadAppointments(),
      ]);
      setUsers(usersData);
      setAppointments(appointmentsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDeleteUser(id: string) {
    const confirmed = window.confirm(
      "Delete this user? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(DELETE_USER(id), {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete user (${res.status})`);
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.firstName ?? ""} ${user.lastName ?? ""} ${user.email ?? ""}`
          .toLowerCase()
          .includes(userSearch.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" || normalizeRole(user.role) === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  const totalUsers = users.length;
  const totalProviders = users.filter(
    (user) => normalizeRole(user.role) === "PROVIDER"
  ).length;
  const totalCustomers = users.filter(
    (user) => normalizeRole(user.role) === "CUSTOMER"
  ).length;
  const totalAdmins = users.filter(
    (user) => normalizeRole(user.role) === "ADMIN"
  ).length;
  const activeUsers = users.filter((user) => user.enabled).length;
  const disabledUsers = users.filter((user) => !user.enabled).length;

  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter((appt) =>
    isUpcoming(appt.appointmentDate)
  ).length;
  const todayAppointments = appointments.filter((appt) =>
    isToday(appt.appointmentDate)
  ).length;
  const pendingAppointments = appointments.filter((appt) =>
    (appt.status ?? "").toUpperCase().includes("PENDING")
  ).length;
  const cancelledAppointments = appointments.filter((appt) =>
    (appt.status ?? "").toUpperCase().includes("CANCEL")
  ).length;
  const completedAppointments = appointments.filter((appt) => {
    const value = (appt.status ?? "").toUpperCase();
    return value.includes("COMPLETED") || value.includes("CONFIRMED");
  }).length;
  const completedThisWeek = appointments.filter((appt) => {
    const value = (appt.status ?? "").toUpperCase();
    return (
      (value.includes("COMPLETED") || value.includes("CONFIRMED")) &&
      isThisWeek(appt.appointmentDate)
    );
  }).length;

  const recentAppointments = [...appointments]
    .sort((a, b) => {
      const aTime = a.appointmentDate
        ? new Date(a.appointmentDate).getTime()
        : 0;
      const bTime = b.appointmentDate
        ? new Date(b.appointmentDate).getTime()
        : 0;
      return bTime - aTime;
    })
    .slice(0, 6);

  const newestUsers = [...users]
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 6);

  const roleChartData = [
    { label: "Customers", value: totalCustomers, color: "bg-emerald-400" },
    { label: "Providers", value: totalProviders, color: "bg-blue-400" },
    { label: "Admins", value: totalAdmins, color: "bg-violet-400" },
  ];

  const appointmentChartData = [
    { label: "Upcoming", value: upcomingAppointments, color: "bg-blue-400" },
    { label: "Pending", value: pendingAppointments, color: "bg-amber-400" },
    { label: "Completed", value: completedAppointments, color: "bg-emerald-400" },
    { label: "Cancelled", value: cancelledAppointments, color: "bg-rose-400" },
  ];

  const maxRoleValue = Math.max(...roleChartData.map((item) => item.value), 1);
  const maxAppointmentValue = Math.max(
    ...appointmentChartData.map((item) => item.value),
    1
  );

  const sidebarItems = [
    { label: "Overview", icon: LayoutDashboard, active: true },
    { label: "Users", icon: Users },
    { label: "Appointments", icon: CalendarDays },
    { label: "Analytics", icon: BarChart3 },
    { label: "Activity", icon: Activity },
    { label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#071224] text-white">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/10 bg-[#08101e] transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600/20 ring-1 ring-blue-400/20">
                <Shield className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">
                  Application Booking System
                </p>
                <p className="text-xs text-gray-400">Admin Console</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">
              Dashboards
            </p>

            <nav className="mt-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      item.active
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-2 border-t border-white/10 px-4 py-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Admin Scope
              </p>
              <p className="mt-3 text-sm text-gray-300">
                Manage users, review appointments, monitor platform health, and
                track role and booking trends.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09172b]/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-gray-400 sm:text-sm">
                    Overview of users, appointments, analytics, and system activity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/15 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>

                <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-gray-300">
                  <Bell className="h-4 w-4" />
                </button>

                <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
                  <UserCircle2 className="h-5 w-5 text-gray-300" />
                  <div>
                    <p className="text-sm font-medium text-white">Admin</p>
                    <p className="text-xs text-gray-400">Project account</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <section className="mb-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0b1d37] via-[#09172b] to-[#081320] p-6 shadow-2xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300/80">
                    Overview
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    SmartQueue Admin Workspace
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                    Centralized control for user management, appointments, and
                    high-level platform analytics in one feature-rich panel.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-[#0a1425]/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Active Users
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {activeUsers}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0a1425]/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Upcoming Appointments
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {upcomingAppointments}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0a1425]/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Today
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {todayAppointments}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Users",
                  value: totalUsers,
                  icon: Users,
                  tone: "text-blue-300",
                  meta: `${totalAdmins} admin, ${totalProviders} providers`,
                },
                {
                  label: "Customers",
                  value: totalCustomers,
                  icon: UserCircle2,
                  tone: "text-emerald-300",
                  meta: `${disabledUsers} disabled users`,
                },
                {
                  label: "Appointments",
                  value: totalAppointments,
                  icon: CalendarDays,
                  tone: "text-amber-300",
                  meta: `${pendingAppointments} pending`,
                },
                {
                  label: "Completed / Confirmed",
                  value: completedAppointments,
                  icon: CheckCircle2,
                  tone: "text-violet-300",
                  meta: `${completedThisWeek} completed this week`,
                },
              ].map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-[24px] border border-white/10 bg-[#0a1628] p-5 shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{card.label}</p>
                        <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                          {card.value}
                        </p>
                      </div>
                      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
                        <Icon className={`h-5 w-5 ${card.tone}`} />
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">{card.meta}</p>
                  </div>
                );
              })}
            </section>

            <section className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div className="rounded-[28px] border border-white/10 bg-[#0a1628] p-5 shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      User Role Distribution
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Live breakdown of account types in the system.
                    </p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-5">
                  {roleChartData.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="font-medium text-white">{item.value}</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/5">
                        <div
                          className={`h-3 rounded-full ${item.color}`}
                          style={{
                            width: `${(item.value / maxRoleValue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#0a1628] p-5 shadow-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Appointment Status Mix
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Current booking distribution by state.
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-5">
                  {appointmentChartData.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="font-medium text-white">{item.value}</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/5">
                        <div
                          className={`h-3 rounded-full ${item.color}`}
                          style={{
                            width: `${(item.value / maxAppointmentValue) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#0a1628] p-5 shadow-xl">
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-white">
                    Health Snapshot
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Quick operational metrics from current records.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "User Activation Rate",
                      value: `${percentage(activeUsers, totalUsers)}%`,
                      icon: UserCheck,
                    },
                    {
                      label: "Provider Share",
                      value: `${percentage(totalProviders, totalUsers)}%`,
                      icon: Briefcase,
                    },
                    {
                      label: "Pending Load",
                      value: `${percentage(pendingAppointments, totalAppointments)}%`,
                      icon: Clock3,
                    },
                    {
                      label: "Cancellation Rate",
                      value: `${percentage(cancelledAppointments, totalAppointments)}%`,
                      icon: XCircle,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#08111f] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                            <Icon className="h-4 w-4 text-gray-300" />
                          </div>
                          <p className="text-sm text-gray-300">{item.label}</p>
                        </div>
                        <p className="text-lg font-semibold text-white">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="mb-6 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
              <div className="rounded-[28px] border border-white/10 bg-[#0a1628] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      User Management
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Browse, filter, and delete users from the system.
                    </p>
                  </div>
                  <div className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400 sm:block">
                    {filteredUsers.length} shown
                  </div>
                </div>

                <div className="border-b border-white/10 px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="h-11 w-full rounded-xl border border-white/10 bg-[#08111f] pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-400/30"
                      />
                    </div>

                    <select
                      value={roleFilter}
                      onChange={(e) =>
                        setRoleFilter(
                          e.target.value as "ALL" | "CUSTOMER" | "PROVIDER" | "ADMIN"
                        )
                      }
                      className="h-11 rounded-xl border border-white/10 bg-[#08111f] px-4 text-sm text-white outline-none focus:border-blue-400/30"
                    >
                      <option value="ALL">All roles</option>
                      <option value="CUSTOMER">Customer</option>
                      <option value="PROVIDER">Provider</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white/[0.02]">
                      <tr className="text-left text-xs uppercase tracking-[0.2em] text-gray-500">
                        <th className="px-5 py-4 font-medium">User</th>
                        <th className="px-5 py-4 font-medium">Role</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                        <th className="px-5 py-4 font-medium">Created</th>
                        <th className="px-5 py-4 font-medium text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-10 text-center text-sm text-gray-400"
                          >
                            Loading users...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-10 text-center text-sm text-gray-400"
                          >
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.slice(0, 10).map((user) => (
                          <tr
                            key={user.id}
                            className="border-t border-white/10 text-sm text-gray-300"
                          >
                            <td className="px-5 py-4">
                              <div>
                                <p className="font-medium text-white">
                                  {formatName(user)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {user.email || "No email"}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getRoleBadge(
                                  user.role
                                )}`}
                              >
                                {getRoleLabel(user.role)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                                  user.enabled
                                    ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-300"
                                    : "border-rose-400/20 bg-rose-500/15 text-rose-300"
                                }`}
                              >
                                {user.enabled ? "Enabled" : "Disabled"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-gray-400">
                              {formatDate(user.createdAt)}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/15"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-[#0a1628] shadow-xl">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h3 className="text-base font-semibold text-white">
                      Quick Breakdown
                    </h3>
                  </div>

                  <div className="space-y-4 p-5">
                    {[
                      {
                        label: "Admins",
                        value: totalAdmins,
                        icon: Shield,
                      },
                      {
                        label: "Providers",
                        value: totalProviders,
                        icon: Briefcase,
                      },
                      {
                        label: "Pending Appointments",
                        value: pendingAppointments,
                        icon: Clock3,
                      },
                      {
                        label: "Upcoming Bookings",
                        value: upcomingAppointments,
                        icon: AlertTriangle,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#08111f] px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                              <Icon className="h-4 w-4 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-300">{item.label}</p>
                          </div>
                          <p className="text-lg font-semibold text-white">
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[#0a1628] shadow-xl">
                  <div className="border-b border-white/10 px-5 py-4">
                    <h3 className="text-base font-semibold text-white">
                      Newest Users
                    </h3>
                  </div>

                  <div className="p-5">
                    <div className="space-y-3">
                      {newestUsers.length === 0 ? (
                        <p className="text-sm text-gray-400">No users yet.</p>
                      ) : (
                        newestUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#08111f] px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {formatName(user)}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                {user.email || "No email"}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              <div className="rounded-[28px] border border-white/10 bg-[#0a1628] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Recent Appointments
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Latest booking activity across the platform.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">
                    {appointments.length} total
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    {appointmentsLoading ? (
                      <p className="text-sm text-gray-400">
                        Loading appointments...
                      </p>
                    ) : recentAppointments.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        No appointments found.
                      </p>
                    ) : (
                      recentAppointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="rounded-2xl border border-white/10 bg-[#08111f] p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">
                                {appt.reason || "Appointment"}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                Customer: {formatName(appt.customer)}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Provider: {formatName(appt.provider)}
                              </p>
                            </div>

                            <span
                              className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadge(
                                appt.status
                              )}`}
                            >
                              {appt.status || "UNKNOWN"}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span>{formatDate(appt.appointmentDate)}</span>
                            <span>ID: {appt.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#0a1628] shadow-xl">
                <div className="border-b border-white/10 px-5 py-4">
                  <h3 className="text-base font-semibold text-white">
                    Admin Notes
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Utility panel for controls, environment data, and notes.
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  <div className="rounded-2xl border border-white/10 bg-[#08111f] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Current API
                    </p>
                    <p className="mt-2 break-all text-sm text-gray-300">
                      {BASE_URL}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#08111f] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Supported Admin Actions
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-gray-300">
                      <li>• View all users</li>
                      <li>• Delete selected users</li>
                      <li>• View all appointments</li>
                      <li>• Monitor account distribution by role</li>
                      <li>• Track pending and upcoming booking load</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#08111f] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Live Metadata
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-gray-300">
                      <p>Total records loaded: {totalUsers + totalAppointments}</p>
                      <p>User load status: {usersLoading ? "Loading" : "Ready"}</p>
                      <p>
                        Appointment load status:{" "}
                        {appointmentsLoading ? "Loading" : "Ready"}
                      </p>
                      <p>Active vs disabled users: {activeUsers} / {disabledUsers}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#08111f] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                      Design Direction
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-300">
                      Clean SPA admin layout inspired by enterprise dashboards:
                      dense panels, left navigation, summary metrics, charts,
                      and data-first widgets.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}