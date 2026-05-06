export type UserRole = "student" | "doctor" | "staff" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

export type Student = {
  id: string;
  matric_no?: string | null;
  faculty?: string | null;
  programme?: string | null;
  year_of_study?: number | null;
};