import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge.
 * This ensures Tailwind classes are properly merged without conflicts.
 *
 * Usage:
 * ```tsx
 * cn("px-4 py-2", isActive && "bg-primary", className)
 * ```
 */
/**
 * Formats a number as Naira (₦) with standard formatting.
 * Never uses the "k" format.
 */
export function formatNaira(amount: number, includeDecimals = false) {
  const rounded = Math.floor(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₦${formatted}${includeDecimals ? ".00" : ""}`;
}

/**
 * Returns a dynamic affirmation based on the user's archetype.
 */
export function getArchetypeAffirmation(archetype?: string | null) {
  const affirmations: Record<string, string> = {
    "bloom-saver": "Every naira you save is a win, celebrate it. ✨",
    "ritual-builder": "Soft life is intentional spending, not no spending. 🧘‍♀️",
    "soft-strategist": "Your future self is grateful for today's choices. 💰",
    "vault-visionary": "You're building wealth quietly and peacefully. 🌸",
    "balanced": "Your money is getting clearer, sis. Keep going. 💜",
  };
  return affirmations[archetype || "balanced"] || affirmations["balanced"];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
