#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type StarterConfig = {
  templateScope: string; // e.g. "x3bun" (without "@")
  packages: Record<string, string>;
};

/**
 * Asserts that the script is running in Bun environment.
 */
function assertRunningOnBun() {
  const isBun = typeof (process as any).versions?.bun === "string";
  const ua = process.env.npm_config_user_agent ?? "";
  const invokedByBun = ua.includes("bun/");
  if (!isBun && !invokedByBun) {
    console.error("❌ This starter must be run with Bun.");
    console.error("Use: bunx create x3bun-app");
    process.exit(1);
  }
}

/**
 * Retrieves the project name from command-line arguments.
 * @returns Project Name
 */
function getArgProjectName(): string | undefined {
  const args = process.argv.slice(2);
  return args.find((a) => a && !a.startsWith("-"))?.trim() || undefined;
}

/**
 *
 * @param label Prompt message
 * @param defaultValue default value if input is empty
 * @returns Project name
 */
async function promptText(label: string, defaultValue?: string) {
  const p = `${label}${defaultValue ? ` (${defaultValue})` : ""}: `;
  const value = (prompt(p) ?? "").trim();
  return value || defaultValue || "";
}

/**
 * Strict-ish npm package name validation for root package name / scope suffix.
 */
function normalizeProjectName(input: string) {
  const v = input.trim();
  const ok = /^[a-z0-9][a-z0-9._-]*$/.test(v);
  if (!ok) return "";
  return v;
}

/** Copy template to Project directory */
async function copyTemplate(templateDir: string, destDir: string) {
  await cp(templateDir, destDir, {
    recursive: true,
    force: false,
    errorOnExist: true,
  });
}

/** Modify the root `package.json` package `name` */
async function setRootPackageName(rootDir: string, newRootName: string) {
  const rootPkgPath = path.join(rootDir, "package.json");
  const raw = await readFile(rootPkgPath, "utf8");
  const json = JSON.parse(raw);
  json.name = newRootName;
  await writeFile(rootPkgPath, JSON.stringify(json, null, 2) + "\n", "utf8");
}

function rewriteDepsSectionKeys(
  section: Record<string, string> | undefined,
  fromScopeWithSlash: string,
  toScopeWithSlash: string
) {
  if (!section) return section;

  const out: Record<string, string> = {};
  for (const [pkg, ver] of Object.entries(section)) {
    const newKey = pkg.startsWith(fromScopeWithSlash)
      ? pkg.replace(fromScopeWithSlash, toScopeWithSlash)
      : pkg;
    out[newKey] = ver;
  }
  return out;
}

/**
 * Find all files recursively in a directory, excluding node_modules, .git, .turbo
 * @param rootDir Project root directory
 * @returns Files paths
 */
async function findAllFiles(rootDir: string) {
  const results: string[] = [];

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const e of entries) {
      if (e.isDirectory()) {
        if (
          e.name === "node_modules" ||
          e.name === ".git" ||
          e.name === ".turbo"
        )
          continue;
        await walk(path.join(dir, e.name));
        continue;
      }
      results.push(path.join(dir, e.name));
    }
  }

  await walk(rootDir);
  return results;
}

/**
 * Find all package.json files in the project
 * @param rootDir Project root directory
 * @returns all paths to package.json files
 */
async function findAllPackageJsonFiles(rootDir: string) {
  const all = await findAllFiles(rootDir);
  return all.filter((p) => path.basename(p) === "package.json");
}

/**
 * Change all scoped package names from template scope to project scope
 * for example `x3bun` to `myx3bun`
 * @param rootDir Project root directory
 * @param projectName Project Name
 * @param templateScope original scope ex `x3bun
 */
async function applyRepoScope(
  rootDir: string,
  projectName: string,
  templateScope: string
) {
  const fromScopeWithSlash = `@${templateScope}/`;
  const toScopeWithSlash = `@${projectName}/`;

  const packageJsonFiles = await findAllPackageJsonFiles(rootDir);

  // 1) Update all workspace package.json files (except root handled separately)
  for (const filePath of packageJsonFiles) {
    if (
      path.resolve(filePath) === path.resolve(path.join(rootDir, "package.json"))
    )
      continue;

    const raw = await readFile(filePath, "utf8");
    const json = JSON.parse(raw);

    // package name
    if (
      typeof json.name === "string" &&
      json.name.startsWith(fromScopeWithSlash)
    ) {
      json.name = json.name.replace(fromScopeWithSlash, toScopeWithSlash);
    }

    // deps keys
    json.dependencies = rewriteDepsSectionKeys(
      json.dependencies,
      fromScopeWithSlash,
      toScopeWithSlash
    );
    json.devDependencies = rewriteDepsSectionKeys(
      json.devDependencies,
      fromScopeWithSlash,
      toScopeWithSlash
    );
    json.peerDependencies = rewriteDepsSectionKeys(
      json.peerDependencies,
      fromScopeWithSlash,
      toScopeWithSlash
    );
    json.optionalDependencies = rewriteDepsSectionKeys(
      json.optionalDependencies,
      fromScopeWithSlash,
      toScopeWithSlash
    );

    // also fix string fields inside package.json that reference old scope (e.g. "prettier": "@x3bun/prettier/next")
    const serialized = JSON.stringify(json);
    const fixed = serialized.includes(fromScopeWithSlash)
      ? JSON.parse(serialized.split(fromScopeWithSlash).join(toScopeWithSlash))
      : json;

    await writeFile(filePath, JSON.stringify(fixed, null, 2) + "\n", "utf8");
  }

  // 2) Replace in text files (imports/configs/docs)
  const allFiles = await findAllFiles(rootDir);
  const textFileExts = new Set([
    ".json",
    ".js",
    ".cjs",
    ".mjs",
    ".ts",
    ".mts",
    ".cts",
    ".tsx",
    ".yaml",
    ".yml",
    ".md",
  ]);

  for (const filePath of allFiles) {
    const ext = path.extname(filePath);
    if (!textFileExts.has(ext)) continue;

    const s = await stat(filePath);
    if (s.size > 2_000_000) continue;

    const raw = await readFile(filePath, "utf8");
    if (!raw.includes(fromScopeWithSlash)) continue;

    const replaced = raw.split(fromScopeWithSlash).join(toScopeWithSlash);
    await writeFile(filePath, replaced, "utf8");
  }
}

function rewriteDepsSectionVersions(
  section: Record<string, string> | undefined,
  config: StarterConfig,
  filePath: string
) {
  if (!section) return;

  for (const [pkg, ver] of Object.entries(section)) {
    if (ver === "config") {
      const resolved = config.packages[pkg];
      if (!resolved) {
        throw new Error(
          `Missing version mapping for "${pkg}" in config (file: ${filePath})`
        );
      }
      section[pkg] = resolved;
    }
  }
}

function sortObjectKeys<T extends Record<string, any> | undefined>(obj: T): T {
  if (!obj) return obj;
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Record<string, any>) as T;
}

/**
 * Update all package.json files dependencies to apply versions from config
 * @param rootDir Project root directort
 * @param config config file
 */
async function applyVersions(rootDir: string, config: StarterConfig) {
  const packageJsonFiles = await findAllPackageJsonFiles(rootDir);

  for (const filePath of packageJsonFiles) {
    const raw = await readFile(filePath, "utf8");
    const json = JSON.parse(raw);

    rewriteDepsSectionVersions(json.dependencies, config, filePath);
    rewriteDepsSectionVersions(json.devDependencies, config, filePath);
    rewriteDepsSectionVersions(json.peerDependencies, config, filePath);
    rewriteDepsSectionVersions(json.optionalDependencies, config, filePath);

    // OPTIONAL: allow using "config" in root resolutions too
    rewriteDepsSectionVersions(json.resolutions, config, filePath);

    json.dependencies = sortObjectKeys(json.dependencies);
    json.devDependencies = sortObjectKeys(json.devDependencies);
    json.peerDependencies = sortObjectKeys(json.peerDependencies);
    json.optionalDependencies = sortObjectKeys(json.optionalDependencies);
    json.resolutions = sortObjectKeys(json.resolutions);

    await writeFile(filePath, JSON.stringify(json, null, 2) + "\n", "utf8");
  }
}

/**
 * Main Section
 * --------------------------------------------------
 * Creates a new x3bun starter project in a new folder.
 * --------------------------------------------------
 */
async function main() {
  assertRunningOnBun();

  const argProjectName = getArgProjectName();

  // Prompt for project name if not provided as argument
  const projectNameRaw =
    argProjectName ??
    (await promptText("Project name (root package name)", "myx3bun"));

  const projectName = normalizeProjectName(projectNameRaw);

  if (!projectName) {
    console.error(
      "❌ Invalid project name. Use lowercase letters/numbers and - _ . only."
    );
    process.exit(1);
  }

  /** Project directory */
  const destDir = path.resolve(process.cwd(), projectName);

  // Check if folder exists
  if (existsSync(destDir)) {
    // Folder exists
    console.error(`❌ Folder already exists: ${destDir}`);

    // Exit with error
    process.exit(1);
  }

  // Create project folder
  await mkdir(destDir, { recursive: true });

  /** Current script directory */
  const here = path.dirname(fileURLToPath(import.meta.url));

  /** Template directory */
  const templateDir = path.resolve(here, "../templates/default");

  /** Config File path */
  const configPath = path.resolve(here, "../config.json");

  // Load config
  const configRaw = await readFile(configPath, "utf8");

  /** Config Object */
  const config: StarterConfig = JSON.parse(configRaw);

  if (!config.templateScope || /[^a-z0-9._-]/.test(config.templateScope)) {
    console.error(
      '❌ Invalid templateScope in config.json. Use something like: "x3bun"'
    );
    process.exit(1);
  }

  await copyTemplate(templateDir, destDir);

  // Root name: "myx3bun"
  await setRootPackageName(destDir, projectName);

  // Workspace scope: "@myx3bun/*" based on templateScope: "@x3bun/*"
  await applyRepoScope(destDir, projectName, config.templateScope);

  // Replace "config" versions in all package.json files (and resolutions if you use it)
  await applyVersions(destDir, config);

  console.log(`✅ Created ${projectName}`);
  console.log(`✅ Root package name: ${projectName}`);
  console.log(`✅ Workspace scope: @${projectName}/*`);
  console.log(`Next:`);
  console.log(`  cd ${projectName}`);
  console.log(`  bun install`);
  console.log(`  bun run dev`);
}

main().catch((err) => {
  console.error("❌ Failed:", err?.message ?? err);
  process.exit(1);
});
