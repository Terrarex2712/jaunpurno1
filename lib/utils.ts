import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, letting later Tailwind utilities win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-IN");

/** 1245 -> "1,245" using the Indian grouping convention. */
export function formatCount(value: number): string {
  return NUMBER_FORMAT.format(value);
}

/** "Badlapur Blasters" -> "BB". Used for the monogram chips. */
export function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** Fixed locale and timezone so server and client always agree. */
export function formatDate(value: Date): string {
  return DATE_FORMAT.format(value);
}
