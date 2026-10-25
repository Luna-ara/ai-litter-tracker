/* eslint-disable @typescript-eslint/no-explicit-any -- responses come from lane endpoints that may not exist yet, so they are checked at runtime */
// End-to-end check of the demo path through the API (docs/CONTRACTS.md §6), plus a scan for
// pages that still show a placeholder. Run against a server started with the seeded database:
//
//   npm run db:reset && npm run dev        # (or build + start)
//   npm run verify:demo                    # another terminal; BASE_URL=... to point elsewhere
//
// Each failure names the owning lane and task, so after merging you know who to ping.

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const PASSWORD = "demo1234";

type Result = { ok: boolean | null; step: string; owner: string; detail?: string };
const results: Result[] = [];

function record(ok: boolean | null, step: string, owner: string, detail?: string) {
  results.push({ ok, step, owner, detail });
  const mark = ok === null ? "–" : ok ? "✓" : "✗";
  console.log(`${mark} ${step}${detail ? `  (${detail})` : ""}${ok === false ? `  → ${owner}` : ""}`);
}

class Session {
  private cookie = "";

  async request(method: string, path: string, body?: unknown): Promise<{ status: number; data: any; text: string }> {
    const isForm = body instanceof FormData;
    const res = await fetch(BASE + path, {
      method,
      redirect: "manual",
      headers: {
        ...(this.cookie ? { cookie: this.cookie } : {}),
        ...(body !== undefined && !isForm ? { "content-type": "application/json" } : {}),
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
    const setCookie = res.headers.get("set-cookie");
    const match = setCookie?.match(/cb_session=([^;]*)/);
    if (match) this.cookie = match[1] ? `cb_session=${match[1]}` : "";
    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {}
    return { status: res.status, data, text };
  }

  async login(email: string) {
    const res = await this.request("POST", "/api/auth/login", { email, password: PASSWORD });
    if (res.status !== 200) throw new Error(`login ${email} → ${res.status}`);
  }

  async upload(): Promise<string | null> {
    // A tiny JPEG header is enough: the upload route checks the declared type and size.
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10])], { type: "image/jpeg" }), "t.jpg");
    const res = await this.request("POST", "/api/uploads", form);
    return res.status === 201 ? res.data?.url ?? null : null;
  }
}

const CARTER = "Carter (foundation)";
const ROHAN = (task: string) => `Rohan · ${task}`;
const LUNA = (task: string) => `Luna · ${task}`;

async function checkPages(session: Session, owner: (task: string) => string, pages: [string, string][]) {
  for (const [path, task] of pages) {
    const res = await session.request("GET", path);
    if (res.status !== 200) record(false, `page ${path}`, owner(task), `HTTP ${res.status}`);
    else if (res.text.includes("Being built by")) record(false, `page ${path}`, owner(task), "still a placeholder");
    else record(true, `page ${path}`, owner(task));
  }
}

async function main() {
  console.log(`Verifying the demo path against ${BASE}\n`);

  try {
    await fetch(BASE + "/login");
  } catch {
    console.error(`Can't reach ${BASE}. Start the app first: npm run db:reset && npm run dev`);
    process.exit(2);
  }

  const city = new Session();
  const alex = new Session();
  try {
    await city.login("city@civicbounty.test");
    await alex.login("alex@civicbounty.test");
    record(true, "demo logins (city + alex)", CARTER);
  } catch (err) {
    record(false, "demo logins", CARTER, `${err}. Did you run npm run db:reset?`);
    return;
  }

  // Role gating
  const forbidden = await alex.request("POST", "/api/hotspots", {});
  record(forbidden.status === 403, "citizen can't create hotspots", LUNA("Task 3"), `HTTP ${forbidden.status}, want 403`);

  // Uploads
  const beforeUrl = await alex.upload();
  const afterUrl = await alex.upload();
  record(Boolean(beforeUrl && afterUrl), "photo uploads", CARTER);
  if (!beforeUrl || !afterUrl) return;

  // Government: create a hotspot
  const lat = 37.7694;
  const lng = -122.4862;
  const created = await city.request("POST", "/api/hotspots", {
    title: "Verify-demo test hotspot",
    neighborhood: "Riverside",
    description: "Created by npm run verify:demo",
    lat,
    lng,
    severity: "medium",
    bountyCents: 2500,
  });
  const hotspot = created.data?.hotspot;
  record(created.status === 201 && hotspot?.status === "unfunded", "create hotspot → unfunded", LUNA("Task 3"), `HTTP ${created.status}`);

  // Government: fund it
  let fundedId: string | null = null;
  if (hotspot) {
    const checkout = await city.request("POST", "/api/payments/checkout", { hotspotId: hotspot.id });
    const url: string | undefined = checkout.data?.url;
    record(checkout.status === 200 && Boolean(url), "start bounty checkout", LUNA("Task 4"), `HTTP ${checkout.status}`);
    const simulated = url?.match(/session_id=(sim_[\w-]+)/)?.[1];
    if (simulated) {
      const confirm = await city.request("POST", "/api/payments/confirm", { sessionId: simulated, hotspotId: hotspot.id });
      const ok = confirm.status === 200 && confirm.data?.hotspot?.status === "open";
      record(ok, "confirm funding → open", LUNA("Task 4"), `HTTP ${confirm.status}`);
      if (ok) fundedId = hotspot.id;
    } else if (url) {
      record(null, "confirm funding", LUNA("Task 4"), "real Stripe Checkout: pay it in the browser to test; using a seeded hotspot below");
    }
  }

  // Fall back to a seeded open hotspot (found via the /citizen list) so the citizen and review
  // steps still get tested. Its coordinates aren't in the HTML, so try each seeded location;
  // the wrong ones are rejected by the geofence (422) without side effects.
  let targetId = fundedId;
  let candidates = [{ lat, lng }];
  if (!targetId) {
    const page = await alex.request("GET", "/citizen");
    targetId = page.text.match(/\/citizen\/hotspots\/([0-9a-f-]{36})/)?.[1] ?? null;
    candidates = [
      { lat: 37.7694, lng: -122.4862 },
      { lat: 37.7599, lng: -122.4148 },
      { lat: 37.7847, lng: -122.4141 },
    ];
  }

  // Citizen: submit a cleanup
  let submissionId: string | null = null;
  if (!targetId) {
    record(false, "submit cleanup", ROHAN("Task 1/4"), "no open hotspot found (create/fund failed and /citizen lists none)");
  } else {
    let target = candidates[0];
    let location = { lat: target.lat + 0.00005, lng: target.lng, accuracy: 8 };
    let submitted = await alex.request("POST", "/api/submissions", { hotspotId: targetId, beforeUrl, afterUrl, location });
    for (const candidate of candidates.slice(1)) {
      if (submitted.status !== 422) break;
      target = candidate;
      location = { lat: target.lat + 0.00005, lng: target.lng, accuracy: 8 };
      submitted = await alex.request("POST", "/api/submissions", { hotspotId: targetId, beforeUrl, afterUrl, location });
    }
    const s = submitted.data?.submission;
    const scoreOk = typeof s?.aiScore === "number" && s.aiScore >= 85 && s.aiScore <= 97;
    record(
      submitted.status === 201 && s?.status === "pending" && scoreOk,
      "submit cleanup → pending + AI score",
      ROHAN("Task 4"),
      `HTTP ${submitted.status}${s ? `, score ${s.aiScore}` : ""}`,
    );
    if (submitted.status === 201) submissionId = s.id;

    const again = await alex.request("POST", "/api/submissions", { hotspotId: targetId, beforeUrl, afterUrl, location });
    record(again.status === 409, "second submit on same hotspot → 409", ROHAN("Task 4"), `HTTP ${again.status}`);

    const far = await alex.request("POST", "/api/submissions", {
      hotspotId: targetId,
      beforeUrl,
      afterUrl,
      location: { lat: target.lat + 1, lng: target.lng, accuracy: 8 },
    });
    record([409, 422].includes(far.status), "submit far away is rejected", ROHAN("Task 4"), `HTTP ${far.status}`);
  }

  // Government: flag requires a note, approve pays out
  if (submissionId) {
    const noNote = await city.request("PATCH", `/api/submissions/${submissionId}/review`, { action: "flag" });
    record(noNote.status === 400, "flag without a note → 400", LUNA("Task 6"), `HTTP ${noNote.status}`);

    const approved = await city.request("PATCH", `/api/submissions/${submissionId}/review`, { action: "approve" });
    const payout = approved.data?.payout;
    record(
      approved.status === 200 && approved.data?.submission?.status === "paid" && ["sent", "simulated"].includes(payout?.status),
      "approve → paid + payout recorded",
      LUNA("Task 6"),
      `HTTP ${approved.status}${payout ? `, payout ${payout.status}` : ""}`,
    );
    if (payout?.status === "simulated" && process.env.STRIPE_SECRET_KEY) {
      record(null, "Stripe transfer", CARTER, "payout was simulated even though Stripe keys are set: check the server log");
    }

    const twice = await city.request("PATCH", `/api/submissions/${submissionId}/review`, { action: "approve" });
    record(twice.status === 409, "approving twice → 409", LUNA("Task 6"), `HTTP ${twice.status}`);
  }

  // Pages: anything still showing a placeholder
  console.log("");
  await checkPages(alex, ROHAN, [
    ["/citizen", "Task 1"],
    ["/citizen/earnings", "Task 7"],
  ]);
  if (targetId) {
    await checkPages(alex, ROHAN, [
      [`/citizen/hotspots/${targetId}`, "Task 2"],
    ]);
  }
  if (submissionId) await checkPages(alex, ROHAN, [[`/citizen/submissions/${submissionId}`, "Task 6"]]);
  await checkPages(city, LUNA, [
    ["/gov", "Task 2"],
    ["/gov/hotspots/new", "Task 3"],
    ["/gov/review", "Task 5"],
  ]);
  if (hotspot) await checkPages(city, LUNA, [[`/gov/hotspots/${hotspot.id}`, "Task 4"]]);
  if (submissionId) await checkPages(city, LUNA, [[`/gov/review/${submissionId}`, "Task 6"]]);
}

main()
  .catch((err) => record(false, "verify script crashed", CARTER, String(err)))
  .finally(() => {
    const failed = results.filter((r) => r.ok === false);
    console.log(`\n${results.filter((r) => r.ok).length} passed, ${failed.length} failed, ${results.filter((r) => r.ok === null).length} skipped`);
    if (failed.length) {
      const owners = [...new Set(failed.map((r) => r.owner))];
      console.log(`Needs attention: ${owners.join("; ")}`);
      console.log("Run `npm run db:reset` before running this again (it changes data).");
      process.exit(1);
    }
    console.log("Demo path is green. Run `npm run db:reset` before the real demo.");
  });
