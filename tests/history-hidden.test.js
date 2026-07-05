const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

test("history list and detail are not rendered while hidden", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(css, /\.nw-history-list\[hidden\][\s\S]*display:\s*none/);
  assert.match(css, /\.nw-history-detail\[hidden\][\s\S]*display:\s*none/);
});

test("history assets use the current cache-busting version", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");

  assert.match(html, /styles\.css\?v=20260705-night-paper/);
  assert.match(html, /app\.js\?v=20260703-keyword-scroll/);
});

test("web visual refresh uses a softened night palette and mobile sheet", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(css, /--night-surface:\s*#090b12;/);
  assert.match(css, /--paper-ink:\s*#d8c79e;/);
  assert.match(css, /--dusk-blue:\s*#7d89ae;/);
  assert.match(css, /\.nw-history-panel[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(12,\s*14,\s*24,\s*0\.96\),\s*rgba\(8,\s*9,\s*16,\s*0\.98\)\);/);
  assert.match(css, /bottom:\s*calc\(12px \+ var\(--safe-bottom\)\);/);
  assert.match(css, /border-radius:\s*8px 8px 6px 6px;/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
