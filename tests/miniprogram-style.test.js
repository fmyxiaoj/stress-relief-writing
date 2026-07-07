const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const wxss = fs.readFileSync("miniprogram/pages/index/index.wxss", "utf8");
const wxml = fs.readFileSync("miniprogram/pages/index/index.wxml", "utf8");
const pageConfig = JSON.parse(fs.readFileSync("miniprogram/pages/index/index.json", "utf8"));
const appConfig = JSON.parse(fs.readFileSync("miniprogram/app.json", "utf8"));

function block(selector) {
  const pattern = new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`, "m");
  return wxss.match(pattern)?.[1] || "";
}

test("resets mini program button chrome on every custom button", () => {
  const baseButton = block("button");
  const buttonTags = wxml.match(/<button\b[^>]*>/g) || [];

  assert.match(baseButton, /margin:\s*0;/);
  assert.match(baseButton, /border:\s*0;/);
  assert.match(baseButton, /border-radius:\s*0;/);
  assert.match(baseButton, /line-height:\s*normal;/);
  assert.match(baseButton, /background:\s*transparent;/);
  assert.ok(buttonTags.length > 0);
  buttonTags.forEach((tag) => {
    assert.match(tag, /hover-class="none"/);
  });
});

test("history rows are views, not default mini program buttons", () => {
  assert.doesNotMatch(wxml, /class="history-item"/);
  assert.match(wxml, /class="history-row"/);
  assert.match(block(".history-row"), /display:\s*block;/);
});

test("page uses native navigation title instead of a custom navigation canvas", () => {
  assert.equal(appConfig.window.navigationBarTitleText, "今晚写点啥");
  assert.equal(pageConfig.navigationBarTitleText, "今晚写点啥");
  assert.notEqual(pageConfig.navigationStyle, "custom");
  assert.match(block(".writer"), /height:\s*100vh;/);
  assert.match(block(".writer"), /animation:\s*night-entry\s+900ms\s+ease\s+both;/);
});

test("history overlay dims the writing surface behind the panel", () => {
  assert.match(wxml, /class="history-scrim"/);
  const scrim = block(".history-scrim");
  const dimmed = block(".history-open .textarea,\n.history-open .keyword-layer,\n.history-open .intro,\n.history-open .clear-tonight,\n.history-open .save-status");

  assert.match(scrim, /position:\s*absolute;/);
  assert.match(scrim, /z-index:\s*50;/);
  assert.match(scrim, /background:\s*rgba\(2,\s*3,\s*8,\s*0\.42\)/);
  assert.match(dimmed, /opacity:\s*0\.18;/);
  assert.match(dimmed, /filter:\s*blur\(0\.6px\);/);
});

test("history trigger stays in the web top-right position above the writing surface", () => {
  const historyDot = block(".history-dot");
  const historyMark = block(".history-dot-mark");
  const historyHint = block(".history-hint");
  const historyHintVisible = block(".history-hint.visible");
  const textarea = block(".textarea");
  const scrim = block(".history-scrim");
  const panel = block(".history-panel");

  const historyZ = Number(historyDot.match(/z-index:\s*(\d+);/)?.[1]);
  const textareaZ = Number(textarea.match(/z-index:\s*(\d+);/)?.[1]);
  const scrimZ = Number(scrim.match(/z-index:\s*(\d+);/)?.[1]);
  const panelZ = Number(panel.match(/z-index:\s*(\d+);/)?.[1]);

  assert.doesNotMatch(wxml, /<button\s+class="history-dot"/);
  assert.match(wxml, /<view\s+class="history-dot\s+\{\{historyOpen \? 'returning' : ''\}\}"/);
  assert.doesNotMatch(wxml, /historyChromeStyle/);
  assert.match(wxml, /class="history-dot\s+\{\{historyOpen \? 'returning' : ''\}\}"[^>]*catchtap="toggleHistory"/);
  assert.match(wxml, /aria-label="\{\{historyOpen \? '返回当前输入' : '查看过去 7 天'\}\}"/);
  assert.match(wxml, /class="history-dot-mark"[^>]*wx:if="\{\{!historyOpen\}\}"/);
  assert.match(wxml, /historyHintVisible \|\| historyOpen/);
  assert.match(wxml, /\{\{historyOpen \? '返回' : '过去 7 天'\}\}/);
  assert.match(historyDot, /top:\s*52rpx;/);
  assert.match(historyDot, /right:\s*36rpx;/);
  assert.match(historyDot, /min-width:\s*208rpx;/);
  assert.match(historyDot, /min-height:\s*88rpx;/);
  assert.match(historyDot, /height:\s*88rpx;/);
  assert.match(historyDot, /border-radius:\s*999rpx;/);
  assert.match(historyDot, /overflow:\s*visible;/);
  assert.match(historyMark, /top:\s*36rpx;/);
  assert.match(historyMark, /right:\s*16rpx;/);
  assert.match(historyMark, /width:\s*14rpx;/);
  assert.match(historyMark, /height:\s*14rpx;/);
  assert.match(historyHint, /right:\s*52rpx;/);
  assert.match(historyHint, /opacity:\s*0\.58;/);
  assert.match(historyHintVisible, /opacity:\s*0\.78;/);
  assert.match(block(".history-dot.returning .history-hint"), /right:\s*0;/);
  assert.match(block(".history-dot.returning .history-hint"), /opacity:\s*0\.86;/);
  assert.ok(historyZ > textareaZ);
  assert.ok(historyZ > scrimZ);
  assert.ok(scrimZ > textareaZ);
  assert.ok(panelZ > scrimZ);
  assert.ok(historyZ > panelZ);
});

test("history panel matches the web right-top floating panel", () => {
  const panel = block(".history-panel");
  const top = block(".history-top");
  const text = block(".history-text");
  const detail = block(".history-detail");

  assert.doesNotMatch(wxml, /historyPanelStyle/);
  assert.match(panel, /top:\s*96rpx;/);
  assert.match(panel, /right:\s*24rpx;/);
  assert.match(panel, /left:\s*24rpx;/);
  assert.match(panel, /width:\s*auto;/);
  assert.match(panel, /max-width:\s*680rpx;/);
  assert.match(panel, /border-radius:\s*16rpx;/);
  assert.match(panel, /box-shadow:/);
  assert.match(top, /display:\s*grid;/);
  assert.match(top, /grid-template-columns:\s*88rpx 1fr 88rpx;/);
  assert.match(text, /display:\s*-webkit-box;/);
  assert.match(text, /-webkit-line-clamp:\s*4;/);
  assert.match(detail, /overflow:\s*auto;/);
});

test("primary interactions stop bubbling like the web implementation", () => {
  const keywordTags = wxml.match(/<view\b[^>]*class="keyword\s[^"]*"[^>]*>/g) || [];

  assert.match(wxml, /class="writer[^"]*"[^>]*bindtap="focusWriting"/);
  assert.doesNotMatch(wxml, /<button\b[^>]*class="keyword/);
  assert.equal(keywordTags.length, 1);
  assert.match(keywordTags[0], /role="button"/);
  assert.match(keywordTags[0], /catchtap="insertKeyword"/);
  assert.match(wxml, /class="keyword\s+keyword-\{\{index\}\}[^"]*"[\s\S]*catchtap="insertKeyword"/);
  assert.match(wxml, /class="history-panel"[^>]*catchtap="noop"/);
  assert.match(wxml, /class="history-close"[^>]*catchtap="closeHistory"/);
  assert.match(wxml, /class="history-back"[^>]*catchtap="backToHistory"/);
  assert.match(wxml, /class="history-row"[\s\S]*catchtap="openDetail"/);
  assert.match(wxml, /class="clear-tonight[^"]*"[^>]*catchtap="requestClearTonight"/);
  assert.match(wxml, /focus="\{\{inputFocused\}\}"/);
  assert.match(wxml, /cursor="\{\{cursor\}\}"/);
  assert.match(wxml, /selection-start="\{\{cursor\}\}"/);
  assert.match(wxml, /selection-end="\{\{cursor\}\}"/);
  assert.match(wxml, /bindselectionchange="onSelectionChange"/);
  assert.match(wxml, /hold-keyboard="\{\{true\}\}"/);
  assert.match(wxml, /adjust-position="\{\{true\}\}"/);
  const cursorSpacing = Number(wxml.match(/cursor-spacing="(\d+)"/)?.[1]);
  assert.ok(cursorSpacing >= 96);
});

test("history footer exposes a quiet export action without native button flash", () => {
  const exportButton = block(".export-all");
  const exportLabel = block(".export-label");

  assert.match(wxml, /<view\s+class="export-all"[^>]*role="button"[^>]*hover-class="none"[^>]*catchtap="exportAll"/);
  assert.doesNotMatch(wxml, /<button\s+class="export-all"/);
  assert.match(wxml, /<text\s+class="export-label">导出全部<\/text>/);
  assert.match(exportButton, /display:\s*flex;/);
  assert.match(exportButton, /width:\s*100%;/);
  assert.match(exportButton, /min-height:\s*88rpx;/);
  assert.match(exportButton, /background:\s*transparent;/);
  assert.match(exportButton, /color:\s*rgba\(132,\s*145,\s*181,\s*0\.78\);/);
  assert.match(exportLabel, /display:\s*block;/);
  assert.match(exportLabel, /width:\s*100%;/);
  assert.match(exportLabel, /text-align:\s*left;/);
});

test("bottom states match the web positions and animation model", () => {
  const goodnight = block(".goodnight");
  const clear = block(".clear-tonight");
  const save = block(".save-status");
  const pulse = wxss.match(/@keyframes\s+goodnight-pulse\s*\{[\s\S]*?\n\}/)?.[0] || "";

  assert.match(goodnight, /bottom:\s*56rpx;/);
  assert.match(goodnight, /animation:\s*goodnight-pulse\s+3000ms\s+ease-in-out\s+infinite;/);
  assert.match(clear, /bottom:\s*48rpx;/);
  assert.match(clear, /left:\s*44rpx;/);
  assert.match(clear, /min-width:\s*176rpx;/);
  assert.match(clear, /min-height:\s*88rpx;/);
  assert.match(clear, /display:\s*flex;/);
  assert.match(save, /bottom:\s*116rpx;/);
  assert.match(pulse, /drop-shadow/);
});

test("writing surface keeps web copy and layered visual elements", () => {
  const writer = block(".writer");
  const intro = block(".intro");
  const textarea = block(".textarea");
  const keyword0 = block(".keyword-0");
  const keyword1 = block(".keyword-1");
  const keyword2 = block(".keyword-2");
  const keyword3 = block(".keyword-3");
  const keyword4 = block(".keyword-4");
  const hasTextKeyword = block(".has-text .keyword");
  const hasTextActiveKeyword = block(".has-text .keyword.active");

  assert.match(wxml, /class="glow"/);
  assert.match(wxml, /class="vignette"/);
  assert.match(wxml, /placeholder="写下今晚脑子里放不下的东西…"/);
  assert.match(wxml, /<view class="intro" wx:if="\{\{!hasText\}\}">\s*<text>本机保存<\/text>\s*<text>不登录，不上传<\/text>\s*<\/view>/);
  assert.doesNotMatch(wxml, /本机保存 · 不登录 · 不上传/);
  assert.match(writer, /--content-x:\s*60rpx;/);
  assert.match(writer, /--intro-x:\s*72rpx;/);
  assert.match(intro, /left:\s*var\(--intro-x\);/);
  assert.match(intro, /display:\s*flex;/);
  assert.match(intro, /flex-direction:\s*column;/);
  assert.match(textarea, /padding:\s*152rpx var\(--content-x\) 176rpx;/);
  assert.match(keyword0, /top:\s*25%(?:\s*!important)?;/);
  assert.match(keyword0, /left:\s*var\(--content-x\)(?:\s*!important)?;/);
  assert.match(keyword1, /top:\s*23%(?:\s*!important)?;/);
  assert.match(keyword1, /right:\s*18%(?:\s*!important)?;/);
  assert.match(keyword2, /top:\s*42%(?:\s*!important)?;/);
  assert.match(keyword2, /right:\s*10%(?:\s*!important)?;/);
  assert.match(keyword3, /top:\s*64%(?:\s*!important)?;/);
  assert.match(keyword3, /left:\s*var\(--content-x\)(?:\s*!important)?;/);
  assert.match(keyword4, /bottom:\s*17%(?:\s*!important)?;/);
  assert.match(keyword4, /right:\s*10%(?:\s*!important)?;/);
  assert.match(hasTextKeyword, /opacity:\s*0\.42;/);
  assert.match(hasTextActiveKeyword, /opacity:\s*1;/);
  assert.match(wxml, /style="\{\{writerStyle\}\}"/);
});
