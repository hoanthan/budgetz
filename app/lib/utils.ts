import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  options: Intl.NumberFormatOptions,
) {
  const formatter = new Intl.NumberFormat(window.navigator.language, {
    currencyDisplay: "code",
    maximumFractionDigits: 2,
    style: "currency",
    compactDisplay: "short",
    notation: "compact",
    ...options,
  });

  return formatter.format(value);
}

export function formatDate(
  date: number | string | Date,
  token = "LLL dd, y @ HH:mm",
) {
  return format(date instanceof Date ? date : new Date(date), token);
}
