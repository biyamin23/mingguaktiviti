import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date string (YYYY-MM-DD) into friendly Malaysian date string
 * Example: "2026-09-13" -> "13 September 2026"
 */
export function formatMalayDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const monthsMalay = [
      "Januari", "Februari", "Mac", "April", "Mei", "Jun",
      "Julai", "Ogos", "September", "Oktober", "November", "Disember"
    ];
    return `${day} ${monthsMalay[month - 1]} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format time string (HH:MM:SS or HH:MM) into friendly Malaysian format
 * Example: "08:00:00" -> "8:00 pagi", "14:30" -> "2:30 petang", "20:00" -> "8:00 malam"
 */
export function formatMalayTime(timeStr: string): string {
  if (!timeStr) return "";
  try {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] || "00";
    if (isNaN(hours)) return timeStr;

    let period = "pagi";
    if (hours >= 12 && hours < 14) {
      period = "tengah hari";
    } else if (hours >= 14 && hours < 19) {
      period = "petang";
    } else if (hours >= 19 || hours < 1) {
      period = "malam";
    }

    let displayHours = hours;
    if (hours > 12) {
      displayHours = hours - 12;
    } else if (hours === 0) {
      displayHours = 12;
    }

    return `${displayHours}:${minutes} ${period}`;
  } catch {
    return timeStr;
  }
}

/**
 * Format start and end time range
 * Example: ("08:00", "10:00") -> "8:00 pagi – 10:00 pagi"
 */
export function formatTimeRange(start: string, end: string): string {
  return `${formatMalayTime(start)} – ${formatMalayTime(end)}`;
}

/**
 * Format bytes to readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
