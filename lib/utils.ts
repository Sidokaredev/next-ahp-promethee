import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatterDateIndonesian = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const statuStyler = (status: string) => {
  switch (status) {
    case "berlangsung":
      return "bg-amber-100 text-amber-700 border-amber-200"

    case "selesai":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      break;
  }
}
