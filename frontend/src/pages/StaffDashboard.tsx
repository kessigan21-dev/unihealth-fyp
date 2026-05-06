import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LogOut,
  Search,
  Stethoscope,
  UserCheck,
  Users,
} from "lucide-react";
import { supabase } from "../services/supabase";
import type { Profile } from "../types/profile";

type Doctor = {
  id: string;
  staff_no: string | null;
  specialization: string | null;
  room_no: string | null;
  is_available: boolean;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
};

type Appointment = {
  id: string;
  student_id: string;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: "pending" | "approved" | "completed" | "cancelled";
  created_at: string;
  student: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
  doctor: {
    full_name: string;
    email: string;
  } | null;
};

export default function StaffDashboard() {
  const [staff, setStaff] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    setPageLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/login?portal=staff";
      return;
    }

    const { data: staffProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    setStaff(staffProfile);

    const { data: doctorData } = await supabase
      .from("doctors")
      .select(
        `
        id,
        staff_no,
        specialization,
        room_no,
        is_available,
        profile:profiles!doctors_id_fkey (
          full_name,
          email,
          phone
        )
      `
      )
      .eq("is_available", true)
      .order("staff_no", { ascending: true });

    setDoctors(
  ((doctorData || []).map((doctor: any) => ({
    ...doctor,
    profile: Array.isArray(doctor.profile)
      ? doctor.profile[0]
      : doctor.profile,
  })) as Doctor[])
);

    const { data: appointmentData } = await supabase
      .from("appointments")
      .select(
        `
        *,
        student:profiles!appointments_student_id_fkey (
          full_name,
          email,
          phone
        ),
        doctor:profiles!appointments_doctor_id_fkey (
          full_name,
          email
        )
      `
      )
      .order("created_at", { ascending: false });

    setAppointments((appointmentData as Appointment[]) || []);
    setPageLoading(false);
  };

  const assignDoctor = async (appointmentId: string) => {
    const doctorId = selectedDoctors[appointmentId];

    if (!doctorId) {
      setMessage("Please select a doctor before assigning.");
      return;
    }

    setLoadingId(appointmentId);
    setMessage("");

    const { error } = await supabase
      .from("appointments")
      .update({
        doctor_id: doctorId,
        status: "approved",
      })
      .eq("id", appointmentId);

    if (error) {
      setMessage(error.message);
      setLoadingId(null);
      return;
    }

    setMessage("Doctor assigned and appointment approved successfully.");
    await loadStaffData();
    setLoadingId(null);
  };

  const updateStatus = async (
    appointmentId: string,
    status: Appointment["status"]
  ) => {
    setLoadingId(appointmentId);
    setMessage("");

    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) {
      setMessage(error.message);
      setLoadingId(null);
      return;
    }

    setMessage(`Appointment marked as ${status}.`);
    await loadStaffData();
    setLoadingId(null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const statusStyle = (status: Appointment["status"]) => {
    if (status === "approved") return "bg-emerald-50 text-emerald-700";
    if (status === "completed") return "bg-blue-50 text-blue-700";
    if (status === "cancelled") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const keyword = search.toLowerCase();

    return (
      appointment.student?.full_name?.toLowerCase().includes(keyword) ||
      appointment.student?.email?.toLowerCase().includes(keyword) ||
      appointment.reason?.toLowerCase().includes(keyword) ||
      appointment.status?.toLowerCase().includes(keyword)
    );
  });

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading clinic operations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-violet-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Staff Operations Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Welcome, {staff?.full_name || "Clinic Staff"}
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
        <div className="grid md:grid-cols-4 gap-5 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <CalendarDays className="w-7 h-7 text-blue-600" />
            <p className="text-sm text-slate-500 mt-4">Total Requests</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {appointments.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <ClipboardList className="w-7 h-7 text-amber-600" />
            <p className="text-sm text-slate-500 mt-4">Pending</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {appointments.filter((a) => a.status === "pending").length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            <p className="text-sm text-slate-500 mt-4">Approved</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {appointments.filter((a) => a.status === "approved").length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <Stethoscope className="w-7 h-7 text-violet-600" />
            <p className="text-sm text-slate-500 mt-4">Available Doctors</p>
            <h3 className="text-3xl font-bold text-slate-900">
              {doctors.length}
            </h3>
          </div>
        </div>

        {message && (
          <div className="mb-6 bg-white border border-slate-200 text-slate-700 px-5 py-4 rounded-2xl shadow-sm">
            {message}
          </div>
        )}

        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Appointment Assignment Center
              </h2>
              <p className="text-sm text-slate-500">
                Review student details, symptoms, and assign available doctors.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                className="w-full bg-slate-100 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Search patient, symptom, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-5">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-slate-200 rounded-3xl p-5 hover:shadow-md transition bg-gradient-to-br from-white to-slate-50"
              >
                <div className="grid lg:grid-cols-4 gap-5">
                  <div className="lg:col-span-1">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">
                          {appointment.student?.full_name || "Unknown Student"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {appointment.student?.email}
                        </p>
                        <p className="text-sm text-slate-500">
                          {appointment.student?.phone || "No phone number"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Requested Slot
                    </p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {appointment.appointment_date}
                    </p>
                    <p className="text-slate-600 text-sm">
                      {appointment.appointment_time}
                    </p>

                    <span
                      className={`inline-block capitalize px-3 py-1 rounded-full text-xs font-semibold mt-3 ${statusStyle(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Symptoms / Reason
                    </p>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      {appointment.reason || "No description provided."}
                    </p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Doctor Assignment
                    </p>

                    {appointment.doctor_id ? (
                      <div className="mt-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm">
                        Assigned to{" "}
                        <span className="font-semibold">
                          {appointment.doctor?.full_name}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-3">
                        <select
                          className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                          value={selectedDoctors[appointment.id] || ""}
                          onChange={(e) =>
                            setSelectedDoctors((prev) => ({
                              ...prev,
                              [appointment.id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select available doctor</option>
                          {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              Dr. {doctor.profile?.full_name} —{" "}
                              {doctor.specialization || "General"}{" "}
                              {doctor.room_no ? `(Room ${doctor.room_no})` : ""}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => assignDoctor(appointment.id)}
                          disabled={loadingId === appointment.id}
                          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 font-semibold disabled:opacity-60 transition"
                        >
                          <UserCheck className="w-4 h-4" />
                          {loadingId === appointment.id
                            ? "Assigning..."
                            : "Assign Doctor"}
                        </button>
                      </div>
                    )}

                    {appointment.status !== "cancelled" &&
                      appointment.status !== "completed" && (
                        <button
                          onClick={() =>
                            updateStatus(appointment.id, "cancelled")
                          }
                          disabled={loadingId === appointment.id}
                          className="w-full mt-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl py-2 text-sm font-semibold transition"
                        >
                          Cancel Request
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <div className="py-14 text-center text-slate-500">
                No appointment requests found.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}