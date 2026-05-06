import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  ClipboardPlus,
  FileText,
  HeartPulse,
  LogOut,
  Mail,
  Phone,
  Search,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { supabase } from "../services/supabase";
import type { Profile } from "../types/profile";

type AppointmentStatus = "pending" | "approved" | "completed" | "cancelled";

type Appointment = {
  id: string;
  student_id: string;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: AppointmentStatus;
  created_at: string;
  student: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
};

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppointmentStatus>(
    "all"
  );

  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    setPageLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login?portal=doctor";
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    setDoctor(profileData);

    const { data: appointmentData } = await supabase
      .from("appointments")
      .select(
        `
        *,
        student:profiles!appointments_student_id_fkey (
          full_name,
          email,
          phone
        )
      `
      )
      .eq("doctor_id", userData.user.id)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    setAppointments((appointmentData as Appointment[]) || []);
    setPageLoading(false);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        appointment.student?.full_name?.toLowerCase().includes(keyword) ||
        appointment.student?.email?.toLowerCase().includes(keyword) ||
        appointment.reason?.toLowerCase().includes(keyword) ||
        appointment.appointment_date?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const activeAppointments = appointments.filter(
    (a) => a.status === "approved"
  );
  const completedAppointments = appointments.filter(
    (a) => a.status === "completed"
  );
  const cancelledAppointments = appointments.filter(
    (a) => a.status === "cancelled"
  );

  const completeConsultation = async () => {
    if (!selectedAppointment) return;

    if (!diagnosis || !treatment) {
      setMessage("Please enter diagnosis and treatment before completing.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setMessage("Session expired.");
      setLoading(false);
      return;
    }

    const { data: recordData, error: recordError } = await supabase
      .from("medical_records")
      .insert({
        appointment_id: selectedAppointment.id,
        student_id: selectedAppointment.student_id,
        doctor_id: userData.user.id,
        diagnosis,
        treatment,
        notes,
      })
      .select()
      .single();

    if (recordError) {
      setMessage(recordError.message);
      setLoading(false);
      return;
    }

    if (medication) {
      const { error: prescriptionError } = await supabase
        .from("prescriptions")
        .insert({
          medical_record_id: recordData.id,
          medication_name: medication,
          dosage,
          frequency: "",
          duration: "",
          instructions: treatment,
        });

      if (prescriptionError) {
        setMessage(prescriptionError.message);
        setLoading(false);
        return;
      }
    }

    const { error: appointmentError } = await supabase
      .from("appointments")
      .update({
        status: "completed",
      })
      .eq("id", selectedAppointment.id);

    if (appointmentError) {
      setMessage(appointmentError.message);
      setLoading(false);
      return;
    }

    setMessage("Consultation completed and medical record saved.");

    setDiagnosis("");
    setTreatment("");
    setMedication("");
    setDosage("");
    setNotes("");
    setSelectedAppointment(null);

    await loadDoctorData();
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

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading doctor workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Doctor Clinical Workspace
              </h1>
              <p className="text-sm text-slate-500">
                Welcome, Dr. {doctor?.full_name || "Doctor"}
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
        <section className="bg-slate-900 rounded-3xl p-8 text-white mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-emerald-300 text-sm font-semibold mb-2">
                UniHealth Doctor Portal
              </p>
              <h2 className="text-3xl font-bold">
                Today’s Clinical Overview
              </h2>
              <p className="text-slate-300 mt-2 max-w-2xl">
                Review assigned patients, inspect symptoms, complete
                consultations, and save real medical records into Supabase.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-2xl p-4 min-w-28">
                <p className="text-xs text-slate-300">Assigned</p>
                <h3 className="text-2xl font-bold">{appointments.length}</h3>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 min-w-28">
                <p className="text-xs text-slate-300">Active</p>
                <h3 className="text-2xl font-bold">
                  {activeAppointments.length}
                </h3>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 min-w-28">
                <p className="text-xs text-slate-300">Done</p>
                <h3 className="text-2xl font-bold">
                  {completedAppointments.length}
                </h3>
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <UserRound className="w-7 h-7 text-blue-600" />
            <p className="text-sm text-slate-500 mt-4">Assigned Patients</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {appointments.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <HeartPulse className="w-7 h-7 text-emerald-600" />
            <p className="text-sm text-slate-500 mt-4">Active Consultations</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {activeAppointments.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <CheckCircle2 className="w-7 h-7 text-violet-600" />
            <p className="text-sm text-slate-500 mt-4">Completed</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {completedAppointments.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <Activity className="w-7 h-7 text-red-500" />
            <p className="text-sm text-slate-500 mt-4">Cancelled</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {cancelledAppointments.length}
            </h3>
          </div>
        </div>

        {message && (
          <div className="mb-6 bg-white border border-slate-200 text-slate-700 px-5 py-4 rounded-2xl shadow-sm">
            {message}
          </div>
        )}

        <div className="grid xl:grid-cols-5 gap-6">
          <section className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Assigned Patient Queue
                </h2>
                <p className="text-sm text-slate-500">
                  Patients assigned by clinic staff.
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  className="w-full bg-slate-100 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Search patient, date, symptoms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "approved", "completed", "cancelled"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatusFilter(item as any)}
                    className={`capitalize px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      statusFilter === item
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 max-h-[760px] overflow-y-auto pr-1">
              {filteredAppointments.map((appointment) => (
                <button
                  key={appointment.id}
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setDiagnosis("");
                    setTreatment("");
                    setMedication("");
                    setDosage("");
                    setNotes("");
                  }}
                  className={`w-full text-left border rounded-3xl p-5 transition ${
                    selectedAppointment?.id === appointment.id
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {appointment.student?.full_name || "Unknown Student"}
                      </h3>

                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          {appointment.student?.email}
                        </p>

                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" />
                          {appointment.student?.phone || "No phone number"}
                        </p>
                      </div>

                      <p className="text-sm text-slate-700 mt-4 line-clamp-3">
                        {appointment.reason || "No symptoms provided."}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-900">
                        {appointment.appointment_date}
                      </p>

                      <p className="text-sm text-slate-500">
                        {appointment.appointment_time}
                      </p>

                      <span
                        className={`inline-block mt-3 capitalize px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredAppointments.length === 0 && (
                <div className="py-14 text-center text-slate-500">
                  No matching patients found.
                </div>
              )}
            </div>
          </section>

          <section className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {!selectedAppointment ? (
              <div className="h-full min-h-[720px] flex flex-col items-center justify-center text-center p-10">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-5">
                  <ClipboardPlus className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Select a Patient
                </h2>
                <p className="text-slate-500 mt-2 max-w-md">
                  Choose an assigned patient from the queue to review symptoms
                  and begin consultation.
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-slate-900 text-white p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div>
                      <p className="text-emerald-300 text-sm font-semibold mb-1">
                        Consultation Case
                      </p>
                      <h2 className="text-2xl font-bold">
                        {selectedAppointment.student?.full_name}
                      </h2>
                      <p className="text-slate-300 text-sm mt-1">
                        {selectedAppointment.student?.email} •{" "}
                        {selectedAppointment.student?.phone || "No phone"}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-slate-300 text-sm">Appointment</p>
                      <p className="font-semibold">
                        {selectedAppointment.appointment_date} at{" "}
                        {selectedAppointment.appointment_time}
                      </p>
                      <span
                        className={`inline-block mt-3 capitalize px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                          selectedAppointment.status
                        )}`}
                      >
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <CalendarClock className="w-6 h-6 text-blue-600" />
                      <p className="text-xs text-slate-500 mt-3">
                        Requested Date
                      </p>
                      <p className="font-semibold text-slate-900">
                        {selectedAppointment.appointment_date}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4">
                      <UserRound className="w-6 h-6 text-emerald-600" />
                      <p className="text-xs text-slate-500 mt-3">Patient</p>
                      <p className="font-semibold text-slate-900">
                        {selectedAppointment.student?.full_name}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4">
                      <FileText className="w-6 h-6 text-violet-600" />
                      <p className="text-xs text-slate-500 mt-3">Record</p>
                      <p className="font-semibold text-slate-900">
                        Ready to save
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Student Symptoms / Reason
                    </p>
                    <p className="text-slate-800 mt-2 leading-relaxed">
                      {selectedAppointment.reason || "No description provided."}
                    </p>
                  </div>

                  {selectedAppointment.status === "completed" ? (
                    <div className="bg-blue-50 text-blue-700 rounded-2xl p-5">
                      This consultation is already completed.
                    </div>
                  ) : selectedAppointment.status === "cancelled" ? (
                    <div className="bg-red-50 text-red-700 rounded-2xl p-5">
                      This appointment was cancelled.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        className="w-full bg-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 min-h-28"
                        placeholder="Diagnosis, e.g. Upper respiratory tract infection"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                      />

                      <textarea
                        className="w-full bg-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 min-h-28"
                        placeholder="Treatment plan / advice"
                        value={treatment}
                        onChange={(e) => setTreatment(e.target.value)}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          className="w-full bg-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Medication name, e.g. Paracetamol"
                          value={medication}
                          onChange={(e) => setMedication(e.target.value)}
                        />

                        <input
                          className="w-full bg-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Dosage, e.g. 500mg"
                          value={dosage}
                          onChange={(e) => setDosage(e.target.value)}
                        />
                      </div>

                      <textarea
                        className="w-full bg-slate-100 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-emerald-500 min-h-32"
                        placeholder="Additional clinical notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />

                      <button
                        onClick={completeConsultation}
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-semibold transition disabled:opacity-60"
                      >
                        {loading
                          ? "Saving consultation..."
                          : "Complete Consultation & Save Record"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}