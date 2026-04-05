import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDataContext } from "@data/Context";
import {
  User,
  Shield,
  Wrench,
  CalendarDays,
  Mail,
  Phone,
  BadgeCheck,
  Activity,
  Clock3,
  ClipboardList,
  Settings,
  Bell,
  ChartColumn,
  Users,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type DashboardStat = {
  label: string;
  value: string;
  icon: React.ElementType;
};

type DashboardAction = {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
};

type DashboardSection = {
  title: string;
  description: string;
  icon: React.ElementType;
};

export default function Profile() {
  const { user } = useDataContext();

  const roleConfig = useMemo(() => {
    if (!user) return null;

    const commonStats: DashboardStat[] = [
      {
        label: "Account Status",
        value: user.enabled ? "Active" : "Disabled",
        icon: BadgeCheck,
      },
      {
        label: "Email",
        value: user.email || "Not available",
        icon: Mail,
      },
      {
        label: "Phone",
        value: user.phoneNumber || "Not available",
        icon: Phone,
      },
    ];

    if (user.role === "CUSTOMER") {
      return {
        heading: `${user.firstName}'s Dashboard`,
        subheading:
          "Manage appointments, review your account details, and stay on top of upcoming activity.",
        accentIcon: User,
        stats: [
          ...commonStats,
          {
            label: "Upcoming Visits",
            value: "03",
            icon: CalendarDays,
          },
        ],
        actions: [
          {
            title: "Book Appointment",
            description: "Schedule a new service with your preferred provider.",
            icon: CalendarDays,
            path: "/appointments/new",
          },
          {
            title: "View Upcoming Visits",
            description: "See your next confirmed and pending appointments.",
            icon: Clock3,
            path: "/appointments",
          },
          {
            title: "Manage Account",
            description: "Update personal information and communication details.",
            icon: Settings,
            path: "/account",
          },
        ],
        sections: [
          {
            title: "Appointments Overview",
            description:
              "Track pending, confirmed, and completed appointments in one place.",
            icon: ClipboardList,
          },
          {
            title: "Notifications",
            description:
              "Stay informed about schedule updates, reminders, and confirmations.",
            icon: Bell,
          },
          {
            title: "Activity Timeline",
            description:
              "Review your latest bookings, account changes, and service updates.",
            icon: Activity,
          },
        ],
      };
    }

    if (user.role === "PROVIDER") {
      return {
        heading: "Provider Dashboard",
        subheading:
          "Monitor bookings, manage availability, and keep your service workflow organized.",
        accentIcon: Wrench,
        stats: [
          ...commonStats,
          {
            label: "Today’s Queue",
            value: "08",
            icon: Users,
          },
        ],
        actions: [
          {
            title: "Manage Availability",
            description: "Set open hours and keep your booking calendar updated.",
            icon: Clock3,
            path: "/provider/availability",
          },
          {
            title: "Review Bookings",
            description: "Handle new requests, confirmations, and cancellations.",
            icon: ClipboardList,
            path: "/provider/appointments",
          },
          {
            title: "Performance Snapshot",
            description: "See a quick overview of bookings and customer activity.",
            icon: ChartColumn,
            path: "/provider/analytics",
          },
        ],
        sections: [
          {
            title: "Service Queue",
            description:
              "View customers waiting for service and prioritize your workflow.",
            icon: Users,
          },
          {
            title: "Provider Insights",
            description:
              "Track appointment volume, demand trends, and service performance.",
            icon: Activity,
          },
          {
            title: "Operational Tools",
            description:
              "Access availability settings, notes, and service management controls.",
            icon: Settings,
          },
        ],
      };
    }

    if (user.role === "ADMIN") {
      return {
        heading: "Admin Dashboard",
        subheading:
          "Oversee users, appointments, and platform operations from a central control hub.",
        accentIcon: Shield,
        stats: [
          ...commonStats,
          {
            label: "Total Managed Users",
            value: "124",
            icon: Users,
          },
        ],
        actions: [
          {
            title: "User Administration",
            description: "Review, edit, and manage customer and provider accounts.",
            icon: Users,
            path: "/admin/users",
          },
          {
            title: "System Monitoring",
            description: "Keep track of platform health, activity, and operations.",
            icon: Activity,
            path: "/admin/system",
          },
          {
            title: "Reports & Records",
            description: "Review usage summaries, appointment trends, and system data.",
            icon: FileText,
            path: "/admin/reports",
          },
        ],
        sections: [
          {
            title: "User Management",
            description:
              "Maintain account integrity and manage access across the platform.",
            icon: Shield,
          },
          {
            title: "System Control Center",
            description:
              "Monitor backend activity, booking flow, and operational consistency.",
            icon: Settings,
          },
          {
            title: "Analytics & Reporting",
            description:
              "Generate deeper insights into usage, appointments, and performance.",
            icon: ChartColumn,
          },
        ],
      };
    }

    return {
      heading: "Profile Dashboard",
      subheading: "Your account is active, but this role is not yet configured.",
      accentIcon: Sparkles,
      stats: commonStats,
      actions: [],
      sections: [],
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[70vh] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur sm:p-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <User size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">You’re not signed in</h1>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Sign in to access your dashboard, appointments, and account tools.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const AccentIcon = roleConfig?.accentIcon ?? Sparkles;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-black via-gray-950 to-gray-900 px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%)]" />
            <div className="relative grid gap-6 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.4fr_0.8fr] lg:gap-8 lg:px-8 lg:py-10">
              <div className="min-w-0">
                <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[11px] font-medium tracking-wide text-gray-200 sm:px-4 sm:text-xs">
                  <Sparkles size={13} className="shrink-0" />
                  <span className="truncate">Premium Workspace</span>
                </div>

                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg sm:h-16 sm:w-16">
                    <AccentIcon size={24} className="sm:hidden" />
                    <AccentIcon size={28} className="hidden sm:block" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                      {roleConfig?.heading}
                    </h1>
                    <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-gray-300 md:text-[15px]">
                      {roleConfig?.subheading}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Account Holder
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold sm:text-base">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Role
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold sm:text-base">
                      {user.role}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 sm:col-span-2 xl:col-span-1">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Status
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold sm:text-base">
                      {user.enabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-3xl border border-white/10 bg-black/30 p-5 sm:p-6">
                <h2 className="text-base font-semibold sm:text-lg">Profile Summary</h2>
                <div className="mt-5 space-y-4">
                  <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Email Address
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-white">
                      {user.email || "Not available"}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Phone Number
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-white">
                      {user.phoneNumber || "Not available"}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Quick Note
                    </p>
                    <p className="mt-2 break-words text-sm leading-6 text-gray-300">
                      This dashboard can be expanded with live appointment data,
                      notifications, analytics, and role-based actions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {roleConfig?.stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="min-w-0 break-words text-sm leading-5 text-gray-400">
                    {stat.label}
                  </span>
                  <div className="shrink-0 rounded-xl border border-white/10 bg-white/10 p-2">
                    <Icon size={18} />
                  </div>
                </div>
                <p className="mt-4 break-words text-lg font-bold leading-7 sm:text-xl">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold sm:text-2xl">Quick Actions</h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Important tools and shortcuts tailored to your role.
                </p>
              </div>
              <div className="w-fit rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-gray-300">
                Personalized
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roleConfig?.actions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    to={action.path}
                    className="group min-w-0 rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-4 break-words text-base font-semibold sm:text-lg">
                      {action.title}
                    </h3>

                    <p className="mt-2 break-words text-sm leading-6 text-gray-400">
                      {action.description}
                    </p>

                    <div className="mt-5 inline-flex max-w-full items-center gap-2 break-words text-sm font-medium text-blue-400">
                      <span>Open</span>
                      <ArrowRight
                        size={16}
                        className="shrink-0 transition group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur sm:p-6">
            <h2 className="text-xl font-semibold sm:text-2xl">Account Snapshot</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              A compact overview of your current profile details.
            </p>

            <div className="mt-6 space-y-4">
              <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex min-w-0 items-start gap-3">
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

              <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex min-w-0 items-start gap-3">
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

              <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex min-w-0 items-start gap-3">
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

              <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Shield size={18} className="mt-0.5 shrink-0 text-gray-300" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:text-xs">
                      Access Role
                    </p>
                    <p className="mt-1 break-words text-sm font-medium leading-6 sm:text-base">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/account"
                className="block rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-medium text-blue-400 transition hover:bg-white/[0.14]"
              >
                View full account settings
              </Link>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur sm:p-6">
          <div className="mb-6 min-w-0">
            <h2 className="text-xl font-semibold sm:text-2xl">Workspace Modules</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Content-rich panels that can later be connected to live backend data.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {roleConfig?.sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 rounded-xl border border-white/10 bg-white/10 p-2">
                      <Icon size={18} />
                    </div>
                    <h3 className="min-w-0 break-words text-base font-semibold sm:text-lg">
                      {section.title}
                    </h3>
                  </div>
                  <p className="mt-4 break-words text-sm leading-6 text-gray-400">
                    {section.description}
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