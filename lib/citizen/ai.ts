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
}
