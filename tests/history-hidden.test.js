const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");

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

test("history list and detail are not rendered while hidden", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(css, /\.nw-history-list\[hidden\][\s\S]*display:\s*none/);
  assert.match(css, /\.nw-history-detail\[hidden\][\s\S]*display:\s*none/);
});

test("history assets use the current cache-busting version", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");

  assert.match(html, /styles\.css\?v=20260706-lamp-field/);
  assert.match(html, /app\.js\?v=20260706-lamp-field/);
  assert.match(html, /<link rel="icon" href="data:," \/>/);
});

test("web visual refresh uses the v3 night room palette and mobile sheet", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(css, /--night-surface:\s*#05060b;/);
  assert.match(css, /--paper-ink:\s*#e2cc91;/);
  assert.match(css, /--dusk-blue:\s*#7280a4;/);
  assert.match(css, /--writing-light:\s*0\.06;/);
  assert.match(
    css,
    /\.nw-history-panel::before[\s\S]*width:\s*42px;[\s\S]*height:\s*3px;/
  );
  assert.match(
    css,
    /@media \(max-width: 520px\)[\s\S]*\.nw-history-panel \{[\s\S]*bottom:\s*calc\(12px \+ var\(--safe-bottom\)\);[\s\S]*border-radius:\s*8px 8px 6px 6px;[\s\S]*transform:\s*translate3d\(0,\s*14px,\s*0\);/
  );
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("product naming is consistently night-focused", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");

  assert.match(html, /<title>今夜写点啥<\/title>/);
  assert.match(html, /content="今夜写点啥：/);
  assert.doesNotMatch(html, /今天写点啥/);
});

test("history and save affordances have quiet visible UI hooks", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(html, /id="historyHint"/);
  assert.match(html, /class="nw-history-hint"/);
  assert.match(html, /id="saveStatus"[\s\S]*class="nw-save-status"/);
  assert.match(css, /\.nw-history-hint\.visible[\s\S]*opacity:\s*1/);
  assert.match(css, /\.nw-save-status\.visible[\s\S]*opacity:\s*1/);
});

test("mobile web review keeps history visible while preserving quiet touch targets", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");
  const readPixels = (selector, property) => {
    const start = css.indexOf(`${selector} {`);
    assert.notEqual(start, -1, `${selector} should exist`);
    const block = css.slice(start, css.indexOf("}", start));
    const value = block.match(new RegExp(`${property}:\\s*(\\d+)px`))?.[1];
    return Number(value);
  };

  assert.match(html, /本机保存<br \/>\s*不登录，不上传/);
  assert.doesNotMatch(html, /本机保存 · 不登录 · 不上传/);
  assert.ok(readPixels(".nw-history-dot", "min-width") >= 44);
  assert.ok(readPixels(".nw-history-dot", "min-height") >= 44);
  assert.match(css, /\.nw-history-hint[\s\S]*opacity:\s*0\.58/);
  assert.ok(readPixels(".nw-clear-tonight", "min-height") >= 44);
  assert.ok(readPixels(".nw-export-all", "min-height") >= 44);
});

test("mvp launch affordances are present", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");

  assert.match(html, /id="introNote"/);
  assert.match(html, /写下今晚脑子里放不下的东西/);
  assert.match(html, /id="clearTonight"/);
  assert.match(html, /清空今晚/);
  assert.match(html, /id="privacyNote"/);
  assert.match(html, /只保存在这台设备/);
  assert.match(html, /清理浏览器数据会丢失/);
  assert.match(html, /id="clearPanel"[\s\S]*class="nw-clear-panel"/);
  assert.match(css, /\.nw-clear-panel\.open/);
  assert.match(js, /STORAGE_TEST_KEY/);
  assert.match(js, /本机保存不可用/);
});

test("v3 visual system uses a soft writing light instead of a hard paper card", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");

  assert.doesNotMatch(html + css, /—|–/);
  assert.match(css, /--lamp-presence:\s*0;/);
  assert.match(css, /--room-quiet:\s*0;/);
  assert.match(css, /\.nw-glow::before[\s\S]*filter:\s*blur\(26px\)/);
  assert.match(css, /\.nw-glow::before[\s\S]*var\(--lamp-presence\)/);
  assert.match(css, /\.nw-glow::after[\s\S]*linear-gradient\(90deg,\s*transparent,\s*rgba\(226,\s*204,\s*145,\s*var\(--line-light\)\),\s*transparent\)/);
  assert.doesNotMatch(css, /\.night-writer\.has-text[\s\S]*--writing-light:\s*0\.16;/);
  assert.match(css, /@keyframes writing-light-breathe/);
  assert.match(js, /--lamp-presence/);
  assert.match(js, /--writing-light/);
  assert.match(js, /--line-light/);
  assert.match(js, /--room-quiet/);
});

test("writing light switches on to a stable lamp field", () => {
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");
  const source = [
    "const COMPLETION_COUNT = 120;",
    'const dailyAccent = { start: [7, 9, 16], end: [20, 11, 9] };',
    "const state = {};",
    "const writer = {",
    "  classList: { toggle() {} },",
    "  style: { setProperty(name, value) { state[name] = Number(value); } }",
    "};",
    "function updateKeywordState() {}",
    "function showGoodnight() {}",
    "function hideGoodnight() {}",
    extractFunction(js, "getCharacterCount"),
    extractFunction(js, "clamp"),
    extractFunction(js, "lerp"),
    extractFunction(js, "getGlow"),
    extractFunction(js, "setVisualState"),
    'setVisualState("");',
    "globalThis.baseLight = state['--writing-light'];",
    "globalThis.baseLamp = state['--lamp-presence'];",
    'setVisualState("一".repeat(28));',
    "globalThis.earlyLight = state['--writing-light'];",
    "globalThis.earlyLine = state['--line-light'];",
    "globalThis.earlyLamp = state['--lamp-presence'];",
    'setVisualState("一".repeat(120));',
    "globalThis.longLight = state['--writing-light'];",
    "globalThis.longLine = state['--line-light'];",
    "globalThis.longLamp = state['--lamp-presence'];",
    "globalThis.roomQuiet = state['--room-quiet'];"
  ].join("\n");
  const context = { state: {}, Number };

  vm.runInNewContext(source, context);

  assert.equal(context.baseLamp, 0);
  assert.ok(context.earlyLamp > 0.99);
  assert.equal(context.longLamp, context.earlyLamp);
  assert.ok(context.earlyLight - context.baseLight > 0.04);
  assert.ok(Math.abs(context.longLight - context.earlyLight) <= 0.004);
  assert.ok(Math.abs(context.longLine - context.earlyLine) <= 0.004);
  assert.ok(context.roomQuiet > 0.9);
});

test("desktop writing area keeps the light field aligned to the left margin", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(
    css,
    /\.nw-textarea \{[\s\S]*padding:\s*clamp\(116px,\s*18vh,\s*180px\)\s+max\(var\(--content-x\),\s*calc\(100vw - var\(--content-x\) - 610px\)\)\s+calc\(88px \+ var\(--safe-bottom\) \+ var\(--keyboard-bottom\)\)\s+var\(--content-x\);/
  );
});

test("main writing text uses a diary serif font stack", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(
    css,
    /--diary-font:\s*"LXGW WenKai Screen",\s*"LXGW WenKai",\s*"Kaiti SC",\s*"STKaiti",\s*"KaiTi",\s*"FangSong",\s*"Songti SC",\s*"STSong",\s*"Noto Serif CJK SC",\s*serif;/
  );
  assert.match(
    css,
    /\.nw-textarea \{[\s\S]*font-family:\s*var\(--diary-font\);[\s\S]*font-weight:\s*400;[\s\S]*line-height:\s*2\.08;[\s\S]*letter-spacing:\s*0\.025em;/
  );
});

test("clicked keyword remains active while sibling keywords stay visible", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(
    css,
    /\.night-writer\.has-text \.nw-keyword\.visible \{[\s\S]*opacity:\s*0\.46;[\s\S]*color:\s*rgba\(125,\s*137,\s*174,\s*0\.34\);/
  );
  assert.match(
    css,
    /\.night-writer\.has-text \.nw-keyword\.visible\.active \{[\s\S]*opacity:\s*1;[\s\S]*color:\s*rgba\(216,\s*199,\s*158,\s*0\.9\);/
  );
});

test("mobile clear flow uses an app-like bottom confirmation sheet", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");

  assert.match(html, /id="clearPanel"[\s\S]*aria-label="清空确认"/);
  assert.match(html, /id="clearKeep"[\s\S]*>保留</);
  assert.match(html, /id="clearConfirm"[\s\S]*>清空</);
  assert.match(css, /\.nw-clear-panel::before[\s\S]*width:\s*42px;[\s\S]*height:\s*3px;/);
  assert.match(css, /\.nw-clear-panel\.open[\s\S]*transform:\s*translate3d\(0,\s*0,\s*0\)/);
  assert.match(js, /const clearPanel = document\.querySelector\("#clearPanel"\)/);
  assert.match(js, /function setClearConfirmOpen\(/);
  assert.match(js, /clearConfirm\.addEventListener\("click"/);
  assert.match(js, /clearKeep\.addEventListener\("click"/);
});

test("history and clear sheets sit above the dimmed writing layer", () => {
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");

  assert.match(css, /\.night-writer::after[\s\S]*z-index:\s*40;/);
  assert.match(css, /\.nw-history-panel \{[\s\S]*z-index:\s*90;/);
  assert.match(css, /\.nw-clear-panel \{[\s\S]*z-index:\s*90;/);
});

test("web history saves continuous cross-day edits under the latest edit date", () => {
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");

  assert.match(js, /let activeEntryDate = null/);
  assert.match(js, /replacedDates\.add\(activeEntryDate\)/);
  assert.match(js, /activeEntryDate = text\.trim\(\) \? entry\.date : null/);
});

test("web history exposes the same full archive export action", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");
  const css = readFileSync(join(__dirname, "..", "styles.css"), "utf8");
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");

  assert.match(html, /id="exportAll"[^>]*class="nw-export-all"/);
  assert.match(html, />导出全部</);
  assert.match(css, /\.nw-export-all[\s\S]*color:\s*rgba\(132,\s*145,\s*181,\s*0\.78\)/);
  assert.match(js, /function formatExportText\(/);
  assert.match(js, /function downloadExportFile\(/);
  assert.match(js, /new Blob\(\[content\]/);
  assert.match(js, /exportAll\.addEventListener\("click"/);
});

test("mobile web export uses native file sharing with a visible copy fallback", () => {
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");

  assert.match(js, /navigator\.canShare\(\{ files: \[file\] \}\)/);
  assert.match(js, /navigator\.share\(\{ files: \[file\]/);
  assert.match(js, /navigator\.clipboard\.writeText/);
  assert.match(js, /navigator\.clipboard\.writeText[\s\S]*catch \{[\s\S]*document\.createElement\("textarea"\)/);
  assert.match(js, /document\.execCommand\("copy"\)/);
  assert.match(js, /MicroMessenger/);
  assert.match(js, /已复制，可粘贴保存/);
});

test("web export body starts with the user's dated writing, not the product title", () => {
  const js = readFileSync(join(__dirname, "..", "app.js"), "utf8");
  const source = [
    extractFunction(js, "parseEntryDate"),
    extractFunction(js, "getExportEntries"),
    extractFunction(js, "formatExportDate"),
    extractFunction(js, "formatExportText"),
    'result = formatExportText([{ date: "2026-06-21", text: "这是用户真正写下的内容" }]);'
  ].join("\n");
  const context = { Date, Map, result: "" };

  vm.runInNewContext(source, context);

  assert.equal(context.result, "\uFEFF2026年6月21日\n这是用户真正写下的内容\n");
  assert.doesNotMatch(context.result, /今夜写点啥|导出时间/);
  assert.doesNotMatch(js, /navigator\.share\(\{ files: \[file\], title:/);
});
