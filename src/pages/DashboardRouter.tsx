import { lazy, Suspense } from "react";


const CustomerDashboard = lazy(() => import("@/pages/Account/CustomerDashboard"));
const ProviderDashboard = lazy(() => import("@/pages/Account/ProviderDashboard"));
const AdminDashboard = lazy(() => import("@pages/Account/AdminDashboard"));


export default function DashboardRouter({ role }: { role: string }) {
  let Component;
 

  switch (role) {
    case "CUSTOMER":
      Component = CustomerDashboard;
      break;

    case "PROVIDER":
      Component = ProviderDashboard;
      break;

    case "ADMIN":
      Component = AdminDashboard;
      break;

    default:
      return <div>Invalid role</div>;
  }

  return (
    <Suspense fallback={<div className="flex">Loading...</div>}>
      <Component />
    </Suspense>
  );
}