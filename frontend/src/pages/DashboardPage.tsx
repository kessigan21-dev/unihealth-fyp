import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

type DashboardPageProps = {
  session: Session | null;
};

type Profile = {
  id: string;
  full_name: string;
  phone_number: string | null;
  role: string;
  created_at?: string;
};

function DashboardPage({ session }: DashboardPageProps) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone_number, role, created_at")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          setErrorMessage(error.message);
          setProfile(null);
          return;
        }

        if (!data) {
          setErrorMessage("No profile found for this user.");
          setProfile(null);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error("Profile fetch error:", error);
        setErrorMessage("Failed to load profile information.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const renderRoleCards = () => {
    if (!profile) return null;

    if (profile.role === "student") {
      return (
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
            <h3 className="text-lg font-semibold text-blue-800">Pre-Screening</h3>
            <p className="text-sm text-slate-600 mt-2">
              Start symptom input and receive intelligent pre-screening support.
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
            <h3 className="text-lg font-semibold text-green-800">Appointments</h3>
            <p className="text-sm text-slate-600 mt-2">
              Book appointments and track your scheduled consultation.
            </p>
          </div>

          <div className="rounded-2xl bg-purple-50 border border-purple-100 p-5">
            <h3 className="text-lg font-semibold text-purple-800">Medical Certificates</h3>
            <p className="text-sm text-slate-600 mt-2">
              View and download your issued digital medical certificates.
            </p>
          </div>
        </div>
      );
    }

    if (profile.role === "doctor") {
      return (
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
            <h3 className="text-lg font-semibold text-blue-800">Consultations</h3>
            <p className="text-sm text-slate-600 mt-2">
              View schedules, patient details, and consultation records.
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
            <h3 className="text-lg font-semibold text-green-800">Decision Support</h3>
            <p className="text-sm text-slate-600 mt-2">
              Review treatment and medication suggestions during consultation.
            </p>
          </div>

          <div className="rounded-2xl bg-purple-50 border border-purple-100 p-5">
            <h3 className="text-lg font-semibold text-purple-800">Medical Certificates</h3>
            <p className="text-sm text-slate-600 mt-2">
              Generate digital MCs for eligible students.
            </p>
          </div>
        </div>
      );
    }

    if (profile.role === "dispensary_staff") {
      return (
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
            <h3 className="text-lg font-semibold text-blue-800">Prescriptions</h3>
            <p className="text-sm text-slate-600 mt-2">
              View incoming prescriptions from doctors.
            </p>
          </div>

          <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
            <h3 className="text-lg font-semibold text-green-800">Medication Preparation</h3>
            <p className="text-sm text-slate-600 mt-2">
              Prepare medications and manage collection workflow.
            </p>
          </div>

          <div className="rounded-2xl bg-purple-50 border border-purple-100 p-5">
            <h3 className="text-lg font-semibold text-purple-800">Status Updates</h3>
            <p className="text-sm text-slate-600 mt-2">
              Update medication readiness and collection status.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-100 p-5">
        <h3 className="text-lg font-semibold text-amber-800">Unknown Role</h3>
        <p className="text-sm text-slate-600 mt-2">
          This account does not yet have a supported dashboard role.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
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
            className="rounded-xl bg-red-500 px-4 py-2 text-white font-medium hover:bg-red-600 transition w-fit"
          >
            Logout
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Logged-in User
          </h2>

          {loadingProfile ? (
            <p className="text-slate-600">Loading profile...</p>
          ) : errorMessage ? (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : (
            <div className="space-y-2 text-slate-600">
              <p>
                <span className="font-medium">Full Name:</span>{" "}
                {profile?.full_name ?? "No name found"}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {session?.user?.email ?? "No email found"}
              </p>
              <p>
                <span className="font-medium">Role:</span>{" "}
                {profile?.role ?? "No role found"}
              </p>
              <p>
                <span className="font-medium">Phone Number:</span>{" "}
                {profile?.phone_number ?? "No phone number found"}
              </p>
            </div>
          )}
        </div>

        {!loadingProfile && !errorMessage && renderRoleCards()}
      </div>
    </div>
  );
}

export default DashboardPage;