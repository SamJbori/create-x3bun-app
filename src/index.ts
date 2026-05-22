#!/usr/bin/env bun

import { existsSync, renameSync } from "node:fs";
import { cp } from "node:fs/promises";
import path from "node:path";
import { Glob } from "bun";

type StarterConfig = {
  templateScope: string;
  packages: Record<string, string>;
  packageManager: string;
};

type CliFlags = {
  yes: boolean;
  git?: boolean;
  help: boolean;
  install: boolean;
};

/**
 * Asserts that the script is running in Bun environment.
 */
function assertRunningOnBun() {
  if (!Bun.version) {
    console.error("❌ This starter must be run with Bun.");
    console.error("Use: bun create x3bun-app <ProjectName> [options]");
    process.exit(1);
  }
}

/**
 * Parse CLI flags:
 * --yes / -y
 * --git
 * --no-git
 * --help / -h
 * --install / -i
 * @returns Parsed flags
 */
function parseFlags(): CliFlags {
  const args = Bun.argv.slice(2);

  return {
    yes: args.includes("--yes") || args.includes("-y"),
    help: args.includes("--help") || args.includes("-h"),
    git: args.includes("--no-git")
      ? false
      : args.includes("--git")
        ? true
        : undefined,
    install: args.includes("--install") || args.includes("-i"),
  };
}

/** Print CLI help */
function printHelp() {
  console.log(`
create-x3bun-app

Usage:
  bun create x3bun-app [projectName] [options]
  bunx create-x3bun-app [projectName] [options]

Options:
  --yes, -y       Skip prompts and use defaults (same as --git --install)
  --no-git        Skip git init (overrides --git)
  --git           Force git init
  --help, -h      Show help
  --install, -i   Install dependencies after setup
`);
}


/**
 * Retrieves the project name from command-line arguments.
 * @returns Project Name
 */
function getArgProjectName() {
  return Bun.argv.slice(2).find((a) => !a.startsWith("-"))?.trim();
}

/**
 *
 * @param label Prompt message
 * @param defaultValue default value if input is empty
 * @returns Project name
 */
async function promptText(label: string, defaultValue?: string) {
  const value = prompt(
    `${label}${defaultValue ? ` (${defaultValue})` : ""}: `
  )?.trim();

  return value || defaultValue || "";
}

/**
 * Strict-ish npm package name validation for root package name / scope suffix.
 */
function normalizeProjectName(input: string) {
  const v = input.trim();

  return /^[a-z0-9][a-z0-9._-]*$/.test(v) ? v : "";
}

async function run(
  cmd: string[],
  cwd: string,
  silent = false
) {
  const proc = Bun.spawn(cmd, {
    cwd,
    stdout: silent ? "ignore" : "inherit",
    stderr: silent ? "ignore" : "inherit",
    stdin: "inherit",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`Command failed: ${cmd.join(" ")}`);
  }
}

async function copyTemplate(
  templateDir: string,
  destDir: string
) {
  await cp(templateDir, destDir, {
    recursive: true,
    force: false,
    errorOnExist: true,
  });

  const gitignoreSrc = path.join(destDir, "_gitignore");
  const gitignoreDest = path.join(destDir, ".gitignore");

  if (existsSync(gitignoreSrc)) {
    renameSync(gitignoreSrc, gitignoreDest);
  }
}

async function copyReadMe(binDirectory: string, destDir: string) {
  const readmeSrc = path.join(binDirectory, "../", "README.md");
  const readmeDest = path.join(destDir, "README.md");
  await cp(readmeSrc, readmeDest);

}

async function setRootPackageName(
  rootDir: string,
  newRootName: string
) {
  const pkgPath = path.join(rootDir, "package.json");

  const json = await Bun.file(pkgPath).json();

  json.name = newRootName;

  await Bun.write(
    pkgPath,
    JSON.stringify(json, null, 2) + "\n"
  );
}

/**
 * Rewrites project internal dependencies to the new scope
 * @param section dependencies/devDependencies/peerDependencies/optionalDependencies section of package.json
 * @param fromScope original scope ex `@x3bun/*`
 * @param toScope new scope ex `@myx3bun/*`
 * @returns rewritten section with updated keys (if needed)
 */
function rewriteDepsSectionKeys(
  section: Record<string, string> | undefined,
  fromScope: string,
  toScope: string
) {
  if (!section) return section;

  const out: Record<string, string> = {};

  for (const [pkg, version] of Object.entries(section)) {
    out[
      pkg.startsWith(fromScope)
        ? pkg.replace(fromScope, toScope)
        : pkg
    ] = version;
  }

  return out;
}

/**
 * Find all files recursively in a directory, excluding node_modules, .git, .turbo
 * @param rootDir Project root directory
 * @returns Files paths
 */
async function findAllFiles(rootDir: string) {
  const files: string[] = [];

  const glob = new Glob("**/*");

  for await (const file of glob.scan({
    cwd: rootDir,
    absolute: true,
    onlyFiles: true,
    dot: true,
  })) {
    if (
      file.includes("/node_modules/") ||
      file.includes("/.git/") ||
      file.includes("/.turbo/")
    ) {
      continue;
    }

    files.push(file);
  }

  return files;
}

/**
 * Find all package.json files in the project
 * @param rootDir Project root directory
 * @returns all paths to package.json files
 */
async function findAllPackageJsonFiles(rootDir: string) {
  const rootPackageJson = path.resolve(
    rootDir,
    "package.json"
  );

  const files = await findAllFiles(rootDir);

  return files.filter((file) => {
    return (
      path.basename(file) === "package.json"
      //&& path.resolve(file) !== rootPackageJson
    );
  });
}

/**
 * Change all scoped package names from template scope to project scope
 * for example `x3bun` to `myx3bun`
 * @param rootDir Project root directory
 * @param projectName Project Name
 * @param templateScope original scope ex `x3bun
 */
async function applyRepoScope({ templateScope, projectName, rootDir, packageManager }: {
  rootDir: string,
  projectName: string,
  templateScope: string,
  packageManager: string
}
) {
  const fromScope = `@${templateScope}/`;
  const toScope = `@${projectName}/`;

  const packageJsonFiles =
    await findAllPackageJsonFiles(rootDir);

  // 1) Update all workspace package.json files (except root handled separately)
  for (const filePath of packageJsonFiles) {
    // if (
    //   path.resolve(filePath) ===
    //   path.resolve(path.join(rootDir, "package.json"))
    // ) {
    //   continue;
    // }

    const json = await Bun.file(filePath).json();

    if (
      typeof json.name === "string" &&
      json.name.startsWith(fromScope)
    ) {
      json.name = json.name.replace(
        fromScope,
        toScope
      );
    }

    json.packageManager = packageManager;
    json.dependencies = rewriteDepsSectionKeys(
      json.dependencies,
      fromScope,
      toScope
    );

    json.devDependencies = rewriteDepsSectionKeys(
      json.devDependencies,
      fromScope,
      toScope
    );

    json.peerDependencies = rewriteDepsSectionKeys(
      json.peerDependencies,
      fromScope,
      toScope
    );

    json.optionalDependencies =
      rewriteDepsSectionKeys(
        json.optionalDependencies,
        fromScope,
        toScope
      );

    // also fix string fields inside package.json that reference old scope (e.g. "prettier": "@x3bun/prettier/next")
    const serialized = JSON.stringify(json);

    const fixed = serialized.includes(fromScope)
      ? JSON.parse(
        serialized.split(fromScope).join(toScope)
      )
      : json;

    await Bun.write(
      filePath,
      JSON.stringify(fixed, null, 2) + "\n"
    );
  }

  const textExtensions = new Set([
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

  // 2) Replace in text files (imports/configs/docs)
  const allFiles = await findAllFiles(rootDir);

  for (const filePath of allFiles) {
    if (!textExtensions.has(path.extname(filePath))) {
      continue;
    }

    const file = Bun.file(filePath);

    if (file.size > 2_000_000) {
      continue;
    }

    const raw = await file.text();

    if (!raw.includes(fromScope)) {
      continue;
    }

    await Bun.write(
      filePath,
      raw.split(fromScope).join(toScope)
    );
  }
}

function rewriteDepsSectionVersions(
  section: Record<string, string> | undefined,
  config: StarterConfig,
) {
  if (!section) return;

  for (const [pkg, version] of Object.entries(config.packages)) {
    if (section[pkg]) {
      section[pkg] = version
    }
  }

  // for (const [pkg, version] of Object.entries(section)) {
  //   if (version !== "config") continue;

  //   const resolved = config.packages[pkg];

  //   if (!resolved) {
  //     throw new Error(
  //       `Missing version mapping for "${pkg}" in config (${filePath})`
  //     );
  //   }

  //   section[pkg] = resolved;
  // }
}

function sortObjectKeys<
  T extends Record<string, any> | undefined
>(obj: T): T {
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
async function applyVersions(
  rootDir: string,
  config: StarterConfig
) {
  const packageJsonFiles =
    await findAllPackageJsonFiles(rootDir);

  for (const filePath of packageJsonFiles) {
    const json = await Bun.file(filePath).json();

    rewriteDepsSectionVersions(
      json.dependencies,
      config,
    );

    rewriteDepsSectionVersions(
      json.devDependencies,
      config,
    );

    rewriteDepsSectionVersions(
      json.peerDependencies,
      config,
    );

    rewriteDepsSectionVersions(
      json.optionalDependencies,
      config,
    );

    // OPTIONAL: allow using "config" in root resolutions too
    rewriteDepsSectionVersions(
      json.resolutions,
      config,
    );

    json.dependencies = sortObjectKeys(
      json.dependencies
    );

    json.devDependencies = sortObjectKeys(
      json.devDependencies
    );

    json.peerDependencies = sortObjectKeys(
      json.peerDependencies
    );

    json.optionalDependencies = sortObjectKeys(
      json.optionalDependencies
    );

    json.resolutions = sortObjectKeys(
      json.resolutions
    );

    await Bun.write(
      filePath,
      JSON.stringify(json, null, 2) + "\n"
    );
  }
}

/**
 * Main Section
 * --------------------------------------------------
 * Creates a new x3bun starter project in a new folder.
 * --------------------------------------------------
 */
async function main() {
  // Fail fast if not running in Bun
  assertRunningOnBun();

  // CLI flags parsing
  const flags = parseFlags();

  if (flags.help) {
    printHelp();
    process.exit(0);
  }

  const argProjectName = getArgProjectName();

  if (flags.yes && !argProjectName) {
    console.log(
      "⚠️ --yes provided without project name, using default: myx3bun"
    );
  }

  const projectNameRaw =
    argProjectName ??
    (flags.yes
      ? "myx3bun"
      : await promptText(
        "Project name",
        "myx3bun"
      ));

  const projectName =
    normalizeProjectName(projectNameRaw);

  if (!projectName) {
    console.error(
      "❌ Invalid project name. Use lowercase letters, numbers, -, _, ."
    );

    process.exit(1);
  }

  /** New Project directory */
  const destDir = path.resolve(
    process.cwd(),
    projectName
  );

  // Check if folder exists
  if (existsSync(destDir)) {
    console.error(
      `❌ Folder already exists: ${destDir}`
    );

    process.exit(1);
  }

  /** Current script directory */
  const binDirectory = import.meta.dir;

  const templateDir = path.resolve(
    binDirectory,
    "../templates/default"
  );

  /** Config File path */
  const configPath = path.resolve(
    binDirectory,
    "../config.json"
  );

  // Load config
  const config =
    (await Bun.file(configPath).json()) as StarterConfig;

  if (
    !config.templateScope ||
    /[^a-z0-9._-]/.test(config.templateScope)
  ) {
    console.error(
      "❌ Invalid templateScope in config.json"
    );

    process.exit(1);
  }

  await copyTemplate(templateDir, destDir);

  await copyReadMe(binDirectory, destDir);

  // Root name: "myx3bun"
  await setRootPackageName(destDir, projectName);

  // Workspace scope: "@myx3bun/*" based on templateScope: "@x3bun/*"
  await applyRepoScope({
    rootDir: destDir,
    projectName,
    templateScope: config.templateScope,
    packageManager: config.packageManager,
  });

  // Replace "config" versions in all package.json files (and resolutions if you use it)
  await applyVersions(destDir, config);

  // Decide if bun install should run (priority: --yes > prompt)
  let shouldInstall: boolean;

  if (flags.install || flags.yes) {
    shouldInstall = true;
  } else {
    const answer = (
      await promptText(
        "Install dependencies now? (Y/n)",
        "Y"
      )
    ).toLowerCase();

    shouldInstall =
      answer === "" ||
      answer === "y" ||
      answer === "yes";
  }

  if (shouldInstall) {
    try {
      await run(["bun", "install"], destDir);

      console.log(
        "✅ Dependencies installed"
      );
    } catch {
      console.warn(
        "⚠️ Dependency installation failed"
      );
    }
    try {
      await run(["bun", "lint:fix"], destDir);
      console.log(
        "✅ Initial Linting Completed"
      );
    } catch (err) {
      console.warn(
        "⚠️ Auto lint fix failed:",
        (err as Error).message
      );
      console.warn(
        "Please run `bun run lint:fix` manually after installation"
      );
    }
  }


  // Decide if git should initialize (priority: --no-git > --git > --yes > prompt)
  let shouldInitGit: boolean;

  if (flags.git === false) {
    shouldInitGit = false;
  } else if (flags.git === true || flags.yes) {
    shouldInitGit = true;
  } else {
    const answer = (
      await promptText(
        "Initialize git repository? (Y/n)",
        "Y"
      )
    ).toLowerCase();

    shouldInitGit =
      answer === "" ||
      answer === "y" ||
      answer === "yes";
  }

  if (shouldInitGit) {
    try {
      await run(
        ["git", "init", "-q"],
        destDir,
        true
      );

      await run(
        ["git", "add", "."],
        destDir,
        true
      );

      await run(
        [
          "git",
          "commit",
          "-m",
          "Initial commit",
          "--quiet",
        ],
        destDir,
        true
      );

      console.log(
        "✅ Git repository initialized"
      );
    } catch (err) {
      console.warn(
        "⚠️ Git initialization failed:",
        (err as Error).message
      );
    }
  }

  console.log(`✅ Created ${projectName}`);
  console.log(`✅ Root package name: ${projectName}`);
  console.log(`✅ Workspace scope: @${projectName}/*`);
  if (shouldInstall) {
    try {
      await run(["bun", "postinstall"], destDir);

    } catch (err) {
      console.warn(
        "⚠️ Post-installation Script failed:",
        (err as Error).message
      );
      console.warn(
        "Please run `bun run postinstall` manually after installation"
      );
    }
  }


  console.log("\nNext:");
  console.log(`  cd ${projectName}`);

  if (!shouldInstall) {
    console.log(`  bun install`);
  }

  console.log(`  bun run dev`);
}

main().catch((err) => {
  console.error(
    "❌ Failed:",
    err?.message ?? err
  );

  process.exit(1);
});