#!/usr/bin/env node
// Usage: npm run check:lane -- <carter|rohan|luna>
// Lists every file changed on this branch (committed vs origin/main, plus uncommitted)
// and fails if any is outside the lane's paths from docs/CONTRACTS.md §2.
import { execSync } from "node:child_process";

const LANES = {
  rohan: [
    /^app\/citizen\//,
    /^app\/api\/submissions\/route\.ts$/,
    /^lib\/citizen\//,
    /^components\/citizen\//,
    /^public\/seed\//,
  ],
  luna: [
    /^app\/gov\//,
    /^app\/api\/hotspots\//,
    /^app\/api\/submissions\/\[id\]\//,
    /^app\/api\/payments\//,
    /^lib\/gov\//,
    /^components\/gov\//,
  ],
};

const lane = process.argv[2];
if (lane === "carter") {
  console.log("Carter owns every shared file; nothing to check.");
  process.exit(0);
}
if (!LANES[lane]) {
  console.error("Usage: npm run check:lane -- <carter|rohan|luna>");
  process.exit(2);
}

const run = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
};

run("git fetch --quiet origin main");
const changed = new Set(
  [
    run("git diff --name-only origin/main...HEAD"),
    run("git diff --name-only HEAD"),
    run("git ls-files --others --exclude-standard"),
  ]
    .join("\n")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean),
);

const outside = [...changed].filter((f) => !LANES[lane].some((re) => re.test(f)));

console.log(`${changed.size} changed file(s) for lane "${lane}".`);
if (outside.length) {
  console.error("\nThese files are OUTSIDE your lane. Revert them, or ask Carter for a CONTRACT CHANGE:");
  for (const f of outside) console.error(`  ✗ ${f}`);
  console.error(`\nUndo a change to a tracked file: git checkout origin/main -- <file>`);
  process.exit(1);
}
console.log("✓ All changes are inside your lane.");
