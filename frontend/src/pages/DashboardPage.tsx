import type { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

type DashboardPageProps = {
  session: Session | null;
};

function DashboardPage({ session }: DashboardPageProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              UniHealth Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Welcome to the university healthcare management system
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            Logged-in User
          </h2>
          <p className="text-slate-600">
            <span className="font-medium">Email:</span>{" "}
            {session?.user?.email ?? "No email found"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;