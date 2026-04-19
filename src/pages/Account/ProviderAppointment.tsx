import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDataContext } from "@data/Context";
import { BASE_URL } from "@/data/v";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  Circle,
  ClipboardList,
  ArrowRight,
  AlertCircle,
  Bell,
  UserRound,
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

function formatDateTime(value?: string) {
  if (!value || !isValidDate(value)) return "Not scheduled";

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
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

function getStatusClasses(status: AppointmentStatus) {
  switch (status) {
    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "CONFIRMED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "CANCELLED":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "COMPLETED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    default:
      return "border-white/10 bg-white/10 text-gray-300";
  }
}

export default function ProviderAppointmentsPage() {
  const { user } = useDataContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [confirmingId, setConfirmingId] = useState("");

  const currentUser = useMemo(
    () => (user ? normalizeUser(user as LegacyUser) : null),
    [user]
  );

  const activeFilter = searchParams.get("filter") ?? "all";

  useEffect(() => {
    const loadAppointments = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setActionMessage("");

        const res = await fetch(`${BASE_URL}/appointments`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load provider appointments");
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
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load provider appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [currentUser?.id]);

  const pendingAppointments = useMemo(() => {
    return appointments.filter((appointment) => appointment.status === "PENDING");
  }, [appointments]);

  const confirmedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "CONFIRMED"
    );
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "COMPLETED"
    );
  }, [appointments]);

  const cancelledAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "CANCELLED"
    );
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        isUpcoming(appointment.appointmentDate) &&
        appointment.status !== "CANCELLED" &&
        appointment.status !== "COMPLETED"
    );
  }, [appointments]);

  const todaysAppointments = useMemo(() => {
    return appointments.filter((appointment) =>
      isToday(appointment.appointmentDate)
    );
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
    switch (activeFilter) {
      case "pending":
        return pendingAppointments;
      case "confirmed":
        return confirmedAppointments;
      case "completed":
        return completedAppointments;
      case "cancelled":
        return cancelledAppointments;
      case "today":
        return todaysAppointments;
      case "upcoming":
        return upcomingAppointments;
      default:
        return appointments;
    }
  }, [
    activeFilter,
    appointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    todaysAppointments,
    upcomingAppointments,
  ]);

  const handleConfirm = async (appointment: Appointment) => {
    try {
      setConfirmingId(appointment.id);
      setError("");
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
      setError(
        err instanceof Error ? err.message : "Failed to confirm appointment"
      );
    } finally {
      setConfirmingId("");
    }
  };

  if (!currentUser) return null;

  const filterButtons = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,_#081120,_#0b1324,_#111827)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                  <ClipboardList size={14} />
                  Provider Appointments
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Assigned Appointments
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                  Review appointments assigned to you, confirm pending requests,
                  and track appointment status from one page.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/provider"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  <ArrowRight size={16} />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </section>

          {(error || actionMessage) && (
            <section
              className={`rounded-3xl p-5 shadow-xl backdrop-blur-xl sm:p-6 ${
                error
                  ? "border border-red-500/20 bg-red-500/10"
                  : "border border-emerald-500/20 bg-emerald-500/10"
              }`}
            >
              <div
                className={`flex items-start gap-3 text-sm ${
                  error ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {error ? (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                )}
                <span>{error || actionMessage}</span>
              </div>
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-gray-400">All Assigned</span>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <ClipboardList size={18} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {loading ? "..." : appointments.length}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-gray-400">Upcoming</span>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <CalendarDays size={18} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {loading ? "..." : upcomingAppointments.length}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-gray-400">Pending</span>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <Clock3 size={18} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {loading ? "..." : pendingAppointments.length}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-gray-400">Confirmed</span>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {loading ? "..." : confirmedAppointments.length}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm text-gray-400">Today</span>
                <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                  <Bell size={18} />
                </div>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight">
                {loading ? "..." : todaysAppointments.length}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Appointment Filters
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Switch between appointment states assigned to you.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {filterButtons.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setSearchParams({ filter: filter.key })}
                    className={`rounded-2xl px-4 py-2 text-sm transition ${
                      activeFilter === filter.key
                        ? "bg-cyan-500 text-white"
                        : "border border-white/10 bg-white/10 text-gray-200 hover:bg-white/15"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Appointment List
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Showing provider appointments for the selected filter.
                </p>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                  Loading appointments...
                </div>
              ) : visibleAppointments.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                  No appointments found for this filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-semibold sm:text-lg">
                              {appointment.reason || "Appointment"}
                            </h3>

                            <div
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                                appointment.status
                              )}`}
                            >
                              <Circle size={12} />
                              {formatStatus(appointment.status)}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-start gap-3">
                                <CalendarDays
                                  size={18}
                                  className="mt-0.5 shrink-0 text-gray-300"
                                />
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                                    Appointment Date
                                  </p>
                                  <p className="mt-1 text-sm font-medium text-white sm:text-base">
                                    {formatDateTime(appointment.appointmentDate)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-start gap-3">
                                <UserRound
                                  size={18}
                                  className="mt-0.5 shrink-0 text-gray-300"
                                />
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                                    Customer
                                  </p>
                                  <p className="mt-1 text-sm font-medium text-white sm:text-base">
                                    {appointment.customer
                                      ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                                      : "Customer not available"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {appointment.status === "PENDING" && (
                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => handleConfirm(appointment)}
                                disabled={confirmingId === appointment.id}
                                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <CheckCircle2 size={16} />
                                {confirmingId === appointment.id
                                  ? "Confirming..."
                                  : "Confirm Appointment"}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="w-full lg:w-auto">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                              Appointment ID
                            </p>
                            <p className="mt-2 break-all text-sm text-gray-300">
                              {appointment.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
                <h2 className="text-xl font-semibold tracking-tight">
                  Provider Summary
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Your provider account and workload at a glance.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                      Provider Name
                    </p>
                    <p className="mt-2 text-sm font-medium text-white sm:text-base">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                      Email
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-white">
                      {currentUser.email || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                      Account Status
                    </p>
                    <p className="mt-2 text-sm font-medium text-white sm:text-base">
                      {currentUser.enabled ? "Active" : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
                <h2 className="text-xl font-semibold tracking-tight">
                  Quick Links
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Common provider actions.
                </p>

                <div className="mt-6 space-y-4">
                  <Link
                    to="/provider"
                    className="group block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                        <ClipboardList size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white sm:text-base">
                          Provider Dashboard
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-gray-400">
                          Return to your provider dashboard overview.
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

                  <Link
                    to="/appointments?filter=pending"
                    className="group block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                        <Clock3 size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white sm:text-base">
                          Pending Requests
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-gray-400">
                          Review pending requests from the general appointments page.
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

                  <Link
                    to="/account"
                    className="group block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                        <UserRound size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-white sm:text-base">
                          Manage Account
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-gray-400">
                          Update your provider profile and contact details.
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
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}