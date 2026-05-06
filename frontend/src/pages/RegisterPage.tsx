import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { supabase } from "../services/supabase";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [matricNo, setMatricNo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [faculty, setFaculty] = useState("");
  const [programme, setProgramme] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setMessage("Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      email,
      role: "student",
      phone,
    });

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    const { error: studentError } = await supabase.from("students").insert({
      id: user.id,
      matric_no: matricNo,
      faculty,
      programme,
      year_of_study: yearOfStudy ? Number(yearOfStudy) : null,
    });

    if (studentError) {
      setMessage(studentError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/student");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-10 text-white flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Stethoscope className="w-8 h-8" />
            </div>

            <h1 className="text-4xl font-bold">Create Student Account</h1>

            <p className="text-blue-100 mt-4 leading-relaxed">
              Register for UniHealth to book appointments, submit symptoms,
              view medical records, and access AI-assisted pre-screening.
            </p>
          </div>

          <p className="text-blue-100 text-sm mt-10">
            Doctor, staff, and admin accounts are created by the system admin.
          </p>
        </div>

        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Student Registration
          </h2>
          <p className="text-slate-500 mt-2">
            Create your UniHealth student account.
          </p>

          {message && (
            <div className="mt-5 mb-5 bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 grid grid-cols-1 gap-4">
            <input
              className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Matric number"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
              required
            />

            <input
              className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Student email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Faculty"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
            />

            <input
              className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Programme"
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
            />

            <input
              className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              placeholder="Year of study"
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
            />

            <input
              className="bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <button
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold disabled:opacity-60 transition"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}