import { Link } from "react-router-dom";
import { useDataContext } from "@data/Context";
import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "@/data/v";
import {
  User,
  CalendarDays,
  Clock3,
  Settings,
  Mail,
  Phone,
  BadgeCheck,
  ArrowRight,
  Bell,
  ClipboardList,
  Activity,
  Sparkles,
  ShieldCheck,
  CircleDot,
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
    role: String(raw?.role ?? "CUSTOMER") as Role,
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

function isUpcoming(dateString?: string) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() >= Date.now();
}

function formatDateTime(value?: string) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

export default function CustomerDashboard() {
  const { user } = useDataContext();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState("");

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

        const customerAppointments = normalized
          .filter((appointment) => appointment.customer?.id === currentUser.id)
          .sort(
            (a, b) =>
              new Date(a.appointmentDate).getTime() -
              new Date(b.appointmentDate).getTime()
          );

        setAppointments(customerAppointments);
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

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        isUpcoming(appointment.appointmentDate) &&
        appointment.status !== "CANCELLED" &&
        appointment.status !== "COMPLETED"
    );
  }, [appointments]);

  const pendingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "PENDING"
    );
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "COMPLETED"
    );
  }, [appointments]);

  const recentActivityCount = appointments.length;
  const nextAppointment = upcomingAppointments[0] ?? null;
  const notificationsCount = pendingAppointments.length;

  if (!currentUser) return null;

  const stats: StatItem[] = [
    {
      label: "Account Status",
      value: currentUser.enabled ? "Active" : "Disabled",
      icon: BadgeCheck,
    },
    {
      label: "Upcoming Visits",
      value: loadingAppointments ? "..." : String(upcomingAppointments.length),
      icon: CalendarDays,
      path: "/appointments",
    },
    {
      label: "Pending Requests",
      value: loadingAppointments ? "..." : String(pendingAppointments.length),
      icon: Clock3,
      path: "/appointments?filter=pending",
    },
    {
      label: "Notifications",
      value: loadingAppointments ? "..." : String(notificationsCount),
      icon: Bell,
      path: "/notifications",
    },
  ];

  const actions = [
    {
      title: "Book Appointment",
      description:
        "Schedule a new visit with your preferred provider in just a few steps.",
      icon: CalendarDays,
      path: "/appointments/new",
    },
    {
      title: "View Upcoming Visits",
      description:
        "Review your next bookings, confirmations, and pending schedule updates.",
      icon: Clock3,
      path: "/appointments",
    },
    {
      title: "Manage Account",
      description:
        "Update your profile, contact details, and personal preferences.",
      icon: Settings,
      path: "/account",
    },
  ];

  const liveModules = [
    {
      title: "Appointments Overview",
      description: loadingAppointments
        ? "Loading your appointment summary..."
        : `You currently have ${appointments.length} total appointment${
            appointments.length === 1 ? "" : "s"
          }, with ${upcomingAppointments.length} upcoming.`,
      icon: ClipboardList,
    },
    {
      title: "Notifications Center",
      description: loadingAppointments
        ? "Loading your notifications..."
        : `You have ${notificationsCount} notification${
            notificationsCount === 1 ? "" : "s"
          } based on pending appointment activity.`,
      icon: Bell,
    },
    {
      title: "Recent Activity",
      description: loadingAppointments
        ? "Loading recent activity..."
        : `Your account has ${recentActivityCount} tracked appointment activit${
            recentActivityCount === 1 ? "y" : "ies"
          } right now.`,
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_right,_rgba(168,85,247,0.14),_transparent_28%),linear-gradient(to_bottom,_#050816,_#0b1120,_#111827)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.2fr_0.8fr] xl:p-8">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                <Sparkles size={14} />
                Customer Workspace
              </div>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/20 shadow-lg">
                  <User size={34} className="text-white" />
                </div>

                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                    Welcome back, {currentUser.firstName}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                    Manage your appointments, review profile details, and keep track
                    of everything happening in your account from one place.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200">
                      <ShieldCheck size={14} className="text-emerald-300" />
                      Secure account
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200">
                      <CircleDot size={12} className="text-emerald-400" />
                      {currentUser.enabled ? "Profile active" : "Profile disabled"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <h2 className="text-base font-semibold sm:text-lg">Profile Summary</h2>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Full Name
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-white sm:text-base">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Email Address
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-white">
                      {currentUser.email || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Phone Number
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-white">
                      {currentUser.phoneNumber || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {appointmentsError && (
          <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="flex items-start gap-3 text-sm text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{appointmentsError}</span>
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm leading-5 text-gray-400">{stat.label}</span>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                  {stat.value}
                </p>
                {stat.path && (
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-400">
                    <span>Open</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </>
            );

            if (stat.path) {
              return (
                <Link
                  key={stat.label}
                  to={stat.path}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl"
              >
                {content}
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Quick Actions
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Fast access to the tools you use most.
                </p>
              </div>

              <div className="w-fit rounded-2xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
                Personalized
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {actions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    to={action.path}
                    className="group rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-4 text-base font-semibold sm:text-lg">
                      {action.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      {action.description}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-400">
                      <span>Open</span>
                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Account Snapshot
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              A clean overview of your current profile details.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  <User size={18} className="mt-0.5 shrink-0 text-gray-300" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:text-xs">
                      Full Name
                    </p>
                    <p className="mt-1 break-words text-sm font-medium leading-6 sm:text-base">
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-gray-300" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:text-xs">
                      Email
                    </p>
                    <p className="mt-1 break-words text-sm font-medium leading-6 sm:text-base">
                      {currentUser.email || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-gray-300" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:text-xs">
                      Phone
                    </p>
                    <p className="mt-1 break-words text-sm font-medium leading-6 sm:text-base">
                      {currentUser.phoneNumber || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/account"
                className="block rounded-2xl border border-white/10 bg-blue-500/10 p-4 text-sm font-medium text-blue-300 transition hover:bg-blue-500/15"
              >
                View full account settings
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Appointment Snapshot
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Live appointment information from your account.
              </p>
            </div>

            {loadingAppointments ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                Loading appointments...
              </div>
            ) : nextAppointment ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-start gap-3">
                    <CalendarDays size={18} className="mt-0.5 shrink-0 text-blue-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                        Next Appointment
                      </p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {nextAppointment.reason || "Scheduled Appointment"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {formatDateTime(nextAppointment.appointmentDate)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        Provider:{" "}
                        {nextAppointment.provider
                          ? `${nextAppointment.provider.firstName} ${nextAppointment.provider.lastName}`
                          : "Not assigned"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        Status: {formatStatus(nextAppointment.status)}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/appointments"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-400"
                >
                  <span>View all appointments</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-gray-300">
                No upcoming appointments found.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Live Account Activity
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Dynamic account and booking information.
              </p>
            </div>

            <div className="grid gap-5">
              {liveModules.map((module) => {
                const Icon = module.icon;

                return (
                  <div
                    key={module.title}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                        <Icon size={18} />
                      </div>
                      <h3 className="text-base font-semibold sm:text-lg">
                        {module.title}
                      </h3>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-400">
                      {module.description}
                    </p>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
                  <div>
                    <h3 className="text-base font-semibold sm:text-lg">
                      Completed Appointments
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-gray-400">
                      You have completed {completedAppointments.length} appointment
                      {completedAppointments.length === 1 ? "" : "s"}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}