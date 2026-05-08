import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

/**
 * Format a date to Indonesian long format.
 * Example: "13 Nov 2024"
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMM yyyy", { locale: localeId });
};

/**
 * Format a date to HH:mm time string.
 * Example: "09:00"
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm");
};

// Day name map — uses 1-based index consistent with JS getDay() adjusted to Mon=1
const DAY_NAMES: Record<number, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

/**
 * Convert a day-of-week number (1–7) to its Indonesian name.
 * 1 → "Senin", 2 → "Selasa", ..., 7 → "Minggu"
 */
export const getDayName = (dayOfWeek: number): string => {
  return DAY_NAMES[dayOfWeek] ?? "—";
};

/**
 * Generate initials from a full name.
 * Example: "Akbar Himawan" → "AH", "Budi" → "B"
 */
export const generateInitials = (name: string): string => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
};

/**
 * Truncate a string and append ellipsis if it exceeds maxLength.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
};
