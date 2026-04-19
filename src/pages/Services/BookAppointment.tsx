import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "@data/Context";

type Role = "ADMIN" | "CUSTOMER" | "PROVIDER" | "STAFF";
type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type User = {
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
  customer: User;
  provider: User;
  createdAt: string;
  updatedAt: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.wittyground-e489ec01.westus2.azurecontainerapps.io/api/v1";

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useDataContext();

  const [providers, setProviders] = useState<User[]>([]);
  const [providerId, setProviderId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setLoadingProviders(true);
        setError("");

        const res = await fetch(`${API_BASE}/users`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load users");
        }

        const users: User[] = await res.json();

        const providerUsers = users.filter(
          (u) => u.role === "PROVIDER" && u.enabled
        );

        setProviders(providerUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load providers");
      } finally {
        setLoadingProviders(false);
      }
    };

    loadProviders();
  }, []);

  const selectedProvider = useMemo(
    () => providers.find((p) => p.id === providerId) ?? null,
    [providers, providerId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError("You must be logged in to book an appointment.");
      return;
    }

    if (!providerId || !appointmentDate || !reason.trim()) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const payload = {
        appointmentDate: new Date(appointmentDate).toISOString(),
        reason: reason.trim(),
        customerId: user.id,
        providerId,
      };

      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data: Appointment | { message?: string } = await res.json();

      if (!res.ok) {
        throw new Error(
          "message" in data && data.message ? data.message : "Failed to create appointment"
        );
      }

      setSuccess("Appointment booked successfully.");
      setProviderId("");
      setAppointmentDate("");
      setReason("");

      navigate("/appointments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-white">Book Appointment</h1>
        <p className="mt-2 text-sm text-gray-400">
          Choose a provider, date and time, then submit your booking request.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Provider
            </label>
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              disabled={loadingProviders || submitting}
            >
              <option value="">Select a provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.firstName} {provider.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Appointment Date & Time
            </label>
            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              placeholder="Briefly describe the purpose of the appointment"
              disabled={submitting}
            />
          </div>

          {selectedProvider && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300">
              Booking with: {selectedProvider.firstName} {selectedProvider.lastName}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {submitting ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}