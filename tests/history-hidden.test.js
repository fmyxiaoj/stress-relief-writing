const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

test("history list and detail are not rendered while hidden", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(css, /\.nw-history-list\[hidden\][\s\S]*display:\s*none/);
  assert.match(css, /\.nw-history-detail\[hidden\][\s\S]*display:\s*none/);
});
