import { useNavigate } from "react-router-dom";
import { Users, Stethoscope, Package, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Student Portal",
      description:
        "Use the UniHealth mobile-style portal to book appointments, submit symptoms, and view records.",
      icon: Users,
      path: "/login?portal=student",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Doctor Portal",
      description:
        "Manage consultations, review AI suggestions, record diagnosis, and issue prescriptions.",
      icon: Stethoscope,
      path: "/login?portal=doctor",
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      title: "Staff Portal",
      description:
        "Manage queue flow, dispensary status, prescriptions, and clinic operation records.",
      icon: Package,
      path: "/login?portal=staff",
      color: "bg-violet-600 hover:bg-violet-700",
    },
    {
      title: "Admin Portal",
      description:
        "Create doctor and staff accounts, assign doctors, and manage UniHealth system users.",
      icon: ShieldCheck,
      path: "/login?portal=admin",
      color: "bg-slate-900 hover:bg-slate-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">UniHealth</h1>
          </div>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Intelligent University Healthcare Management System
          </p>
          <p className="text-slate-500 mt-2">
            Student healthcare app and clinic management website
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;

            return (
              <button
                key={portal.title}
                onClick={() => navigate(portal.path)}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300 text-left"
              >
                <div
                  className={`w-14 h-14 ${portal.color} rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {portal.title}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {portal.description}
                </p>

                <div className="mt-6 text-blue-600 font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Access Portal
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}