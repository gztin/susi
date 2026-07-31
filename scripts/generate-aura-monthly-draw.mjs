import { randomInt, randomUUID } from "node:crypto";
import {
  appendFile,
  link,
  mkdir,
  open,
  readFile,
  rename,
  unlink,
} from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const CHARACTER_SET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const MATCH_LENGTH = 3;
export const TIME_ZONE = "Asia/Taipei";
export const REWARD = Object.freeze({
  type: "theme-color",
  id: "theme-ocean-blue",
  name: "深海藍",
});

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIRECTORY, "..");
const DEFAULT_OUTPUT_DIRECTORY = resolve(PROJECT_ROOT, "aura-lottery");
const DRAW_KEYS = [
  "characterSet",
  "claimDeadline",
  "drawnAt",
  "matchLength",
  "period",
  "reward",
  "schemaVersion",
  "winningSuffix",
];
const REWARD_KEYS = ["id", "name", "type"];
const PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const TAIPEI_ISO_PATTERN =
  /^\d{4}-(0[1-9]|1[0-2])-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\+08:00$/;

function pad(value) {
  return String(value).padStart(2, "0");
}

export function getTaipeiDateParts(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("A valid Date is required.");
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const values = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

export function getPreviousPeriod(date = new Date()) {
  const { year, month } = getTaipeiDateParts(date);
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return `${previousYear}-${pad(previousMonth)}`;
}

export function formatTaipeiIso(date = new Date()) {
  const parts = getTaipeiDateParts(date);
  return [
    `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`,
    `T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}+08:00`,
  ].join("");
}

export function getClaimDeadline(date = new Date()) {
  const { year, month } = getTaipeiDateParts(date);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${pad(month)}-${pad(lastDay)}T23:59:59+08:00`;
}

export function generateWinningSuffix() {
  return Array.from(
    { length: MATCH_LENGTH },
    () => CHARACTER_SET[randomInt(CHARACTER_SET.length)],
  ).join("");
}

export function createDraw(date = new Date()) {
  return {
    schemaVersion: 1,
    period: getPreviousPeriod(date),
    winningSuffix: generateWinningSuffix(),
    characterSet: CHARACTER_SET,
    matchLength: MATCH_LENGTH,
    reward: { ...REWARD },
    drawnAt: formatTaipeiIso(date),
    claimDeadline: getClaimDeadline(date),
  };
}

export function validateDraw(draw) {
  const errors = [];

  if (!draw || typeof draw !== "object" || Array.isArray(draw)) {
    return ["Draw must be a JSON object."];
  }
  if (
    JSON.stringify(Object.keys(draw).sort()) !== JSON.stringify(DRAW_KEYS)
  ) {
    errors.push("Draw contains missing or unexpected fields.");
  }
  if (draw.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (!PERIOD_PATTERN.test(draw.period ?? "")) {
    errors.push("period must use YYYY-MM.");
  }
  if (
    typeof draw.winningSuffix !== "string" ||
    draw.winningSuffix.length !== MATCH_LENGTH ||
    [...draw.winningSuffix].some(
      (character) => !CHARACTER_SET.includes(character),
    )
  ) {
    errors.push("winningSuffix must contain exactly 3 Base36 characters.");
  }
  if (draw.characterSet !== CHARACTER_SET) {
    errors.push("characterSet does not match the AURA invoice character set.");
  }
  if (draw.matchLength !== MATCH_LENGTH) {
    errors.push("matchLength must be 3.");
  }
  if (
    !draw.reward ||
    typeof draw.reward !== "object" ||
    Array.isArray(draw.reward) ||
    JSON.stringify(Object.keys(draw.reward).sort()) !==
      JSON.stringify(REWARD_KEYS) ||
    draw.reward.type !== REWARD.type ||
    draw.reward.id !== REWARD.id ||
    draw.reward.name !== REWARD.name
  ) {
    errors.push("reward is incomplete or unsupported.");
  }
  if (!TAIPEI_ISO_PATTERN.test(draw.drawnAt ?? "")) {
    errors.push("drawnAt must be a Taipei ISO timestamp with +08:00.");
  }
  if (!TAIPEI_ISO_PATTERN.test(draw.claimDeadline ?? "")) {
    errors.push("claimDeadline must be a Taipei ISO timestamp with +08:00.");
  }

  return errors;
}

async function pathExists(path) {
  try {
    const handle = await open(path, "r");
    await handle.close();
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function serializeJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function writeTemporaryJson(targetPath, value) {
  await mkdir(dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.tmp-${process.pid}-${randomUUID()}`;
  let handle;

  try {
    handle = await open(temporaryPath, "wx", 0o644);
    await handle.writeFile(serializeJson(value), "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    return temporaryPath;
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
}

async function writeJsonExclusively(targetPath, value) {
  const temporaryPath = await writeTemporaryJson(targetPath, value);

  try {
    await link(temporaryPath, targetPath);
  } finally {
    await unlink(temporaryPath).catch(() => {});
  }
}

async function replaceJsonAtomically(targetPath, value) {
  const temporaryPath = await writeTemporaryJson(targetPath, value);

  try {
    await rename(temporaryPath, targetPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
}

async function readAndValidateDraw(path, expectedPeriod) {
  const draw = JSON.parse(await readFile(path, "utf8"));
  const errors = validateDraw(draw);
  if (errors.length > 0) {
    throw new Error(`Existing draw is invalid: ${errors.join(" ")}`);
  }
  if (draw.period !== expectedPeriod) {
    throw new Error(
      `Existing draw period ${draw.period} does not match ${expectedPeriod}.`,
    );
  }
  return draw;
}

async function readLatestDraw(latestPath) {
  if (!(await pathExists(latestPath))) return null;
  const latest = JSON.parse(await readFile(latestPath, "utf8"));
  const errors = validateDraw(latest);
  if (errors.length > 0) {
    throw new Error(`latest.json is invalid: ${errors.join(" ")}`);
  }
  return latest;
}

export async function runDraw({
  mode = "dry-run",
  now = new Date(),
  outputDirectory = DEFAULT_OUTPUT_DIRECTORY,
} = {}) {
  if (!["dry-run", "publish"].includes(mode)) {
    throw new Error(`Unsupported mode: ${mode}`);
  }

  const resolvedOutputDirectory = resolve(outputDirectory);
  const period = getPreviousPeriod(now);
  const periodPath = resolve(
    resolvedOutputDirectory,
    "draws",
    `${period}.json`,
  );
  const latestPath = resolve(resolvedOutputDirectory, "latest.json");

  if (await pathExists(periodPath)) {
    const existingDraw = await readAndValidateDraw(periodPath, period);
    return {
      status: "already-exists",
      changed: false,
      mode,
      period,
      periodPath,
      latestPath,
      draw: existingDraw,
    };
  }

  const draw = createDraw(now);
  const validationErrors = validateDraw(draw);
  if (validationErrors.length > 0) {
    throw new Error(`Generated draw is invalid: ${validationErrors.join(" ")}`);
  }

  if (mode === "dry-run") {
    return {
      status: "dry-run",
      changed: false,
      mode,
      period,
      periodPath,
      latestPath,
      draw,
    };
  }

  try {
    await writeJsonExclusively(periodPath, draw);
  } catch (error) {
    if (error?.code === "EEXIST") {
      const existingDraw = await readAndValidateDraw(periodPath, period);
      return {
        status: "already-exists",
        changed: false,
        mode,
        period,
        periodPath,
        latestPath,
        draw: existingDraw,
      };
    }
    throw error;
  }

  const latestDraw = await readLatestDraw(latestPath);
  if (!latestDraw || draw.period > latestDraw.period) {
    await replaceJsonAtomically(latestPath, draw);
  }

  return {
    status: "published",
    changed: true,
    mode,
    period,
    periodPath,
    latestPath,
    draw,
  };
}

function parseArguments(argumentsList) {
  const options = {
    mode: "dry-run",
    outputDirectory: DEFAULT_OUTPUT_DIRECTORY,
    now: new Date(),
  };
  let customNowProvided = false;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const value = argumentsList[index + 1];

    if (argument === "--mode" && value) {
      options.mode = value;
      index += 1;
    } else if (argument === "--output-dir" && value) {
      options.outputDirectory = resolve(value);
      index += 1;
    } else if (argument === "--now" && value) {
      options.now = new Date(value);
      customNowProvided = true;
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }

  if (Number.isNaN(options.now.getTime())) {
    throw new Error("--now must be a valid ISO timestamp.");
  }
  if (
    options.mode === "publish" &&
    customNowProvided &&
    resolve(options.outputDirectory) === DEFAULT_OUTPUT_DIRECTORY &&
    process.env.AURA_DRAW_ALLOW_CUSTOM_NOW !== "1"
  ) {
    throw new Error(
      "--now cannot publish to the production output directory without an explicit recovery override.",
    );
  }

  return options;
}

async function writeGitHubOutput(result) {
  if (!process.env.GITHUB_OUTPUT) return;
  await appendFile(
    process.env.GITHUB_OUTPUT,
    [
      `changed=${result.changed}`,
      `period=${result.period}`,
      `status=${result.status}`,
      "",
    ].join("\n"),
    "utf8",
  );
}

function printSummary(result) {
  const output = {
    status: result.status,
    mode: result.mode,
    changed: result.changed,
    period: result.period,
    output: {
      periodFile: result.periodPath,
      latestFile: result.latestPath,
    },
    draw: result.draw,
  };
  console.log(JSON.stringify(output, null, 2));
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const result = await runDraw(options);
  printSummary(result);
  await writeGitHubOutput(result);
}

const isMainModule =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMainModule) {
  main().catch((error) => {
    console.error(`AURA monthly draw failed: ${error.message}`);
    process.exitCode = 1;
  });
}
