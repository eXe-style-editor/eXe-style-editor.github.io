#!/usr/bin/env node
// Lists, per official style, the files its config.xml declares "ALL RIGHTS
// RESERVED" (institutional logos since eXeLearning 4.0.6), as JSON
// { "<style id>": ["img/logo.png", ...] }. The sync script deletes them from
// the copies EdEX publishes, and the editor keeps them out of derived styles
// (adr/0004).
//
// A style.js with a `logos` switch but no files found means the description
// changed format: fail here instead of letting the logos slip through.
//
// Usage: node scripts/restricted-files.mjs <themes dir>

import fs from "node:fs";
import path from "node:path";

const [themesRoot] = process.argv.slice(2);
if (!themesRoot || !fs.existsSync(themesRoot)) {
  console.error(`Themes directory not found: ${themesRoot}`);
  process.exit(1);
}

function readText(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function description(configXml) {
  const match = configXml.match(/<description>([\s\S]*?)<\/description>/i);
  return match ? match[1] : "";
}

const result = {};
for (const entry of fs.readdirSync(themesRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const id = entry.name;
  const dir = path.join(themesRoot, id);
  const paragraph = description(readText(path.join(dir, "config.xml")))
    .split(/\n\s*\n/)
    .find((block) => /ALL RIGHTS RESERVED/i.test(block)) || "";
  const files = Array.from(new Set(
    (paragraph.match(/theme\/[\w./-]+\.(?:png|jpe?g|gif|svg|webp|ico)/gi) || [])
      .map((ref) => ref.replace(/^theme\//, ""))
  ));
  const hasSwitch = /^\s*logos\s*:/m.test(readText(path.join(dir, "style.js")));
  if (hasSwitch && !files.length) {
    throw new Error(`${id}: style.js has a logos switch but config.xml lists no reserved files`);
  }
  if (files.length && !hasSwitch) {
    throw new Error(`${id}: config.xml lists reserved files but style.js has no logos switch`);
  }
  const missing = files.filter((file) => !fs.existsSync(path.join(dir, file)));
  if (missing.length) throw new Error(`${id}: reserved files not in the style: ${missing.join(", ")}`);
  if (files.length) result[id] = files.sort();
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
