// TanStack Query key factory — centralised to avoid string typos across hooks
// Pattern: each entity has an "all" key and optional detail/filtered variants

export const profileKeys = {
  all: ["profiles"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  detail: (id: string) => [...profileKeys.all, id] as const,
};

export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...newsKeys.lists(), filters] as const,
  details: () => [...newsKeys.all, "detail"] as const,
  detail: (id: string) => [...newsKeys.details(), id] as const,
};

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  detail: (id: string) => [...eventKeys.all, id] as const,
};

export const attendanceKeys = {
  all: ["attendance"] as const,
  sessions: () => [...attendanceKeys.all, "sessions"] as const,
  session: (id: string) => [...attendanceKeys.sessions(), id] as const,
  records: (userId: string) =>
    [...attendanceKeys.all, "records", userId] as const,
  todayRecords: (userId: string) =>
    [...attendanceKeys.records(userId), "today"] as const,
  /** Shorthand used by useTodayAttendance — userId filled inside the hook */
  today: () => [...attendanceKeys.all, "today"] as const,
};

export const scheduleKeys = {
  all: ["schedules"] as const,
  week: (userId: string) => [...scheduleKeys.all, "week", userId] as const,
  today: (userId: string) => [...scheduleKeys.all, "today", userId] as const,
  byMajor: (major?: string, yearEntry?: number) =>
    [...scheduleKeys.all, "major", major, yearEntry] as const,
};
