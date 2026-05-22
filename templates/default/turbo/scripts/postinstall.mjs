#!/usr/bin/env node
import { execSync } from "child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  readFileSync,
  statSync,
} from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

// Skip hook setup in non-git directories
if (!existsSync(".git")) {
  console.log("⚠️  Not a git repository. Skipping hook setup.");
  process.exit(0);
}
// 🏭 Skip hook setup in CI or production builds
if (process.env.CI === "true" || process.env.NODE_ENV === "production") {
  console.log("🏭 Skipping git hook setup (CI/build environment).");
  process.exit(0);
}

const HOOK_PATH = resolve(".git/hooks/pre-push");
const SOURCE_HOOK = resolve(".github/hooks/prepush.sh");

async function main() {
  console.log("🧹 Running lint...");
  execSync("bun run lint:ws", { stdio: "inherit" });

  const sourceHookExists = existsSync(SOURCE_HOOK);
  if (!sourceHookExists) {
    console.error(`❌ Missing source hook: ${SOURCE_HOOK}`);
    process.exit(1);
  }

  const hookExists = existsSync(HOOK_PATH);
  if (hookExists) {
    const existing = readFileSync(HOOK_PATH, "utf8");
    const desired = readFileSync(SOURCE_HOOK, "utf8");

    if (existing !== desired) {
      console.warn(
        "⚠️  .git/hooks/pre-push differs from .github/hooks/prepush.sh. Overwrite! ",
      );
      copyFileSync(SOURCE_HOOK, HOOK_PATH);
      console.log("✅ Hook overwritten with .github version.");
    }
    console.log("✅ Hook up to date.");
  } else {
    console.log("📄 No pre-push hook found. Copying...");
    copyFileSync(SOURCE_HOOK, HOOK_PATH);
  }

  const execCode = ensureExecutable(HOOK_PATH);

  console.log(execCode === 3 ? "⚠️  Hook setup incomplete." : "✅ Hook setup complete. It will run automatically on git push.");
}

function askYesNo(question) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

function ensureExecutable(path) {
  try {
    const stats = statSync(path);
    const isExecutable = !!(stats.mode & 0o111);
    if (!isExecutable) {
      chmodSync(path, stats.mode | 0o755);
      console.log("🔐 Added +x permission to hook.");
      return 1
    } else {
      console.log("🔓 Hook already executable.");
      return 2
    }
  } catch (err) {
    console.warn(`⚠️ Could not verify executable permission: ${err.message}`);
    return 3
  }
}

await main();
