import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "@pages/Landing";
import Login from "@/pages/Login/Login";
import Account from "@/pages/Account/Account";
import Appointments from "@/pages/Services/Appointment";
import BookAppointment from "@/pages/Services/BookAppointment";
import CreateAccount from "@/pages/Login/CreateAccount";
import ForgotPassword from "@/pages/Login/ForgotPassword";
import DashboardRouter from "@/pages/DashboardRouter";
import ProviderAppointmentsPage from "@/pages/Account/ProviderAppointment";

import { useDataContext } from "@data/Context";

const AppRoutes = () => {
  const { user } = useDataContext();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CreateAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/appointments/new"
        element={user ? <BookAppointment /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/appointments"
        element={user ? <Appointments /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/appointments/provider"
        element={
          user ? <ProviderAppointmentsPage /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/account"
        element={user ? <Account /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/profile"
        element={
          user ? <DashboardRouter role={user.role} /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/provider"
        element={
          user?.role === "PROVIDER" ? (
            <DashboardRouter role={user.role} />
          ) : (
            <Navigate to={user ? "/profile" : "/login"} replace />
          )
        }
      />

      <Route
        path="/admin"
        element={
          user?.role === "ADMIN" ? (
            <DashboardRouter role={user.role} />
          ) : (
            <Navigate to={user ? "/profile" : "/login"} replace />
          )
        }
      />

      <Route
        path="/staff"
        element={
          user?.role === "STAFF" ? (
            <DashboardRouter role={user.role} />
          ) : (
            <Navigate to={user ? "/profile" : "/login"} replace />
          )
        }
      />

      <Route
        path="/customer"
        element={
          user?.role === "CUSTOMER" ? (
            <DashboardRouter role={user.role} />
          ) : (
            <Navigate to={user ? "/profile" : "/login"} replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;