const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const files = JSON.parse(
  fs.readFileSync(path.join(root, "docs/reference-manifest.json"), "utf8"),
);
const changed = files.filter((f) => {
  const target = path.resolve(root, "../troday-demo", f.path);
  return (
    !fs.existsSync(target) ||
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(target))
      .digest("hex") !== f.sha256
  );
});
if (changed.length) {
  console.error(
    "Reference differs:",
    changed.map((f) => f.path),
  );
  process.exitCode = 1;
} else console.log(`PASS: ${files.length} reference files are unchanged.`);
