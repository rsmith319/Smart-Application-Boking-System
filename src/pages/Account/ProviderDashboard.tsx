import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDataContext } from "@data/Context";
import { BASE_URL } from "@/data/v";
import {
  Briefcase,
  CalendarDays,
  Clock3,
  UserRound,
  Mail,
  Phone,
  BadgeCheck,
  Bell,
  ArrowRight,
  ClipboardList,
  CircleDot,
  Settings,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Role = "ADMIN" | "CUSTOMER" | "PROVIDER" | "STAFF";
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type DashboardUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  enabled: boolean;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

type LegacyUser = {
  id?: string | String;
  firstName?: string | String;
  lastName?: string | String;
  email?: string | String;
  phoneNumber?: string | String;
  enabled?: boolean | Boolean;
  role?: string | String;
  createdAt?: string | String;
  updatedAt?: string | String;
};

type AppointmentPerson = {
  id?: string | String;
  firstName?: string | String;
  lastName?: string | String;
  email?: string | String;
  phoneNumber?: string | String;
  enabled?: boolean | Boolean;
  role?: string | String;
};

type RawAppointment = {
  id?: string | String;
  appointmentDate?: string | String;
  reason?: string | String;
  status?: string | String;
  customer?: AppointmentPerson | null;
  provider?: AppointmentPerson | null;
  createdAt?: string | String;
  updatedAt?: string | String;
};

type Appointment = {
  id: string;
  appointmentDate: string;
  reason: string;
  status: AppointmentStatus;
  customer: DashboardUser | null;
  provider: DashboardUser | null;
  createdAt?: string;
  updatedAt?: string;
};

type StatItem = {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path?: string;
};

function normalizeUser(raw: LegacyUser | null | undefined): DashboardUser {
  return {
    id: String(raw?.id ?? ""),
    firstName: String(raw?.firstName ?? ""),
    lastName: String(raw?.lastName ?? ""),
    email: String(raw?.email ?? ""),
    phoneNumber: raw?.phoneNumber != null ? String(raw.phoneNumber) : "",
    enabled: Boolean(raw?.enabled),
    role: String(raw?.role ?? "PROVIDER") as Role,
    createdAt: raw?.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw?.updatedAt != null ? String(raw.updatedAt) : undefined,
  };
}

function normalizeAppointmentPerson(
  raw: AppointmentPerson | null | undefined
): DashboardUser | null {
  if (!raw) return null;

  return {
    id: String(raw?.id ?? ""),
    firstName: String(raw?.firstName ?? ""),
    lastName: String(raw?.lastName ?? ""),
    email: String(raw?.email ?? ""),
    phoneNumber: raw?.phoneNumber != null ? String(raw.phoneNumber) : "",
    enabled: Boolean(raw?.enabled),
    role: String(raw?.role ?? "CUSTOMER") as Role,
    createdAt: undefined,
    updatedAt: undefined,
  };
}

function normalizeAppointment(raw: RawAppointment): Appointment {
  return {
    id: String(raw?.id ?? ""),
    appointmentDate: String(raw?.appointmentDate ?? ""),
    reason: String(raw?.reason ?? ""),
    status: String(raw?.status ?? "PENDING") as AppointmentStatus,
    customer: normalizeAppointmentPerson(raw?.customer),
    provider: normalizeAppointmentPerson(raw?.provider),
    createdAt: raw?.createdAt != null ? String(raw.createdAt) : undefined,
    updatedAt: raw?.updatedAt != null ? String(raw.updatedAt) : undefined,
  };
}

function isValidDate(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isUpcoming(value?: string) {
  if (!isValidDate(value)) return false;
  return new Date(value as string).getTime() >= Date.now();
}

function isToday(value?: string) {
  if (!isValidDate(value)) return false;

  const date = new Date(value as string);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isThisWeek(value?: string) {
  if (!isValidDate(value)) return false;

  const date = new Date(value as string);
  const now = new Date();

  const start = new Date(now);
  const day = start.getDay();
  const diffToMonday = (day + 6) % 7;
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}

function formatDateTime(value?: string) {
  if (!value || !isValidDate(value)) return "Not scheduled";

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTime(value?: string) {
  if (!value || !isValidDate(value)) return "N/A";

  return new Intl.DateTimeFormat("en-CA", {
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(status: AppointmentStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "CONFIRMED":
      return "Confirmed";
    case "CANCELLED":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

export default function ProviderDashboard() {
  const { user } = useDataContext();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [confirmingId, setConfirmingId] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const currentUser = useMemo(
    () => (user ? normalizeUser(user as LegacyUser) : null),
    [user]
  );

  useEffect(() => {
    const loadAppointments = async () => {
      if (!currentUser?.id) {
        setLoadingAppointments(false);
        return;
      }

      try {
        setLoadingAppointments(true);
        setAppointmentsError("");
        setActionMessage("");

        const res = await fetch(`${BASE_URL}/appointments`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load appointments");
        }

        const raw = await res.json();
        const normalized = Array.isArray(raw)
          ? raw.map((item) => normalizeAppointment(item as RawAppointment))
          : [];

        const providerAppointments = normalized
          .filter((appointment) => appointment.provider?.id === currentUser.id)
          .sort(
            (a, b) =>
              new Date(a.appointmentDate).getTime() -
              new Date(b.appointmentDate).getTime()
          );

        setAppointments(providerAppointments);
      } catch (err) {
        setAppointmentsError(
          err instanceof Error ? err.message : "Failed to load appointments"
        );
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [currentUser?.id]);

  const todayBookings = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        isToday(appointment.appointmentDate) &&
        appointment.status !== "CANCELLED"
    );
  }, [appointments]);

  const pendingRequests = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "PENDING"
    );
  }, [appointments]);

  const upcomingAssignedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        isUpcoming(appointment.appointmentDate) &&
        appointment.status !== "CANCELLED" &&
        appointment.status !== "COMPLETED"
    );
  }, [appointments]);

  const confirmedUpcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        isUpcoming(appointment.appointmentDate) &&
        appointment.status === "CONFIRMED"
    );
  }, [appointments]);

  const completedThisWeek = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "COMPLETED" &&
        isThisWeek(appointment.appointmentDate)
    );
  }, [appointments]);

  const activeClients = useMemo(() => {
    const ids = new Set(
      upcomingAssignedAppointments
        .map((appointment) => appointment.customer?.id)
        .filter(Boolean) as string[]
    );

    return ids.size;
  }, [upcomingAssignedAppointments]);

  const nextPendingRequests = pendingRequests.slice(0, 5);
  const todaySchedule = todayBookings.slice(0, 6);

  const stats: StatItem[] = [
    {
      label: "Today's Bookings",
      value: loadingAppointments ? "..." : String(todayBookings.length),
      icon: CalendarDays,
      path: "/appointments?filter=today",
    },
    {
      label: "Pending Requests",
      value: loadingAppointments ? "..." : String(pendingRequests.length),
      icon: Clock3,
      path: "/appointments?filter=pending",
    },
    {
      label: "Active Clients",
      value: loadingAppointments ? "..." : String(activeClients),
      icon: UserRound,
      path: "/appointments",
    },
    {
      label: "Account Status",
      value: currentUser?.enabled ? "Active" : "Disabled",
      icon: BadgeCheck,
      path: "/account",
    },
  ];

  const quickActions = [
    {
      title: "View Assigned Appointments",
      description:
        "See appointments assigned to you and manage their status.",
      icon: ClipboardList,
      to: "/appointments",
    },
    {
      title: "Review Pending Requests",
      description:
        "Open pending appointment requests and confirm them when ready.",
      icon: Clock3,
      to: "/appointments?filter=pending",
    },
    {
      title: "Update Business Profile",
      description:
        "Edit your provider contact details and account information.",
      icon: Settings,
      to: "/account",
    },
  ];

  const handleConfirm = async (appointment: Appointment) => {
    try {
      setConfirmingId(appointment.id);
      setAppointmentsError("");
      setActionMessage("");

      const payload = {
        appointmentDate: appointment.appointmentDate,
        reason: appointment.reason,
        customerId: appointment.customer?.id,
        providerId: appointment.provider?.id,
        status: "CONFIRMED",
      };

      const res = await fetch(`${BASE_URL}/appointments/${appointment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to confirm appointment");
      }

      const raw = await res.json().catch(() => null);
      const updated = raw ? normalizeAppointment(raw as RawAppointment) : null;

      setAppointments((prev) =>
        prev.map((item) => {
          if (item.id !== appointment.id) return item;
          return updated ?? { ...item, status: "CONFIRMED" };
        })
      );

      setActionMessage("Appointment confirmed successfully.");
    } catch (err) {
      setAppointmentsError(
        err instanceof Error ? err.message : "Failed to confirm appointment"
      );
    } finally {
      setConfirmingId("");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,_#081120,_#0b1324,_#111827)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-400/10" />
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.3fr_0.7fr] xl:p-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  <Briefcase size={14} />
                  Provider Portal
                </div>

                <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome, {currentUser.firstName}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                  Review appointments assigned to you, confirm pending requests,
                  and manage your provider account from one workspace.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/appointments"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-400"
                  >
                    <CalendarDays size={16} />
                    View Assigned Appointments
                  </Link>

                  <Link
                    to="/appointments?filter=pending"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    <Clock3 size={16} />
                    Review Pending Requests
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <h2 className="text-lg font-semibold">Business Profile</h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      Full Name
                    </p>
                    <p className="mt-2 text-sm font-medium text-white sm:text-base">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      Email
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-white">
                      {currentUser.email || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      Phone
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-white">
                      {currentUser.phoneNumber || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {(appointmentsError || actionMessage) && (
            <section
              className={`rounded-3xl p-5 shadow-xl backdrop-blur-xl sm:p-6 ${
                appointmentsError
                  ? "border border-red-500/20 bg-red-500/10"
                  : "border border-emerald-500/20 bg-emerald-500/10"
              }`}
            >
              <div
                className={`flex items-start gap-3 text-sm ${
                  appointmentsError ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {appointmentsError ? (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                )}
                <span>{appointmentsError || actionMessage}</span>
              </div>
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              const content = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm text-gray-400">{stat.label}</span>
                    <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  {stat.path && (
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                      <span>Open</span>
                      <ArrowRight size={16} />
                    </div>
                  )}
                </>
              );

              return stat.path ? (
                <Link
                  key={stat.label}
                  to={stat.path}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl"
                >
                  {content}
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Today’s Schedule
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-400">
                    Appointments assigned to you for today.
                  </p>
                </div>

                <Link
                  to="/appointments?filter=today"
                  className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15 sm:inline-flex"
                >
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              {loadingAppointments ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                  Loading today’s schedule...
                </div>
              ) : todaySchedule.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                  No appointments scheduled for today.
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySchedule.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white">
                          {formatTime(item.appointmentDate)}
                        </div>

                        <div>
                          <h3 className="text-base font-semibold">
                            {item.customer
                              ? `${item.customer.firstName} ${item.customer.lastName}`
                              : "Client not available"}
                          </h3>
                          <p className="mt-1 text-sm text-gray-400">
                            {item.reason || "Appointment"}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200">
                        <CircleDot
                          size={12}
                          className={
                            item.status === "CONFIRMED"
                              ? "text-emerald-400"
                              : item.status === "PENDING"
                              ? "text-amber-400"
                              : item.status === "COMPLETED"
                              ? "text-blue-400"
                              : "text-red-400"
                          }
                        />
                        {formatStatus(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Common provider tasks for managing assigned appointments.
                  </p>
                </div>

                <div className="space-y-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <Link
                        key={action.title}
                        to={action.to}
                        className="group block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white sm:text-base">
                              {action.title}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-gray-400">
                              {action.description}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-300">
                              Open
                              <ArrowRight
                                size={16}
                                className="transition group-hover:translate-x-1"
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Pending Requests
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Appointment requests assigned to you that need confirmation.
                  </p>
                </div>

                {loadingAppointments ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                    Loading pending requests...
                  </div>
                ) : nextPendingRequests.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                    No pending requests right now.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nextPendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                            <Bell size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-white sm:text-base">
                              {request.customer
                                ? `${request.customer.firstName} ${request.customer.lastName}`
                                : "Client not available"}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-gray-400">
                              Requested {request.reason || "an appointment"} for{" "}
                              {formatDateTime(request.appointmentDate)}.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => handleConfirm(request)}
                                disabled={confirmingId === request.id}
                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <CheckCircle2 size={16} />
                                {confirmingId === request.id
                                  ? "Confirming..."
                                  : "Confirm Appointment"}
                              </button>

                              <Link
                                to="/appointments?filter=pending"
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                              >
                                View pending
                                <ArrowRight size={16} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Account Summary
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Your provider and contact information at a glance.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <UserRound size={18} className="mt-0.5 shrink-0 text-gray-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                        Provider Name
                      </p>
                      <p className="mt-1 text-sm font-medium leading-6 text-white sm:text-base">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-gray-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                        Email Address
                      </p>
                      <p className="mt-1 break-words text-sm font-medium leading-6 text-white sm:text-base">
                        {currentUser.email || "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-gray-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                        Phone Number
                      </p>
                      <p className="mt-1 break-words text-sm font-medium leading-6 text-white sm:text-base">
                        {currentUser.phoneNumber || "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-300"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-medium leading-6 text-white sm:text-base">
                        {currentUser.enabled ? "Active account" : "Disabled account"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Provider Overview
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Live appointment data for your provider account.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  to="/appointments"
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <h3 className="text-base font-semibold">Assigned Upcoming</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {loadingAppointments ? "..." : upcomingAssignedAppointments.length}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Future appointments currently assigned to you.
                  </p>
                </Link>

                <Link
                  to="/appointments?filter=pending"
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <h3 className="text-base font-semibold">Awaiting Confirmation</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {loadingAppointments ? "..." : pendingRequests.length}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Pending requests that still need your approval.
                  </p>
                </Link>

                <Link
                  to="/appointments?filter=confirmed"
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <h3 className="text-base font-semibold">Confirmed Upcoming</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {loadingAppointments ? "..." : confirmedUpcomingAppointments.length}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Upcoming appointments you have already confirmed.
                  </p>
                </Link>

                <Link
                  to="/appointments?filter=completed"
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <h3 className="text-base font-semibold">Completed This Week</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {loadingAppointments ? "..." : completedThisWeek.length}
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Appointments completed by you this week.
                  </p>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}