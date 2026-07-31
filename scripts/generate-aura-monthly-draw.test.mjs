import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  CHARACTER_SET,
  MATCH_LENGTH,
  createDraw,
  generateWinningSuffix,
  getClaimDeadline,
  getPreviousPeriod,
  runDraw,
  validateDraw,
} from "./generate-aura-monthly-draw.mjs";

async function withTemporaryDirectory(callback) {
  const directory = await mkdtemp(join(tmpdir(), "aura-monthly-draw-"));
  try {
    return await callback(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("calculates the previous month using Asia/Taipei", () => {
  assert.equal(
    getPreviousPeriod(new Date("2026-08-01T00:05:00+08:00")),
    "2026-07",
  );
  assert.equal(
    getClaimDeadline(new Date("2026-08-01T00:05:00+08:00")),
    "2026-08-31T23:59:59+08:00",
  );
});

test("handles the January cross-year boundary", () => {
  assert.equal(
    getPreviousPeriod(new Date("2027-01-01T00:05:00+08:00")),
    "2026-12",
  );
});

test("generates exactly three legal Base36 characters", () => {
  for (let index = 0; index < 256; index += 1) {
    const suffix = generateWinningSuffix();
    assert.equal(suffix.length, MATCH_LENGTH);
    assert.match(suffix, /^[0-9A-Z]{3}$/);
    for (const character of suffix) {
      assert.equal(CHARACTER_SET.includes(character), true);
    }
  }
});

test("creates a complete schema-valid draw", () => {
  const draw = createDraw(new Date("2026-08-01T00:05:00+08:00"));
  assert.deepEqual(validateDraw(draw), []);
  assert.deepEqual(Object.keys(draw), [
    "schemaVersion",
    "period",
    "winningSuffix",
    "characterSet",
    "matchLength",
    "reward",
    "drawnAt",
    "claimDeadline",
  ]);
  assert.deepEqual(draw.reward, {
    type: "theme-color",
    id: "theme-ocean-blue",
    name: "深海藍",
  });
});

test("rejects unexpected public fields", () => {
  const draw = createDraw(new Date("2026-08-01T00:05:00+08:00"));
  draw.userId = "must-not-be-public";
  assert.match(
    validateDraw(draw).join(" "),
    /missing or unexpected fields/,
  );
});

test("dry-run does not create or modify files", async () => {
  await withTemporaryDirectory(async (directory) => {
    const outputDirectory = join(directory, "aura-lottery");
    const before = await readdir(directory);
    const result = await runDraw({
      mode: "dry-run",
      now: new Date("2026-08-01T00:05:00+08:00"),
      outputDirectory,
    });
    const after = await readdir(directory);

    assert.equal(result.status, "dry-run");
    assert.equal(result.changed, false);
    assert.deepEqual(after, before);
  });
});

test("publish creates the period JSON and latest.json atomically", async () => {
  await withTemporaryDirectory(async (directory) => {
    const outputDirectory = join(directory, "aura-lottery");
    const result = await runDraw({
      mode: "publish",
      now: new Date("2026-08-01T00:05:00+08:00"),
      outputDirectory,
    });
    const period = JSON.parse(await readFile(result.periodPath, "utf8"));
    const latest = JSON.parse(await readFile(result.latestPath, "utf8"));
    const drawDirectoryEntries = await readdir(
      join(outputDirectory, "draws"),
    );
    const outputEntries = await readdir(outputDirectory);

    assert.equal(result.status, "published");
    assert.equal(result.changed, true);
    assert.deepEqual(period, result.draw);
    assert.deepEqual(latest, period);
    assert.deepEqual(validateDraw(period), []);
    assert.deepEqual(drawDirectoryEntries, ["2026-07.json"]);
    assert.deepEqual(outputEntries.sort(), ["draws", "latest.json"]);
  });
});

test("a second publish for the same period never redraws or rewrites", async () => {
  await withTemporaryDirectory(async (directory) => {
    const outputDirectory = join(directory, "aura-lottery");
    const now = new Date("2027-01-01T00:05:00+08:00");
    const first = await runDraw({ mode: "publish", now, outputDirectory });
    const periodBefore = await readFile(first.periodPath, "utf8");
    const latestBefore = await readFile(first.latestPath, "utf8");
    const second = await runDraw({ mode: "publish", now, outputDirectory });
    const periodAfter = await readFile(first.periodPath, "utf8");
    const latestAfter = await readFile(first.latestPath, "utf8");

    assert.equal(second.status, "already-exists");
    assert.equal(second.changed, false);
    assert.equal(second.draw.winningSuffix, first.draw.winningSuffix);
    assert.equal(periodAfter, periodBefore);
    assert.equal(latestAfter, latestBefore);
  });
});

test("publishing an older period does not move latest.json backwards", async () => {
  await withTemporaryDirectory(async (directory) => {
    const outputDirectory = join(directory, "aura-lottery");
    await runDraw({
      mode: "publish",
      now: new Date("2026-09-01T00:05:00+08:00"),
      outputDirectory,
    });
    await runDraw({
      mode: "publish",
      now: new Date("2026-08-01T00:05:00+08:00"),
      outputDirectory,
    });
    const latest = JSON.parse(
      await readFile(join(outputDirectory, "latest.json"), "utf8"),
    );

    assert.equal(latest.period, "2026-08");
  });
});

test("rejects unsupported modes with a failing promise", async () => {
  await assert.rejects(
    runDraw({ mode: "unexpected" }),
    /Unsupported mode/,
  );
});
