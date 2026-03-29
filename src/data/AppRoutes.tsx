import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "@pages/Landing";
import Login from "@pages/Login";
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