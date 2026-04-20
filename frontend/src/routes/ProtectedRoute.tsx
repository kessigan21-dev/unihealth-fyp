import { Navigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  session: Session | null;
  children: ReactNode;
};

function ProtectedRoute({ session, children }: ProtectedRouteProps) {
  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;