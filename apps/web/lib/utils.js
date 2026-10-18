import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateOrderNumber(shopCode) {
  const today = new Date();
  const datePart = today.toISOString().split("T")[0].replace(/-/g, ""); // Format: YYYYMMDD
  const timePart = today.toTimeString().split(" ")[0].replace(/:/g, ""); // Format: HHMMSS
  return `ORD${datePart}${shopCode}${timePart}`;
}
