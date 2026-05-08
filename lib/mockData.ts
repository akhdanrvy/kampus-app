// ---------------------------------------------------------------------------
// lib/mockData.ts — Static dummy data for offline/pre-Supabase development
//
// TODO: Remove this file and replace all usages with real Supabase queries
//       when the backend is connected. Search for "mockData" to find all call sites.
// ---------------------------------------------------------------------------

import type {
  Profile,
  NewsItem,
  EventItem,
  Schedule,
  AttendanceRecord,
  AttendanceSession,
} from "../types/index";

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const mockProfile: Profile = {
  id: "mock-user-id-123",
  nim: "2022010001",
  full_name: "Budi Santoso",
  email: "budi.santoso@kampus.ac.id",
  phone: "081234567890",
  avatar_url: undefined,
  faculty: "Fakultas Teknik",
  major: "Teknik Informatika",
  year_entry: 2022,
  student_status: "active",
  role: "student",
  e_card_qr_token: "ecard-token-mock-budi-2022",
  created_at: "2022-08-01T00:00:00.000Z",
  updated_at: "2024-01-15T10:00:00.000Z",
};

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export const mockNewsList: NewsItem[] = [
  {
    id: "news-1",
    title: "Pengumuman Jadwal Ujian Akhir Semester Ganjil 2024/2025",
    slug: "jadwal-uas-ganjil-2024",
    content:
      "Dengan hormat, kami informasikan bahwa Ujian Akhir Semester (UAS) Ganjil Tahun Akademik 2024/2025 akan dilaksanakan mulai tanggal 6 Januari 2025. Mahasiswa diwajibkan mengecek jadwal ujian masing-masing di portal akademik. Pastikan semua syarat administrasi telah terpenuhi sebelum mengikuti ujian. Keterlambatan pembayaran akan mengakibatkan tidak dapat mengikuti ujian. Untuk informasi lebih lanjut, silakan menghubungi Bagian Akademik.",
    excerpt:
      "UAS Ganjil 2024/2025 akan dimulai 6 Januari 2025. Cek jadwal dan syarat administrasi Anda sekarang.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    category: "akademik",
    is_featured: true,
    published_at: "2024-12-20T08:00:00.000Z",
    author_name: "Bagian Akademik",
  },
  {
    id: "news-2",
    title: "Dies Natalis ke-35 Universitas: Rangkaian Acara Selama Seminggu",
    slug: "dies-natalis-35",
    content:
      "Dalam rangka merayakan Dies Natalis ke-35, Universitas akan menyelenggarakan serangkaian acara mulai dari seminar nasional, pameran karya mahasiswa, pertunjukan seni budaya, hingga bakti sosial. Semua sivitas akademika diundang untuk berpartisipasi. Pendaftaran stand dan pertunjukan dibuka hingga 31 Desember 2024.",
    excerpt:
      "Perayaan Dies Natalis ke-35 menghadirkan seminar, pameran, seni budaya, dan bakti sosial selama satu minggu penuh.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    category: "kampus",
    is_featured: false,
    published_at: "2024-12-18T09:00:00.000Z",
    author_name: "Humas Universitas",
  },
  {
    id: "news-3",
    title: "Beasiswa Unggulan Kemendikbud 2025 Dibuka, Simak Syaratnya",
    slug: "beasiswa-unggulan-kemendikbud-2025",
    content:
      "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi (Kemendikbud Ristek) kembali membuka pendaftaran Beasiswa Unggulan tahun 2025. Program ini menyediakan beasiswa penuh meliputi SPP, biaya hidup, dan tunjangan buku untuk mahasiswa berprestasi. Pendaftaran dibuka mulai 2 Januari hingga 28 Februari 2025 melalui laman resmi beasiswaunggulan.kemdikbud.go.id.",
    excerpt:
      "Beasiswa Unggulan Kemendikbud 2025 kini dibuka! Daftarkan diri kamu sebelum 28 Februari 2025.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    category: "nasional",
    is_featured: false,
    published_at: "2024-12-15T10:00:00.000Z",
    author_name: "Tim Redaksi",
  },
  {
    id: "news-4",
    title: "Perpustakaan Kampus Kini Buka 24 Jam Selama Masa UAS",
    slug: "perpustakaan-24-jam-uas",
    content:
      "Perpustakaan Pusat Universitas mengumumkan perpanjangan jam operasional menjadi 24 jam penuh selama masa Ujian Akhir Semester berlangsung. Fasilitas ruang baca, Wi-Fi, dan komputer tersedia untuk semua mahasiswa aktif. Harap membawa kartu mahasiswa untuk akses masuk di luar jam normal.",
    excerpt:
      "Perpustakaan kampus buka 24 jam selama UAS. Manfaatkan fasilitas Wi-Fi dan ruang baca untuk belajar.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    category: "kampus",
    is_featured: false,
    published_at: "2024-12-12T07:30:00.000Z",
    author_name: "UPT Perpustakaan",
  },
  {
    id: "news-5",
    title: "Mahasiswa Teknik Informatika Raih Juara 1 Hackathon Nasional",
    slug: "juara-hackathon-nasional",
    content:
      "Tim mahasiswa Teknik Informatika yang terdiri dari Reza, Dinda, dan Ahmad berhasil meraih juara pertama pada kompetisi Hackathon Nasional 2024 yang diselenggarakan oleh Google Developer Student Club Indonesia. Mereka mengembangkan aplikasi monitoring kesehatan berbasis AI yang berhasil mengalahkan 200 tim dari seluruh Indonesia.",
    excerpt:
      "Tim mahasiswa TI kami juara 1 Hackathon Nasional 2024! Bangga dengan pencapaian luar biasa ini.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    category: "umum",
    is_featured: false,
    published_at: "2024-12-10T14:00:00.000Z",
    author_name: "Humas Universitas",
  },
];

export const mockFeaturedNews: NewsItem = mockNewsList[0];
export const mockLatestNews: NewsItem[] = mockNewsList.slice(0, 3);

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const mockEvents: EventItem[] = [
  {
    id: "event-1",
    title: "Seminar Nasional Teknologi AI & Machine Learning 2025",
    description:
      "Seminar nasional menghadirkan pembicara dari Google, Gojek, dan akademisi terkemuka untuk membahas perkembangan AI dan penerapannya di industri. Terbuka untuk umum, gratis bagi mahasiswa aktif.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&q=80",
    location: "Auditorium Utama Gedung A",
    event_date: "2025-01-15T08:00:00.000Z",
    category: "seminar",
    requires_registration: true,
    registration_count: 142,
  },
  {
    id: "event-2",
    title: "Lomba Karya Tulis Ilmiah Mahasiswa (LKTIM) 2025",
    description:
      "Kompetisi karya tulis ilmiah tingkat universitas dengan total hadiah Rp 15.000.000. Kategori: Teknologi, Sosial Humaniora, dan Lingkungan. Pendaftaran tim dibuka hingga 10 Januari 2025.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
    location: "Gedung Rektorat Lt. 3",
    event_date: "2025-01-25T09:00:00.000Z",
    category: "kompetisi",
    requires_registration: true,
    registration_count: 58,
  },
  {
    id: "event-3",
    title: "Workshop Pengembangan Aplikasi Flutter untuk Pemula",
    description:
      "Workshop intensif 2 hari belajar membuat aplikasi mobile dengan Flutter dari nol. Peserta akan langsung membuat mini project dan mendapat sertifikat. Kuota terbatas 30 peserta.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    location: "Lab Komputer Gedung D, Lantai 2",
    event_date: "2025-01-20T08:30:00.000Z",
    category: "workshop",
    requires_registration: true,
    registration_count: 28,
  },
];

// ---------------------------------------------------------------------------
// Schedules — 5 days, 2-3 courses each
// day_of_week: 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat
// ---------------------------------------------------------------------------

export const mockSchedules: Schedule[] = [
  // Senin
  {
    id: "sched-1",
    course_name: "Algoritma dan Pemrograman",
    course_code: "IF2201",
    lecturer_name: "Dr. Budi Raharjo, M.Kom",
    room: "Ruang A101",
    day_of_week: 1,
    start_time: "07:30",
    end_time: "09:10",
    academic_year: "2022",
    semester: 5,
  },
  {
    id: "sched-2",
    course_name: "Basis Data Lanjut",
    course_code: "IF3301",
    lecturer_name: "Ir. Siti Rahayu, M.T",
    room: "Lab Komputer D204",
    day_of_week: 1,
    start_time: "10:00",
    end_time: "12:30",
    academic_year: "2022",
    semester: 5,
  },
  {
    id: "sched-3",
    course_name: "Kalkulus Lanjut",
    course_code: "MA1101",
    lecturer_name: "Prof. Ahmad Fauzi, Ph.D",
    room: "Ruang B202",
    day_of_week: 1,
    start_time: "13:00",
    end_time: "14:40",
    academic_year: "2022",
    semester: 5,
  },
  // Selasa
  {
    id: "sched-4",
    course_name: "Jaringan Komputer",
    course_code: "IF3401",
    lecturer_name: "Drs. Hendra Wijaya, M.Sc",
    room: "Ruang A201",
    day_of_week: 2,
    start_time: "08:00",
    end_time: "09:40",
    academic_year: "2022",
    semester: 5,
  },
  {
    id: "sched-5",
    course_name: "Rekayasa Perangkat Lunak",
    course_code: "IF3501",
    lecturer_name: "Dr. Dewi Kusuma, M.T",
    room: "Ruang C301",
    day_of_week: 2,
    start_time: "13:00",
    end_time: "15:30",
    academic_year: "2022",
    semester: 5,
  },
  // Rabu
  {
    id: "sched-6",
    course_name: "Kecerdasan Buatan",
    course_code: "IF4601",
    lecturer_name: "Dr. Rudi Hartono, M.Cs",
    room: "Ruang A103",
    day_of_week: 3,
    start_time: "07:30",
    end_time: "09:10",
    academic_year: "2022",
    semester: 5,
  },
  {
    id: "sched-7",
    course_name: "Praktikum Basis Data",
    course_code: "IF3301P",
    lecturer_name: "Asisten Lab",
    room: "Lab Komputer D101",
    day_of_week: 3,
    start_time: "10:00",
    end_time: "12:30",
    academic_year: "2022",
    semester: 5,
  },
  {
    id: "sched-8",
    course_name: "Statistika Terapan",
    course_code: "MA2201",
    lecturer_name: "Dr. Rina Puspita, M.Si",
    room: "Ruang B101",
    day_of_week: 3,
    start_time: "13:30",
    end_time: "15:10",
    academic_year: "2022",
    semester: 5,
  },
  // Kamis
  {
    id: "sched-9",
    course_name: "Algoritma dan Pemrograman",
    course_code: "IF2201",
    lecturer_name: "Dr. Budi Raharjo, M.Kom",
    room: "Lab Komputer D205",
    day_of_week: 4,
    start_time: "08:00",
    end_time: "10:30",
    academic_year: "2022",
    semester: 5,
  },
  {
    id: "sched-10",
    course_name: "Rekayasa Perangkat Lunak",
    course_code: "IF3501",
    lecturer_name: "Dr. Dewi Kusuma, M.T",
    room: "Ruang C201",
    day_of_week: 4,
    start_time: "13:00",
    end_time: "14:40",
    academic_year: "2022",
    semester: 5,
  },
  // Jumat
  {
    id: "sched-11",
    course_name: "Jaringan Komputer",
    course_code: "IF3401",
    lecturer_name: "Drs. Hendra Wijaya, M.Sc",
    room: "Lab Jaringan E101",
    day_of_week: 5,
    start_time: "07:30",
    end_time: "10:00",
    academic_year: "2022",
    semester: 5,
  },
  {
    id: "sched-12",
    course_name: "Kecerdasan Buatan",
    course_code: "IF4601",
    lecturer_name: "Dr. Rudi Hartono, M.Cs",
    room: "Ruang A103",
    day_of_week: 5,
    start_time: "10:30",
    end_time: "12:10",
    academic_year: "2022",
    semester: 5,
  },
];

// ---------------------------------------------------------------------------
// Attendance Sessions
// ---------------------------------------------------------------------------

const now = new Date();
const in60s = new Date(now.getTime() + 60_000);

export const mockAttendanceSessions: AttendanceSession[] = [
  {
    id: "session-1",
    title: "Kehadiran — Algoritma dan Pemrograman",
    course_name: "Algoritma dan Pemrograman",
    qr_token: "mock-qr-token-algo-001",
    qr_expires_at: in60s.toISOString(),
    is_active: true,
    created_by: "lecturer-mock-id-001",
    created_at: new Date(now.getTime() - 10 * 60_000).toISOString(),
  },
  {
    id: "session-2",
    title: "Kehadiran — Basis Data Lanjut",
    course_name: "Basis Data Lanjut",
    qr_token: "mock-qr-token-db-002",
    qr_expires_at: in60s.toISOString(),
    is_active: true,
    created_by: "lecturer-mock-id-002",
    created_at: new Date(now.getTime() - 5 * 60_000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Attendance Records (today's history)
// ---------------------------------------------------------------------------

export const mockAttendanceHistory: Array<{
  record: AttendanceRecord;
  session: AttendanceSession;
}> = [
  {
    record: {
      id: "record-1",
      session_id: "session-1",
      user_id: "mock-user-id-123",
      scanned_at: new Date(now.getTime() - 9 * 60_000).toISOString(),
      status: "present",
    },
    session: mockAttendanceSessions[0],
  },
  {
    record: {
      id: "record-2",
      session_id: "session-2",
      user_id: "mock-user-id-123",
      scanned_at: new Date(now.getTime() - 4 * 60_000).toISOString(),
      status: "late",
    },
    session: mockAttendanceSessions[1],
  },
  {
    record: {
      id: "record-3",
      session_id: "session-old-1",
      user_id: "mock-user-id-123",
      scanned_at: new Date(now.getTime() - 90 * 60_000).toISOString(),
      status: "present",
    },
    session: {
      id: "session-old-1",
      title: "Kehadiran — Kecerdasan Buatan",
      course_name: "Kecerdasan Buatan",
      qr_token: "expired-token-ai-000",
      qr_expires_at: new Date(now.getTime() - 29 * 60_000).toISOString(),
      is_active: false,
      created_by: "lecturer-mock-id-003",
      created_at: new Date(now.getTime() - 90 * 60_000).toISOString(),
    },
  },
];
