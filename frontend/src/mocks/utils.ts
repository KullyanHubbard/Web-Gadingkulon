/** Utilitas untuk mensimulasikan API network di mode mock. */

/** Delay buatan supaya loading state terlihat seperti request nyata. */
export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
