<<<<<<< HEAD
import "server-only";

const reasons = [
  "Litter visible in the before photo is no longer present. Ground surface is clear.",
  "The cleanup area appears free of scattered waste compared with the before photo.",
  "Visible debris has been removed, leaving the surrounding area clear and tidy.",
];

/** Demo simulation: hashes URL strings; does not analyze the actual photos. */
export async function fakeVerify(
  beforeUrl: string,
  afterUrl: string,
): Promise<{ score: number; reason: string }> {
  let hash = 0;
  for (const character of beforeUrl + afterUrl) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 1500));
  return { score: 85 + (hash % 13), reason: reasons[hash % reasons.length] };
=======
// Simulated AI verification (agreed for the demo). Deterministic so the demo never surprises us.

const REASONS = [
  "Litter visible in the before photo is no longer present. Ground surface is clear.",
  "Before and after photos match the same location. Debris and bags have been removed.",
  "The area shows a clear reduction in litter. Remaining surfaces look clean and undisturbed.",
];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export async function fakeVerify(beforeUrl: string, afterUrl: string): Promise<{ score: number; reason: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const h = hash(beforeUrl + afterUrl);
  return { score: 85 + (h % 13), reason: REASONS[h % REASONS.length] };
>>>>>>> origin/main
}
