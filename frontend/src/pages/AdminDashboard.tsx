import { useEffect, useState } from "react";
import {
  LogOut,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
} from "lucide-react";
import { supabase } from "../services/supabase";
import type { Profile } from "../types/profile";

type CreateRole = "doctor" | "staff";

type UserRow = Profile & {
  doctors?: {
    staff_no: string | null;
    specialization: string | null;
    room_no: string | null;
    is_available: boolean | null;
  } | null;
  staff_members?: {
    staff_no: string | null;
    department: string | null;
    position: string | null;
  } | null;
};

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<Profile | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<CreateRole>("doctor");

  const [staffNo, setStaffNo] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAdmin();
    loadUsers();
  }, []);

  const loadAdmin = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    setAdmin(data);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        doctors (
          staff_no,
          specialization,
          room_no,
          is_available
        ),
        staff_members (
          staff_no,
          department,
          position
        )
      `
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data as UserRow[]);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("password123");
    setPhone("");
    setRole("doctor");
    setStaffNo("");
    setSpecialization("");
    setRoomNo("");
    setDepartment("");
    setPosition("");
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone,
          role,
          staffNo,
          specialization,
          roomNo,
          department,
          position,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create user.");
      }

      setMessage(result.message || "User account created successfully.");
      resetForm();
      await loadUsers();
    } catch (error) {
      const err = error as Error;
      setMessage(err.message);
    }

    setLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Welcome, {admin?.full_name || "Admin"}
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
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <UserCog className="w-5 h-5 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create Staff Account
                </h2>
                <p className="text-sm text-slate-500">
                  Create doctor or clinic staff login.
                </p>
              </div>
            </div>

            {message && (
              <div className="mb-5 bg-slate-100 text-slate-700 p-3 rounded-xl text-sm">
                {message}
              </div>
            )}

            <form onSubmit={createUser} className="space-y-4">
              <input
                className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

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
                placeholder="Temporary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <input
                className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <select
                className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={role}
                onChange={(e) => setRole(e.target.value as CreateRole)}
              >
                <option value="doctor">Doctor</option>
                <option value="staff">Staff</option>
              </select>

              <input
                className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Staff number"
                value={staffNo}
                onChange={(e) => setStaffNo(e.target.value)}
              />

              {role === "doctor" && (
                <>
                  <input
                    className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />

                  <input
                    className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Consultation room number"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                  />
                </>
              )}

              {role === "staff" && (
                <>
                  <input
                    className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />

                  <input
                    className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </>
              )}

              <button
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold disabled:opacity-60 transition"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </section>

          <section className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  All Registered Users
                </h2>
                <p className="text-sm text-slate-500">
                  Students, doctors, staff, and admins from Supabase.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-sm text-blue-700">Students</p>
                <h3 className="text-2xl font-bold text-blue-900">
                  {users.filter((u) => u.role === "student").length}
                </h3>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4">
                <p className="text-sm text-emerald-700">Doctors</p>
                <h3 className="text-2xl font-bold text-emerald-900">
                  {users.filter((u) => u.role === "doctor").length}
                </h3>
              </div>

              <div className="bg-violet-50 rounded-2xl p-4">
                <p className="text-sm text-violet-700">Staff</p>
                <h3 className="text-2xl font-bold text-violet-900">
                  {users.filter((u) => u.role === "staff").length}
                </h3>
              </div>

              <div className="bg-slate-100 rounded-2xl p-4">
                <p className="text-sm text-slate-700">Admins</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === "admin").length}
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 text-sm"
                    >
                      <td className="py-4 pr-4 font-medium text-slate-900">
                        {user.full_name}
                      </td>

                      <td className="py-4 pr-4 text-slate-600">
                        {user.email}
                      </td>

                      <td className="py-4 pr-4">
                        <span className="capitalize px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          {user.role}
                        </span>
                      </td>

                      <td className="py-4 pr-4 text-slate-600">
                        {user.role === "doctor" && (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-emerald-600" />
                            <span>
                              {user.doctors?.specialization ||
                                "No specialization"}{" "}
                              {user.doctors?.room_no
                                ? `• Room ${user.doctors.room_no}`
                                : ""}
                            </span>
                          </div>
                        )}

                        {user.role === "staff" && (
                          <span>
                            {user.staff_members?.department || "No department"}{" "}
                            {user.staff_members?.position
                              ? `• ${user.staff_members.position}`
                              : ""}
                          </span>
                        )}

                        {user.role === "admin" && <span>System owner</span>}

                        {user.role === "student" && (
                          <span>Student account</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center text-slate-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}