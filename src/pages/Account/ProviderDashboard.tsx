import { useEffect, useMemo, useState, type ComponentType } from "react";
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
  XCircle,
} from "lucide-react";

type Role = "ADMIN" | "CUSTOMER" | "PROVIDER" | "STAFF";
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type AppUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  enabled: boolean;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

type Appointment = {
  id: string;
  appointmentDate: string;
  reason: string;
  status: AppointmentStatus;
  customer: AppUser | null;
  provider: AppUser | null;
};

type StatItem = {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number }>;
  path?: string;
};

function normalizeUser(raw: Partial<AppUser> | null | undefined): AppUser {
  return {
    id: String(raw?.id ?? ""),
    firstName: String(raw?.firstName ?? ""),
    lastName: String(raw?.lastName ?? ""),
    email: String(raw?.email ?? ""),
    phoneNumber: raw?.phoneNumber ?? "",
    enabled: Boolean(raw?.enabled),
    role: (raw?.role as Role) ?? "PROVIDER",
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

function normalizeAppointment(raw: any): Appointment {
  return {
    id: String(raw.id),
    appointmentDate: String(raw.appointmentDate),
    reason: String(raw.reason),
    status: raw.status,
    customer: raw.customer ? normalizeUser(raw.customer) : null,
    provider: raw.provider ? normalizeUser(raw.provider) : null,
  };
}

function isToday(date: string) {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isUpcoming(date: string) {
  return new Date(date).getTime() >= Date.now();
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeStyle: "short",
  }).format(new Date(date));
}

function formatStatus(status: AppointmentStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

async function parseError(res: Response) {
  try {
    const data = await res.json();
    return data.message || "Request failed";
  } catch {
    return "Request failed";
  }
}

export default function ProviderDashboard() {
  const { user } = useDataContext();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const currentUser = useMemo(
    () => (user ? normalizeUser(user as unknown as Partial<AppUser>) : null),
    [user]
  );

  useEffect(() => {
    const load = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);

        const res = await fetch(`${BASE_URL}/appointments`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error(await parseError(res));

        const data = await res.json();

        const providerAppointments = data
          .map(normalizeAppointment)
          .filter((a: Appointment) => a.provider?.id === currentUser.id);

        setAppointments(providerAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser?.id]);

  const pending = appointments.filter((a) => a.status === "PENDING");
  const today = appointments.filter((a) => isToday(a.appointmentDate));

  const updateStatus = async (id: string, status: "CONFIRMED" | "CANCELLED") => {
    try {
      setActionLoadingId(id);

      const res = await fetch(`${BASE_URL}/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error(await parseError(res));

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setActionLoadingId("");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen text-white p-6">
      <h1 className="text-3xl mb-6">Welcome, {currentUser.firstName}</h1>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Stat label="Today" value={String(today.length)} icon={CalendarDays} />
        <Stat label="Pending" value={String(pending.length)} icon={Clock3} />
        <Stat
          label="Total"
          value={String(appointments.length)}
          icon={ClipboardList}
        />
      </div>

      <div>
        <h2 className="text-xl mb-4">Pending Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : pending.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          pending.map((a) => (
            <div key={a.id} className="border p-4 mb-3 rounded">
              <p>
                {a.customer?.firstName} {a.customer?.lastName}
              </p>
              <p>{a.reason}</p>
              <p>{formatTime(a.appointmentDate)}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => updateStatus(a.id, "CONFIRMED")}
                  disabled={actionLoadingId === a.id}
                  className="bg-green-600 px-3 py-1 rounded"
                >
                  Confirm
                </button>

                <button
                  onClick={() => updateStatus(a.id, "CANCELLED")}
                  disabled={actionLoadingId === a.id}
                  className="bg-red-600 px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Link
        to="/provider/appointments"
        className="inline-block mt-6 text-blue-400"
      >
        View All Appointments →
      </Link>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: StatItem) {
  return (
    <div className="border p-4 rounded">
      <div className="flex justify-between">
        <span>{label}</span>
        <Icon size={18} />
      </div>
      <p className="text-2xl">{value}</p>
    </div>
  );
}