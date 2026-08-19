// Copies TinyMCE's static assets (skins, plugins, themes, icons) into
// public/tinymce so the editor is fully self-hosted — no Tiny Cloud API key,
// no eval-mode nag banner. Runs automatically on every `npm install` via the
// "postinstall" script in package.json.
import { cpSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "..", "node_modules", "tinymce");
const dest = path.join(__dirname, "..", "public", "tinymce");

if (!existsSync(src)) {
  console.warn("tinymce package not found in node_modules — skipping copy.");
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("Copied TinyMCE assets to public/tinymce");
