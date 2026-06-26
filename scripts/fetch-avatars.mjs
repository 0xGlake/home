// Build-time avatar cache.
//
// Resolves every X handle in app/data/taxonomyData.ts through unavatar.io once,
// saves the images under public/icons/, and writes app/data/avatarManifest.json
// (handle -> local path). The component prefers the cached copy and only falls
// back to unavatar at runtime for handles that aren't cached yet.
//
// Idempotent: already-cached handles are skipped, so you can re-run it any time
// (e.g. from a non-rate-limited network) to fill gaps. Run: `npm run avatars`.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "app/data/taxonomyData.ts");
const ICON_DIR = path.join(ROOT, "public/icons");
const MANIFEST = path.join(ROOT, "app/data/avatarManifest.json");

const EXT_BY_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function writeManifest(manifest) {
  const sorted = Object.fromEntries(Object.entries(manifest).sort());
  fs.writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
}

function extractHandles(src) {
  const set = new Set();
  const re = /https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]+)/g;
  let m;
  while ((m = re.exec(src))) set.add(m[1]);
  return [...set];
}

// Returns { ext, buf } on success, null for a genuine 404, undefined on failure.
async function fetchAvatar(handle) {
  const url = `https://unavatar.io/x/${handle}?fallback=false`;
  for (let attempt = 0; attempt < 5; attempt++) {
    let res;
    try {
      res = await fetch(url);
    } catch {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    if (res.status === 200) {
      const ct = (res.headers.get("content-type") || "").split(";")[0].trim();
      const ext = EXT_BY_TYPE[ct] || "png";
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) return undefined;
      return { ext, buf };
    }
    if (res.status === 404) return null;
    // 429 / 5xx: back off and retry
    await sleep(3000 * (attempt + 1));
  }
  return undefined;
}

async function main() {
  const src = fs.readFileSync(DATA, "utf8");
  const handles = extractHandles(src);
  fs.mkdirSync(ICON_DIR, { recursive: true });

  let manifest = {};
  if (fs.existsSync(MANIFEST)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    } catch {
      /* start fresh */
    }
  }

  let cached = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;

  for (const handle of handles) {
    const key = handle.toLowerCase();
    const existing = manifest[key];
    if (existing && fs.existsSync(path.join(ROOT, "public", existing.replace(/^\//, "")))) {
      skipped++;
      continue;
    }

    const result = await fetchAvatar(handle);
    if (result === null) {
      missing++;
    } else if (result === undefined) {
      failed++;
    } else {
      const file = `${key}.${result.ext}`;
      fs.writeFileSync(path.join(ICON_DIR, file), result.buf);
      manifest[key] = `/icons/${file}`;
      cached++;
      writeManifest(manifest); // persist progress so partial runs still count
    }

    process.stdout.write(
      `\r  cached:${cached} skipped:${skipped} missing(404):${missing} failed:${failed}  (${handle})            `,
    );
    await sleep(1500);
  }

  writeManifest(manifest);
  console.log(
    `\nDone. handles:${handles.length} cached:${cached} skipped:${skipped} missing(404):${missing} failed:${failed} | manifest entries:${Object.keys(manifest).length}`,
  );
  if (failed > 0) {
    console.log(
      "Some handles failed (likely rate limiting). Re-run `npm run avatars` to fill gaps.",
    );
  }
}

main();
