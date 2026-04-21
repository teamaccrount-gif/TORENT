import { prisma } from "../lib/prisma.js";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const TAGS = [
  "in/r1/a1/cgs1/cng1/comp1/ft1/pv",
  "in/r1/a1/cgs1/cng1/comp1/ft1/lp",
  "in/r1/a1/cgs1/cng2/comp1/ft1/pv",
  "in/r1/a2/cgs2/cng2/comp2/ft2/pv",
];

const LIVE_INTERVAL_MS = 15_000;

const VALUE_PROFILES = {
  pv:      { base: 50,  drift: 2  },
  lp:      { base: 200, drift: 10 },
  default: { base: 30,  drift: 3  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function parseTag(tag) {
  const [country, region, area, cgs, station, compressor, point, parameter] = tag.split("/");
  return { tag, country, region, area, cgs, station, compressor, point, parameter };
}

function nextValue(current, drift) {
  const change = (Math.random() - 0.5) * drift;
  return parseFloat((current + change).toFixed(4));
}

// ─── STARTUP SETUP ───────────────────────────────────────────────────────────

async function seedHierarchyForTag(parts) {
  const { country, region, area, cgs, station, compressor } = parts;

  await prisma.country.upsert({
    where: { name: country },
    update: {},
    create: { name: country },
  });

  await prisma.region.upsert({
    where: { name_country: { name: region, country } },
    update: {},
    create: { name: region, country },
  });

  await prisma.area.upsert({
    where: { name_region: { name: area, region } },
    update: {},
    create: { name: area, region, country },
  });

  await prisma.cgs.upsert({
    where: { name_area: { name: cgs, area } },
    update: {},
    create: { name: cgs, area, region, country },
  });

  await prisma.station.upsert({
    where: { name_cgs: { name: station, cgs } },
    update: {},
    create: { name: station, cgs, area, region, country },
  });

  await prisma.compressor.upsert({
    where: { name_station: { name: compressor, station } },
    update: {},
    create: { name: compressor, station, cgs, area, region, country },
  });
}

async function setupDatabase(allParts) {
  console.log("Setting up hierarchy and telemetry data...");

  const seenHierarchyKeys = new Set();
  for (const parts of allParts) {
    const key = `${parts.country}/${parts.region}/${parts.area}/${parts.cgs}/${parts.station}/${parts.compressor}`;
    if (!seenHierarchyKeys.has(key)) {
      seenHierarchyKeys.add(key);
      await seedHierarchyForTag(parts);
    }
  }

  await prisma.telemetryData.createMany({
    data: allParts.map(({ tag, country, region, area, cgs, station, compressor, point, parameter }) => ({
      tag, country, region, area, cgs, station, compressor, point, parameter,
    })),
    skipDuplicates: true,
  });

  console.log("Setup complete ✅");
}

// ─── LIVE GENERATOR ───────────────────────────────────────────────────────────

async function startLiveGenerator(telemetryMap) {
  const currentValues = new Map(
    TAGS.map((tag) => {
      const { parameter } = parseTag(tag);
      const profile = VALUE_PROFILES[parameter] ?? VALUE_PROFILES.default;
      return [tag, profile.base];
    })
  );

  console.log(`Live generator started — inserting every ${LIVE_INTERVAL_MS / 1000}s (Ctrl+C to stop)\n`);

  setInterval(async () => {
    try {
      // Each tag is processed individually with its own timestamp —
      // mirrors how a real MQTT broker publishes each message separately
      const rows = TAGS.map((tag) => {
        const { parameter } = parseTag(tag);
        const profile       = VALUE_PROFILES[parameter] ?? VALUE_PROFILES.default;
        const value         = nextValue(currentValues.get(tag), profile.drift);

        currentValues.set(tag, value);

        return {
          telemetry_id: telemetryMap.get(tag),
          value,
          quality:   192,
          timestamp: new Date(), // called per tag, so each gets its own moment
        };
      });

      await prisma.$executeRaw`
        INSERT INTO "History" (telemetry_id, value, quality, timestamp)
        SELECT
          unnest(${rows.map((r) => r.telemetry_id)}::int[]),
          unnest(${rows.map((r) => r.value)}::float[]),
          unnest(${rows.map((r) => r.quality)}::int[]),
          unnest(${rows.map((r) => r.timestamp)}::timestamp[])
      `;

      console.log(`[tick] Inserted ${rows.length} rows — timestamps range: ${rows[0].timestamp.toISOString()} → ${rows.at(-1).timestamp.toISOString()}`);
    } catch (err) {
      console.error("Insert error:", err.message);
    }
  }, LIVE_INTERVAL_MS);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const allParts = TAGS.map(parseTag);

  await setupDatabase(allParts);

  const telemetryRows = await prisma.telemetryData.findMany({
    where: { tag: { in: TAGS } },
    select: { id: true, tag: true },
  });
  const telemetryMap = new Map(telemetryRows.map((r) => [r.tag, r.id]));

  await startLiveGenerator(telemetryMap);
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});