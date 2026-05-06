import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileHeart,
  FileText,
  HeartPulse,
  LogOut,
  PlusCircle,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { supabase } from "../services/supabase";
import type { Profile } from "../types/profile";

type AppointmentStatus =
  | "pending"
  | "approved"
  | "completed"
  | "cancelled";

type Appointment = {
  id: string;
  student_id: string;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: AppointmentStatus;
  created_at: string;
  doctor: {
    full_name: string;
    email: string;
  } | null;
};

type MedicalRecord = {
  id: string;
  diagnosis: string | null;
  treatment: string | null;
  notes: string | null;
  created_at: string;
  doctor: {
    full_name: string;
    email: string;
  } | null;
  prescriptions: {
    medication_name: string;
    dosage: string | null;
    instructions: string | null;
  }[];
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setPageLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login?portal=student";
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    setProfile(profileData);

    const { data: appointmentData } = await supabase
      .from("appointments")
      .select(
        `
        *,
        doctor:profiles!appointments_doctor_id_fkey (
          full_name,
          email
        )
      `
      )
      .eq("student_id", userData.user.id)
      .order("created_at", { ascending: false });

    setAppointments((appointmentData as Appointment[]) || []);

    const { data: recordsData } = await supabase
      .from("medical_records")
      .select(
        `
        *,
        doctor:profiles!medical_records_doctor_id_fkey (
          full_name,
          email
        ),
        prescriptions (
          medication_name,
          dosage,
          instructions
        )
      `
      )
      .eq("student_id", userData.user.id)
      .order("created_at", { ascending: false });

    setMedicalRecords((recordsData as MedicalRecord[]) || []);

    setPageLoading(false);
  };

  const filteredRecords = useMemo(() => {
    return medicalRecords.filter((record) => {
      const keyword = search.toLowerCase();

      return (
        record.diagnosis?.toLowerCase().includes(keyword) ||
        record.treatment?.toLowerCase().includes(keyword) ||
        record.doctor?.full_name?.toLowerCase().includes(keyword)
      );
    });
  }, [medicalRecords, search]);

  const bookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setMessage("Session expired.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      student_id: userData.user.id,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      reason,
      status: "pending",
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Appointment request submitted successfully.");

    setAppointmentDate("");
    setAppointmentTime("");
    setReason("");

    await loadStudentData();
    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const statusStyle = (status: AppointmentStatus) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700";
    if (status === "completed") return "bg-blue-50 text-blue-700";
    if (status === "cancelled") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  const latestAppointment = appointments[0];

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading UniHealth portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                UniHealth Student Portal
              </h1>

              <p className="text-sm text-slate-500">
                Welcome back, {profile?.full_name || "Student"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-[32px] p-8 md:p-10 text-white mb-7">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-blue-100 font-semibold text-sm mb-3">
                Intelligent University Healthcare Platform
              </p>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Your Complete Student Healthcare Experience
              </h2>

              <p className="text-blue-100 mt-5 text-lg leading-relaxed max-w-2xl">
                Manage appointments, track medical records, receive treatment
                updates, and monitor your healthcare journey through UniHealth.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3">
                  <p className="text-xs text-blue-100">Appointments</p>
                  <h3 className="text-2xl font-bold">
                    {appointments.length}
                  </h3>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3">
                  <p className="text-xs text-blue-100">Medical Records</p>
                  <h3 className="text-2xl font-bold">
                    {medicalRecords.length}
                  </h3>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3">
                  <p className="text-xs text-blue-100">Completed</p>
                  <h3 className="text-2xl font-bold">
                    {
                      appointments.filter((a) => a.status === "completed")
                        .length
                    }
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <CalendarClock className="w-6 h-6" />
                <div>
                  <h3 className="text-xl font-bold">
                    Upcoming Appointment
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Latest healthcare activity
                  </p>
                </div>
              </div>

              {latestAppointment ? (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-2xl p-5">
                    <p className="text-sm text-blue-100">Date</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {latestAppointment.appointment_date}
                    </h3>

                    <p className="text-blue-100 mt-2">
                      {latestAppointment.appointment_time}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-5">
                    <p className="text-sm text-blue-100">Assigned Doctor</p>

                    <h3 className="text-lg font-semibold mt-1">
                      {latestAppointment.doctor?.full_name ||
                        "Awaiting assignment"}
                    </h3>

                    <div
                      className={`inline-block mt-4 capitalize px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                        latestAppointment.status
                      )}`}
                    >
                      {latestAppointment.status}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl p-6 text-blue-100">
                  No appointment requests yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-4 gap-5 mb-7">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <CalendarDays className="w-8 h-8 text-blue-600" />
            <p className="text-sm text-slate-500 mt-5">Appointments</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {appointments.length}
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <Activity className="w-8 h-8 text-emerald-600" />
            <p className="text-sm text-slate-500 mt-5">Approved</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {
                appointments.filter((a) => a.status === "approved").length
              }
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-violet-600" />
            <p className="text-sm text-slate-500 mt-5">Completed</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {
                appointments.filter((a) => a.status === "completed")
                  .length
              }
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <ShieldCheck className="w-8 h-8 text-red-500" />
            <p className="text-sm text-slate-500 mt-5">Medical Records</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {medicalRecords.length}
            </h3>
          </div>
        </div>

        {message && (
          <div className="mb-6 bg-white border border-slate-200 text-slate-700 px-5 py-4 rounded-2xl shadow-sm">
            {message}
          </div>
        )}

        <div className="grid xl:grid-cols-5 gap-6">
          <section className="xl:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-200 p-7">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Book Appointment
                </h2>

                <p className="text-sm text-slate-500">
                  Submit a clinic appointment request.
                </p>
              </div>
            </div>

            <form onSubmit={bookAppointment} className="space-y-4">
              <input
                type="date"
                className="w-full bg-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />

              <input
                type="time"
                className="w-full bg-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />

              <textarea
                className="w-full bg-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 min-h-40"
                placeholder="Describe your symptoms or reason for visit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-semibold transition disabled:opacity-60"
              >
                {loading
                  ? "Submitting request..."
                  : "Submit Appointment"}
              </button>
            </form>

            <div className="mt-8">
              <h3 className="font-bold text-slate-900 mb-4">
                Recent Appointments
              </h3>

              <div className="space-y-3">
                {appointments.slice(0, 4).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-slate-50 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {appointment.appointment_date}
                        </p>

                        <p className="text-sm text-slate-500">
                          {appointment.appointment_time}
                        </p>
                      </div>

                      <span
                        className={`capitalize px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}

                {appointments.length === 0 && (
                  <div className="text-slate-500 text-sm">
                    No appointments yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="xl:col-span-3 bg-white rounded-[32px] shadow-sm border border-slate-200 p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Medical Timeline
                </h2>

                <p className="text-sm text-slate-500">
                  Your consultation history and prescribed treatments.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />

                <input
                  className="w-full bg-slate-100 rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search diagnosis or doctor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6 max-h-[950px] overflow-y-auto pr-1">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="relative border border-slate-200 rounded-[28px] p-6 bg-gradient-to-br from-white to-slate-50"
                >
                  <div className="absolute top-6 right-6">
                    <div className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
                      {new Date(record.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                      <FileHeart className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                        Diagnosis
                      </p>

                      <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        {record.diagnosis || "No diagnosis"}
                      </h3>

                      <p className="text-slate-500 mt-2">
                        Dr. {record.doctor?.full_name || "Unknown Doctor"}
                      </p>

                      <div className="grid md:grid-cols-2 gap-5 mt-6">
                        <div className="bg-blue-50 rounded-2xl p-5">
                          <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">
                            Treatment
                          </p>

                          <p className="text-slate-800 mt-2 leading-relaxed">
                            {record.treatment ||
                              "No treatment details provided."}
                          </p>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-5">
                          <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                            Prescriptions
                          </p>

                          <div className="mt-3 space-y-3">
                            {record.prescriptions?.length ? (
                              record.prescriptions.map(
                                (prescription, index) => (
                                  <div
                                    key={index}
                                    className="bg-white rounded-xl p-3 border border-emerald-100"
                                  >
                                    <p className="font-semibold text-slate-900">
                                      {prescription.medication_name}
                                    </p>

                                    <p className="text-sm text-slate-600 mt-1">
                                      {prescription.dosage ||
                                        "No dosage"}
                                    </p>

                                    <p className="text-sm text-slate-500 mt-1">
                                      {prescription.instructions ||
                                        "No instructions"}
                                    </p>
                                  </div>
                                )
                              )
                            ) : (
                              <p className="text-slate-500 text-sm">
                                No prescriptions.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {record.notes && (
                        <div className="mt-5 bg-slate-100 rounded-2xl p-5">
                          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                            Doctor Notes
                          </p>

                          <p className="text-slate-700 mt-2 leading-relaxed">
                            {record.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredRecords.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  No medical records found.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}