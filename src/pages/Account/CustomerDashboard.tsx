import { Link } from "react-router-dom";
import { useDataContext } from "@data/Context";
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
} from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useDataContext();

  if (!user) return null;

  const stats = [
    {
      label: "Account Status",
      value: user.enabled ? "Active" : "Disabled",
      icon: BadgeCheck,
    },
    {
      label: "Upcoming Visits",
      value: "03",
      icon: CalendarDays,
    },
    {
      label: "Pending Requests",
      value: "01",
      icon: Clock3,
    },
    {
      label: "Notifications",
      value: "05",
      icon: Bell,
    },
  ];

  const actions = [
    {
      title: "Book Appointment",
      description: "Schedule a new visit with your preferred provider in just a few steps.",
      icon: CalendarDays,
      path: "/appointments/new",
    },
    {
      title: "View Upcoming Visits",
      description: "Review your next bookings, confirmations, and pending schedule updates.",
      icon: Clock3,
      path: "/appointments",
    },
    {
      title: "Manage Account",
      description: "Update your profile, contact details, and personal preferences.",
      icon: Settings,
      path: "/account",
    },
  ];

  const modules = [
    {
      title: "Appointments Overview",
      description:
        "Track confirmed, pending, and completed appointments with a cleaner booking workflow.",
      icon: ClipboardList,
    },
    {
      title: "Notifications Center",
      description:
        "Stay updated with reminders, booking confirmations, and account activity alerts.",
      icon: Bell,
    },
    {
      title: "Recent Activity",
      description:
        "View your latest booking actions, account edits, and service-related updates.",
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
                    Welcome back, {user.firstName}
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
                      {user.enabled ? "Profile active" : "Profile disabled"}
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
                      {user.firstName} {user.lastName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Email Address
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-white">
                      {user.email || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Phone Number
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-white">
                      {user.phoneNumber || "Not available"}
                    </p>
                  </div>
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
                className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm leading-5 text-gray-400">{stat.label}</span>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                  {stat.value}
                </p>
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
                      {user.firstName} {user.lastName}
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
                      {user.email || "Not available"}
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
                      {user.phoneNumber || "Not available"}
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

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Customer Workspace
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Content-rich panels ready to connect to live appointment and account data.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
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
          </div>
        </section>
      </div>
    </div>
  );
}