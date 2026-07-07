// Optimizes every image under /public in place:
// - resizes anything wider/taller than MAX_EDGE down to MAX_EDGE
// - converts photographic PNGs (Instagram screenshots) to JPEG
// - recompresses JPEGs with mozjpeg
// Run after adding new content images: `npm run optimize:images`
// NOTE: converting a .png rewrites it as .jpg — update the matching
// paths in content/ (posters.json / article frontmatter) accordingly.

import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const MAX_EDGE = 1600; // largest rendered size is ~860px @2x
const JPEG_QUALITY = 82;

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const fmt = (bytes) => (bytes / 1024).toFixed(0) + " KB";

let before = 0;
let after = 0;
const converted = [];

for await (const file of walk(PUBLIC_DIR)) {
  const ext = path.extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;

  // Work from a buffer so no file handle stays open on Windows while we overwrite in place.
  const source = await fs.readFile(file);
  const origSize = source.length;
  const meta = await sharp(source).metadata();

  // Skip PNGs with real transparency (none expected — screenshots/photos).
  const isPng = ext === ".png";
  if (isPng && meta.hasAlpha) {
    const { data } = await sharp(source).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
    if (data.some((v) => v < 255)) {
      console.log(`skip (transparent) ${path.relative(PUBLIC_DIR, file)}`);
      continue;
    }
  }

  let pipeline = sharp(source).rotate(); // respect EXIF orientation
  if ((meta.width ?? 0) > MAX_EDGE || (meta.height ?? 0) > MAX_EDGE) {
    pipeline = pipeline.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  }
  const buffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();

  before += origSize;
  if (isPng) {
    const target = file.slice(0, -ext.length) + ".jpg";
    await fs.writeFile(target, buffer);
    await fs.unlink(file);
    converted.push(path.relative(PUBLIC_DIR, file).replace(/\\/g, "/"));
    after += buffer.length;
    console.log(`png→jpg ${path.relative(PUBLIC_DIR, file)}  ${fmt(origSize)} → ${fmt(buffer.length)}`);
  } else if (buffer.length < origSize * 0.95) {
    await fs.writeFile(file, buffer);
    after += buffer.length;
    console.log(`jpeg    ${path.relative(PUBLIC_DIR, file)}  ${fmt(origSize)} → ${fmt(buffer.length)}`);
  } else {
    after += origSize;
    console.log(`keep    ${path.relative(PUBLIC_DIR, file)}  ${fmt(origSize)}`);
  }
}

console.log(`\ntotal: ${fmt(before)} → ${fmt(after)}  (saved ${fmt(before - after)})`);
if (converted.length) {
  console.log(`\nConverted ${converted.length} PNG(s) to JPG — update their references in content/:`);
  for (const c of converted) console.log("  /" + c);
}
