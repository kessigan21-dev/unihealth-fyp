import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

function LoginPage() {
  return (
    <AuthLayout
      title="UniHealth"
      subtitle="University Healthcare Management System"
    >
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-blue-600 font-medium hover:underline">
          Register here
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;