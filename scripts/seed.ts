import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";
import { db } from "@/lib/db";
import { hotspots, users } from "@/db/schema";

// Demo data from docs/CONTRACTS.md §7. Every password is "demo1234".

export async function seed() {
  const passwordHash = bcrypt.hashSync("demo1234", 10);

  const [city] = await db
    .insert(users)
    .values([
      { email: "city@civicbounty.test", name: "Parks Department", role: "government", passwordHash },
      { email: "inspector@civicbounty.test", name: "Dana Inspector", role: "government", passwordHash },
      {
        email: "alex@civicbounty.test",
        name: "Alex Rivera",
        role: "citizen",
        passwordHash,
        stripeAccountId: process.env.DEMO_CITIZEN_STRIPE_ACCOUNT_ID || null,
      },
      { email: "sam@civicbounty.test", name: "Sam Chen", role: "citizen", passwordHash },
    ])
    .returning();

  await db.insert(hotspots).values([
    {
      title: "Overflowing trash by the creek trail",
      neighborhood: "Riverside",
      description: "Bags and loose litter piled around the bin at the trailhead.",
      lat: 37.7694,
      lng: -122.4862,
      severity: "medium",
      bountyCents: 2500,
      status: "open",
      beforeImageUrl: "/seed/hotspot-1.jpg",
      createdBy: city.id,
    },
    {
      title: "Bottles and wrappers at the bus stop",
      neighborhood: "Mission",
      description: "Glass bottles and food wrappers under the bench.",
      lat: 37.7599,
      lng: -122.4148,
      severity: "small",
      bountyCents: 1000,
      status: "open",
      beforeImageUrl: "/seed/hotspot-2.jpg",
      createdBy: city.id,
    },
    {
      title: "Dumped furniture in the alley",
      neighborhood: "Tenderloin",
      description: "A broken chair, a mattress and loose debris blocking half the alley.",
      lat: 37.7847,
      lng: -122.4141,
      severity: "large",
      bountyCents: 5000,
      status: "open",
      beforeImageUrl: "/seed/hotspot-3.jpg",
      createdBy: city.id,
    },
    {
      title: "Litter along the playground fence",
      neighborhood: "Sunset",
      description: "Wind-blown litter caught along the fence line.",
      lat: 37.7535,
      lng: -122.4946,
      severity: "small",
      bountyCents: 1000,
      status: "unfunded",
      beforeImageUrl: "/seed/hotspot-4.jpg",
      createdBy: city.id,
    },
  ]);

  console.log("Seeded 4 users and 4 hotspots (password: demo1234)");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
