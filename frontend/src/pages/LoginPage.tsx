import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { supabase } from "../services/supabase";
import type { Profile, UserRole } from "../types/profile";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const portal = (searchParams.get("portal") || "student") as UserRole;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const portalTitle =
    portal === "student"
      ? "Student Login"
      : portal === "doctor"
      ? "Doctor Login"
      : portal === "staff"
      ? "Staff Login"
      : "Admin Login";

  const portalDescription =
    portal === "student"
      ? "Login to book appointments, submit symptoms, and view your medical records."
      : portal === "doctor"
      ? "Login to manage consultations, view AI suggestions, and update patient records."
      : portal === "staff"
      ? "Login to manage clinic queue, dispensary workflow, and prescriptions."
      : "Login to manage users, doctors, staff, and clinic operations.";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<Profile>();

    if (profileError || !profile) {
      setMessage("Profile not found. Please contact admin.");
      setLoading(false);
      return;
    }

    if (profile.role !== portal) {
      setMessage(
        `This account is registered as ${profile.role}. Please use the correct portal.`
      );
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate(`/${profile.role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-10 text-white flex flex-col justify-between">
          <div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to portals
            </button>

            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Stethoscope className="w-8 h-8" />
            </div>

            <h1 className="text-4xl font-bold">{portalTitle}</h1>

            <p className="text-slate-300 mt-4 leading-relaxed">
              {portalDescription}
            </p>
          </div>

          <p className="text-slate-400 text-sm mt-10">
            Intelligent University Healthcare Management System
          </p>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-slate-900">Login</h2>
          <p className="text-slate-500 mt-2">Enter your email and password.</p>

          {message && (
            <div className="mt-5 bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold disabled:opacity-60 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {portal === "student" && (
            <p className="text-center text-slate-500 text-sm mt-6">
              Student account only?{" "}
              <Link to="/register" className="text-blue-600 font-semibold">
                Register here
              </Link>
            </p>
          )}

          {portal === "doctor" && (
            <p className="text-center text-slate-500 text-sm mt-6">
              Doctor accounts are created by the admin. Please contact the
              UniHealth administrator to register.
            </p>
          )}

          {portal === "staff" && (
            <p className="text-center text-slate-500 text-sm mt-6">
              Staff accounts are created by the admin. Please contact the
              UniHealth administrator to register.
            </p>
          )}

          {portal === "admin" && (
            <p className="text-center text-slate-500 text-sm mt-6">
              Admin access is created directly through Supabase by the system
              owner.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}