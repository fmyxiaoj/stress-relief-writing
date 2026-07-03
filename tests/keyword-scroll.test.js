const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Could not extract ${name}`);
}

test("keyword insertion does not allow browser focus scrolling", () => {
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");
  const createKeywordButton = extractFunction(js, "createKeywordButton");
  const insertKeyword = extractFunction(js, "insertKeyword");

  assert.match(createKeywordButton, /event\.preventDefault\(\);/);
  assert.match(insertKeyword, /input\.focus\(\{\s*preventScroll:\s*true\s*\}\);/);
  assert.doesNotMatch(insertKeyword, /input\.focus\(\);/);
});
