// scripts/update-exports.ts
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

interface MyPackageJson {
  name: string;
  version: string;
  exports?: Record<string, string>;
  // …your fields
}
//
// Recursively list all .ts files inside a directory
//
function getFilesRecursively(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      files.push(...getFilesRecursively(full));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".d.ts")) {
      files.push(full);
    }
  }

  return files;
}

//
// Main: build "exports" with .js + .d.ts
//
function updateExports() {
  const root = process.cwd();
  const srcDir = join(root, "src");

  const files = getFilesRecursively(srcDir);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exportsMap: Record<string, any> = {};

  for (const file of files) {
    const rel = relative(srcDir, file).replace(/\.ts$/, "");

    const key = rel === "index" ? "." : `./${rel}`;

    exportsMap[key] = {
      import: `./dist/${rel}.js`,
      types: `./dist/${rel}.d.ts`,
    };
  }

  // Load package.json
  const pkgPath = join(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as MyPackageJson;

  pkg.exports = exportsMap;

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  console.log("✅ package.json exports updated");
}

updateExports();
