import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "@pages/Landing";
import Login from "@/pages/Login/Login";
import Account from "@/pages/Account/Account";
import Appointments from "@/pages/Services/Appointment";
import BookAppointment from "@/pages/Services/BookAppointment";
import CreateAccount from "@/pages/Login/CreateAccount";
import ForgotPassword from "@/pages/Login/ForgotPassword";
import DashboardRouter from "@/pages/DashboardRouter";

import { useDataContext } from "@data/Context";

const AppRoutes = () => {
  const { user } = useDataContext();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CreateAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/appointments/new" element={<BookAppointment />}></Route>
      <Route path="/appointments" element={<Appointments />}></Route>
      <Route path="/account" element={<Account />}></Route>

      {/* Protected Route */}
      <Route
        path="/profile"
        element={user ? <DashboardRouter role={user.role} /> : <Navigate to="/login" replace />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
