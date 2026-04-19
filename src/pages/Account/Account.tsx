import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "@/data/v";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Save,
  CircleDot,
  BadgeCheck,
  Settings,
  IdCard,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { useDataContext } from "@data/Context";

type Role = "ADMIN" | "CUSTOMER" | "PROVIDER" | "STAFF";

type AccountUser = {
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

function normalizeUser(raw: LegacyUser | null | undefined): AccountUser {
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

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
  }).format(date);
}

function getRoleLabel(role?: Role) {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "CUSTOMER":
      return "Customer";
    case "PROVIDER":
      return "Provider";
    case "STAFF":
      return "Staff";
    default:
      return "User";
  }
}

export default function ManageAccount() {
  const { user } = useDataContext();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [saving, setSaving] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [account, setAccount] = useState<AccountUser | null>(null);

  useEffect(() => {
    if (!user) return;

    const currentUser = normalizeUser(user as LegacyUser);

    setAccount(currentUser);
    setForm({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber ?? "",
    });
  }, [user]);

  useEffect(() => {
    const loadFreshAccount = async () => {
      if (!user?.id) return;

      try {
        setLoadingAccount(true);
        setError("");

        const res = await fetch(`${BASE_URL}/users/${String(user.id)}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load account details");
        }

        const raw = await res.json();
        const data = normalizeUser(raw);

        setAccount(data);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber ?? "",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load account details"
        );
      } finally {
        setLoadingAccount(false);
      }
    };

    loadFreshAccount();
  }, [user?.id]);

  const fullName = useMemo(() => {
    const first = form.firstName.trim();
    const last = form.lastName.trim();
    return `${first} ${last}`.trim() || "Unnamed User";
  }, [form.firstName, form.lastName]);

  const hasChanges = useMemo(() => {
    if (!account) return false;

    return (
      form.firstName !== (account.firstName ?? "") ||
      form.lastName !== (account.lastName ?? "") ||
      form.email !== (account.email ?? "") ||
      form.phoneNumber !== (account.phoneNumber ?? "")
    );
  }, [form, account]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !account) {
      setError("Account information is unavailable.");
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        role: account.role,
        enabled: account.enabled,
      };

      const res = await fetch(`${BASE_URL}/users/${String(user.id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to update account");
      }

      const raw = await res.json();
      const updated = normalizeUser(raw);

      setAccount(updated);
      setForm({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phoneNumber: updated.phoneNumber ?? "",
      });
      setSuccess("Account details updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_30%),radial-gradient(circle_at_right,_rgba(168,85,247,0.14),_transparent_28%),linear-gradient(to_bottom,_#050816,_#0b1120,_#111827)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.15fr_0.85fr] xl:p-8">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                <Settings size={14} />
                Manage Account
              </div>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-violet-500/20 shadow-lg">
                  <User size={34} className="text-white" />
                </div>

                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                    {fullName}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                    Review and update your personal details, contact information,
                    and account settings from one place.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200">
                      <ShieldCheck size={14} className="text-emerald-300" />
                      Secure account
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200">
                      <CircleDot size={12} className="text-emerald-400" />
                      {account?.enabled ? "Profile active" : "Profile disabled"}
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-gray-200">
                      <BadgeCheck size={14} className="text-blue-300" />
                      {getRoleLabel(account?.role)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <h2 className="text-base font-semibold sm:text-lg">
                  Account Summary
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Full Name
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-white sm:text-base">
                      {fullName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Email Address
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-white">
                      {form.email || "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 sm:text-xs">
                      Phone Number
                    </p>
                    <p className="mt-2 break-words text-sm font-medium leading-6 text-white">
                      {form.phoneNumber || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm leading-5 text-gray-400">Role</span>
              <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                <IdCard size={18} />
              </div>
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
              {getRoleLabel(account?.role)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm leading-5 text-gray-400">Status</span>
              <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                <BadgeCheck size={18} />
              </div>
            </div>
            <p className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
              {account?.enabled ? "Active" : "Disabled"}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm leading-5 text-gray-400">Member Since</span>
              <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                <CalendarDays size={18} />
              </div>
            </div>
            <p className="mt-4 text-base font-bold tracking-tight sm:text-lg">
              {formatDate(account?.createdAt)}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm leading-5 text-gray-400">Last Updated</span>
              <div className="rounded-xl border border-white/10 bg-white/10 p-2">
                <Save size={18} />
              </div>
            </div>
            <p className="mt-4 text-base font-bold tracking-tight sm:text-lg">
              {formatDate(account?.updatedAt)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={handleSave}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Update your basic account details below.
                </p>
              </div>

              <div className="w-fit rounded-2xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
                Editable
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  First Name
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <User size={18} className="text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Last Name
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <User size={18} className="text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Email Address
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-200">
                  Phone Number
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <Phone size={18} className="text-gray-400" />
                  <input
                    type="text"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                <BadgeCheck size={18} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-400">
                {hasChanges ? "You have unsaved changes" : "No changes detected"}
              </div>
            </div>
          </form>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Contact Information
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                A quick summary of your current contact details.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-0.5 shrink-0 text-gray-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:text-xs">
                        Primary Email
                      </p>
                      <p className="mt-1 break-words text-sm font-medium leading-6 sm:text-base">
                        {form.email || "Not available"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-0.5 shrink-0 text-gray-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:text-xs">
                        Phone Number
                      </p>
                      <p className="mt-1 break-words text-sm font-medium leading-6 sm:text-base">
                        {form.phoneNumber || "Not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Security Overview
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Overview of your account access and protection details.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        Account Status
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        {account?.enabled
                          ? "Your account is active and available for normal use."
                          : "Your account is currently disabled."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <Lock size={18} className="mt-0.5 shrink-0 text-blue-300" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        Password Management
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        You can connect this section to a future change-password
                        feature when your backend password update endpoint is ready.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <BadgeCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-violet-300"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        Access Role
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-400">
                        Your current system role is{" "}
                        <span className="font-medium text-white">
                          {getRoleLabel(account?.role)}
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loadingAccount && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-300 shadow-xl backdrop-blur-xl sm:p-6">
            Loading latest account details...
          </section>
        )}
      </div>
    </div>
  );
}