import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";

type AppRoutesProps = {
  session: Session | null;
};

function AppRoutes({ session }: AppRoutesProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <DashboardPage session={session} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;