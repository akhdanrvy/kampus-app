// Central type definitions for KampusGo
// These mirror the Supabase database schema — keep in sync with types/database.ts

// ---------------------------------------------------------------------------
// Auth / User
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  nim: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  faculty?: string;
  major?: string;
  year_entry?: number;
  student_status: "active" | "inactive" | "graduated";
  role: "student" | "admin" | "lecturer";
  e_card_qr_token?: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export type NewsCategory = "akademik" | "kampus" | "nasional" | "umum";

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail_url?: string;
  category: NewsCategory;
  is_featured: boolean;
  published_at: string;
  author_name?: string;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  location?: string;
  event_date: string;
  category?: string;
  requires_registration: boolean;
  registration_count?: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  status: "confirmed" | "pending" | "cancelled";
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export interface AttendanceSession {
  id: string;
  title: string;
  course_name?: string;
  qr_token: string;
  qr_expires_at: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  user_id: string;
  scanned_at: string;
  status: "present" | "late";
}

// ---------------------------------------------------------------------------
// Schedules
// ---------------------------------------------------------------------------

export interface Schedule {
  id: string;
  course_name: string;
  course_code?: string;
  lecturer_name?: string;
  room?: string;
  /** 1 = Senin, 2 = Selasa, ..., 7 = Minggu */
  day_of_week: number;
  /** Format: "HH:mm" */
  start_time: string;
  /** Format: "HH:mm" */
  end_time: string;
  academic_year?: string;
  semester?: number;
}

// ---------------------------------------------------------------------------
// Utility types
// ---------------------------------------------------------------------------

/** Generic paginated response from Supabase ranged queries */
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasNextPage: boolean;
}
