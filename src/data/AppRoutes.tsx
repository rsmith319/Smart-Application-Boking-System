import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "@pages/Landing";
import Login from "@pages/Login";
import Account from "@/pages/Account";
import Appointments from "@/pages/Appointment";
import BookAppointment from "@/pages/BookAppointment";
import CreateAccount from "@pages/CreateAccount";
import ForgotPassword from "@pages/ForgotPassword";
import Profile from "@pages/Profile";
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
      <Route path="account" element={<Account />}></Route>

      {/* Protected Route */}
      <Route
        path="/profile"
        element={user ? <Profile /> : <Navigate to="/login" replace />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
