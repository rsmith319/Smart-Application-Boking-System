import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "@/data/v";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  User,
  ClipboardList,
  CircleAlert,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useDataContext } from "@data/Context";

type Role = "ADMIN" | "CUSTOMER" | "PROVIDER" | "STAFF";
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type AppUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  enabled: boolean;
};

type Appointment = {
  id: string;
  appointmentDate: string;
  reason: string;
  status: AppointmentStatus;
  customer: AppUser;
  provider: AppUser;
  createdAt?: string;
  updatedAt?: string;
};

// const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.wittyground-e489ec01.westus2.azurecontainerapps.io/api/v1";

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function isUpcoming(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() >= Date.now();
}

function statusClasses(status: AppointmentStatus) {
  switch (status) {
    case "CONFIRMED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "CANCELLED":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "COMPLETED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    default:
      return "border-white/10 bg-white/10 text-gray-300";
  }
}

function StatusIcon({ status }: { status: AppointmentStatus }) {
  switch (status) {
    case "CONFIRMED":
      return <CheckCircle2 size={15} />;
    case "PENDING":
      return <Clock3 size={15} />;
    case "CANCELLED":
      return <XCircle size={15} />;
    case "COMPLETED":
      return <ClipboardList size={15} />;
    default:
      return <CircleAlert size={15} />;
  }
}

export default function ViewAppointments() {
  const { user } = useDataContext();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${BASE_URL}/appointments`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load appointments");
        }

        const data: Appointment[] = await res.json();

        const customerAppointments = data.filter(
          (appointment) => appointment.customer?.id === user.id
        );

        customerAppointments.sort(
          (a, b) =>
            new Date(a.appointmentDate).getTime() -
            new Date(b.appointmentDate).getTime()
        );

        setAppointments(customerAppointments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user?.id]);

  const upcomingAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        isUpcoming(appointment.appointmentDate) &&
        appointment.status !== "CANCELLED" &&
        appointment.status !== "COMPLETED"
    );
  }, [appointments]);

  const appointmentHistory = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        !isUpcoming(appointment.appointmentDate) ||
        appointment.status === "CANCELLED" ||
        appointment.status === "COMPLETED"
    );
  }, [appointments]);

  const visibleAppointments =
    activeTab === "upcoming" ? upcomingAppointments : appointmentHistory;

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "PENDING"
  ).length;
  const confirmedAppointments = appointments.filter(
    (appointment) => appointment.status === "CONFIRMED"
  ).length;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_right,_rgba(168,85,247,0.14),_transparent_28%),linear-gradient(to_bottom,_#050816,_#0b1120,_#111827)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                <CalendarDays size={14} />
                My Appointments
              </div>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                View Your Appointments
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                Review your upcoming bookings, check previous appointments, and
                keep track of your current booking status.
              </p>
            </div>

            <Link
              to="/appointments/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-300 transition hover:bg-blue-500/15"
            >
              <span>Book Appointment</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm text-gray-400">Total Appointments</span>
              <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                <ClipboardList size={18} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight">
              {totalAppointments}
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
              {upcomingAppointments.length}
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
              {pendingAppointments}
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
              {confirmedAppointments}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Appointment List
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Switch between upcoming appointments and appointment history.
              </p>
            </div>

            <div className="inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("upcoming")}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  activeTab === "upcoming"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  activeTab === "history"
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                History
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-gray-300">
              Loading appointments...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-300">
              {error}
            </div>
          ) : visibleAppointments.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-6">
              <p className="text-sm text-gray-300">
                {activeTab === "upcoming"
                  ? "You do not have any upcoming appointments yet."
                  : "No appointment history found."}
              </p>

              {activeTab === "upcoming" && (
                <Link
                  to="/appointments/new"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-400"
                >
                  <span>Book your first appointment</span>
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {visibleAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {appointment.reason}
                        </h3>

                        <div
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusClasses(
                            appointment.status
                          )}`}
                        >
                          <StatusIcon status={appointment.status} />
                          {appointment.status}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                            <User
                              size={18}
                              className="mt-0.5 shrink-0 text-gray-300"
                            />
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                                Provider
                              </p>
                              <p className="mt-1 text-sm font-medium text-white sm:text-base">
                                {appointment.provider
                                  ? `${appointment.provider.firstName} ${appointment.provider.lastName}`
                                  : "Not assigned"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                          Booking ID
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
        </section>
      </div>
    </div>
  );
}