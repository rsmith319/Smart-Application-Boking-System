import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDataContext } from "@data/Context";
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
  Plus,
  ClipboardList,
  CircleDot,
  Settings,
  CheckCircle2,
} from "lucide-react";

export default function ProviderDashboard() {
  const { user } = useDataContext();

  if (!user) return null;

  const stats = useMemo(
    () => [
      {
        label: "Today's Bookings",
        value: "6",
        icon: CalendarDays,
      },
      {
        label: "Pending Requests",
        value: "3",
        icon: Clock3,
      },
      {
        label: "Active Clients",
        value: "18",
        icon: UserRound,
      },
      {
        label: "Account Status",
        value: user.enabled ? "Active" : "Disabled",
        icon: BadgeCheck,
      },
    ],
    [user.enabled]
  );

  const quickActions = [
    {
      title: "Manage Availability",
      description:
        "Set your working hours, booking slots, and general availability.",
      icon: CalendarDays,
      to: "/provider/availability",
    },
    {
      title: "View Appointments",
      description:
        "See all upcoming and past bookings in one organized place.",
      icon: ClipboardList,
      to: "/appointments",
    },
    {
      title: "Update Business Profile",
      description:
        "Edit your business details, service information, and contact info.",
      icon: Settings,
      to: "/account",
    },
  ];

  const todaySchedule = [
    {
      time: "9:00 AM",
      name: "Alicia Brown",
      service: "Consultation Session",
      status: "Confirmed",
    },
    {
      time: "11:30 AM",
      name: "Jason Wright",
      service: "Follow-up Appointment",
      status: "Pending",
    },
    {
      time: "2:00 PM",
      name: "Monique Ellis",
      service: "Initial Assessment",
      status: "Confirmed",
    },
    {
      time: "4:15 PM",
      name: "David Clarke",
      service: "Service Review",
      status: "Confirmed",
    },
  ];

  const requests = [
    {
      name: "Sarah Thompson",
      text: "Requested a booking for Friday at 1:00 PM.",
    },
    {
      name: "Kevin Richards",
      text: "Sent a follow-up inquiry about service availability.",
    },
    {
      name: "Natalie James",
      text: "Asked to reschedule an upcoming appointment.",
    },
  ];

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
                  Welcome, {user.firstName}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                  Manage your appointments, review booking activity, and keep your
                  business profile updated from one professional workspace.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/appointments"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-400"
                  >
                    <CalendarDays size={16} />
                    View Bookings
                  </Link>

                  <Link
                    to="/provider/availability"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    <Plus size={16} />
                    Update Availability
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
                      {user.firstName} {user.lastName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      Email
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-white">
                      {user.email || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      Phone
                    </p>
                    <p className="mt-2 break-words text-sm font-medium text-white">
                      {user.phoneNumber || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm text-gray-400">{stat.label}</span>
                    <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="mt-4 text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
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
                    Your upcoming provider appointments for today.
                  </p>
                </div>

                <Link
                  to="/appointments"
                  className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15 sm:inline-flex"
                >
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="space-y-4">
                {todaySchedule.map((item) => (
                  <div
                    key={`${item.time}-${item.name}`}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white">
                        {item.time}
                      </div>

                      <div>
                        <h3 className="text-base font-semibold">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-400">{item.service}</p>
                      </div>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200">
                      <CircleDot
                        size={12}
                        className={
                          item.status === "Confirmed"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }
                      />
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Common tasks for managing your bookings.
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
                    Recent Requests
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Recent booking-related activity from clients.
                  </p>
                </div>

                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.name}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                          <Bell size={16} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white sm:text-base">
                            {request.name}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-gray-400">
                            {request.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Account Summary
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Your business and contact information at a glance.
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
                        {user.firstName} {user.lastName}
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
                        {user.email || "Not available"}
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
                        {user.phoneNumber || "Not available"}
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
                        {user.enabled ? "Active account" : "Disabled account"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Booking Overview
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  A clean provider-facing section for recent and upcoming booking flow.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-base font-semibold">Upcoming Bookings</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">12</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Scheduled appointments currently on your calendar.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-base font-semibold">New Requests</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">4</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Client requests awaiting your response.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-base font-semibold">Completed This Week</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">9</p>
                  <p className="mt-2 text-sm text-gray-400">
                    Appointments successfully completed this week.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <h3 className="text-base font-semibold">Availability Status</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">Open</p>
                  <p className="mt-2 text-sm text-gray-400">
                    You are currently accepting new bookings.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}