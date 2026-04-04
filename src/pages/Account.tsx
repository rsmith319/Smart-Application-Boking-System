import { useDataContext } from "@data/Context";

export default function Account() {
  const { user } = useDataContext();

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <h1 className="text-3xl font-bold">Account</h1>

      <div className="mt-6 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6">
        <p><span className="font-semibold">First Name:</span> {user?.firstName}</p>
        <p className="mt-3"><span className="font-semibold">Last Name:</span> {user?.lastName}</p>
        <p className="mt-3"><span className="font-semibold">Email:</span> {user?.email}</p>
        <p className="mt-3"><span className="font-semibold">Phone:</span> {user?.phoneNumber}</p>
        <p className="mt-3"><span className="font-semibold">Role:</span> {user?.role}</p>
      </div>
    </div>
  );
}