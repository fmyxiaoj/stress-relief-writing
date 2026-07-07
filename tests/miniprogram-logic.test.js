const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const { __test__ } = require("../miniprogram/pages/index/index.js");

test("creates a dated entry with non-space character count", () => {
  const entry = __test__.createEntry("  今晚\n想法  ", new Date(2026, 5, 16, 22, 30));

  assert.equal(entry.date, "2026-06-16");
  assert.equal(entry.text, "  今晚\n想法  ");
  assert.equal(entry.charCount, 4);
});

test("merges today's entry into archive and replaces old same-day draft", () => {
  const archive = __test__.mergeArchive(
    { date: "2026-06-16", text: "新的今晚", charCount: 4 },
    [
      { date: "2026-06-16", text: "旧的今晚", charCount: 4 },
      { date: "2026-06-15", text: "昨天", charCount: 2 }
    ]
  );

  assert.deepEqual(
    archive.map((entry) => [entry.date, entry.text]),
    [
      ["2026-06-16", "新的今晚"],
      ["2026-06-15", "昨天"]
    ]
  );
});

test("cross-midnight edits move one continuous draft to the latest edit date", () => {
  const archive = __test__.mergeArchive(
    { date: "2026-06-17", text: "跨日编辑后的内容", charCount: 8 },
    [
      { date: "2026-06-16", text: "跨日编辑前的内容", charCount: 8 },
      { date: "2026-06-15", text: "前天", charCount: 2 }
    ],
    "2026-06-16"
  );

  assert.deepEqual(
    archive.map((entry) => [entry.date, entry.text]),
    [
      ["2026-06-17", "跨日编辑后的内容"],
      ["2026-06-15", "前天"]
    ]
  );
});

test("clearing tonight removes today's archive entry but keeps older records", () => {
  const archive = __test__.mergeArchive(
    { date: "2026-06-16", text: "", charCount: 0 },
    [
      { date: "2026-06-16", text: "今晚", charCount: 2 },
      { date: "2026-06-15", text: "昨天", charCount: 2 }
    ]
  );

  assert.deepEqual(archive, [{ date: "2026-06-15", text: "昨天", charCount: 2 }]);
});

test("history keeps only non-empty records from the last 7 days in newest order", () => {
  const history = __test__.getHistoryEntries(
    [
      { date: "2026-06-16", text: "今天", charCount: 2 },
      { date: "2026-06-15", text: "昨天", charCount: 2 },
      { date: "2026-06-14", text: "   ", charCount: 0 },
      { date: "2026-06-10", text: "六天前", charCount: 3 },
      { date: "2026-06-09", text: "太早了", charCount: 3 },
      { date: "2026-06-17", text: "未来", charCount: 2 }
    ],
    new Date(2026, 5, 16, 12)
  );

  assert.deepEqual(
    history.map((entry) => entry.date),
    ["2026-06-16", "2026-06-15", "2026-06-10"]
  );
});

test("export contains every valid dated writing without product header metadata", () => {
  const exported = __test__.formatExportText(
    [
      { date: "2026-06-20", text: "今晚的记录" },
      { date: "2026-06-10", text: "十天前的记录" },
      { date: "2026-06-19", text: "   " },
      { date: "invalid", text: "无效日期" }
    ]
  );

  assert.match(exported, /^\uFEFF2026年6月20日\n今晚的记录/);
  assert.ok(exported.indexOf("2026年6月20日") < exported.indexOf("2026年6月10日"));
  assert.match(exported, /今晚的记录/);
  assert.match(exported, /十天前的记录/);
  assert.doesNotMatch(exported, /今[夜晚]写点啥|导出时间|共 2 条记录/);
  assert.doesNotMatch(exported, /无效日期/);
});

test("export filename is stable and readable", () => {
  assert.equal(__test__.getExportFilename(new Date(2026, 5, 20, 22, 35)), "今晚写点啥-2026-06-20.txt");
});

test("keyword insertion respects the current cursor like the web page", () => {
  assert.deepEqual(__test__.insertTextAtCursor("今晚有点累", "西瓜", 2), {
    text: "今晚西瓜有点累",
    cursor: 4
  });
  assert.deepEqual(__test__.insertTextAtCursor("今晚", "西瓜", 99), {
    text: "今晚西瓜",
    cursor: 4
  });
});

test("keyword tap inserts at the cursor without blurring the writing input", () => {
  let pageConfig;
  const calls = [];
  const source = readFileSync("miniprogram/pages/index/index.js", "utf8");
  const context = {
    Page(config) {
      pageConfig = config;
    },
    wx: {
      getStorageSync() {},
      setStorageSync() {},
      removeStorageSync() {}
    },
    clearTimeout,
    console,
    setTimeout() {
      return 1;
    }
  };
  vm.runInNewContext(source, context);

  const page = {
    ...pageConfig,
    data: {
      text: "今晚有点累",
      cursor: 2,
      inputFocused: true,
      saveStatus: "",
      saveStatusVisible: false,
      clearConfirmOpen: false
    },
    archive: [],
    keywords: ["西瓜", "风"],
    setData(update) {
      calls.push(update);
      this.data = { ...this.data, ...update };
    }
  };

  page.insertKeyword({ currentTarget: { dataset: { keyword: "西瓜" } } });

  assert.equal(page.data.text, "今晚西瓜有点累");
  assert.equal(page.data.cursor, 4);
  assert.equal(page.data.inputFocused, true);
  assert.equal(
    calls.some((call) => call.inputFocused === false),
    false
  );
});

test("selection changes update where the next keyword is inserted", () => {
  let pageConfig;
  const source = readFileSync("miniprogram/pages/index/index.js", "utf8");
  const context = {
    Page(config) {
      pageConfig = config;
    },
    wx: {
      getStorageSync() {},
      setStorageSync() {},
      removeStorageSync() {}
    },
    clearTimeout,
    console,
    setTimeout() {
      return 1;
    }
  };
  vm.runInNewContext(source, context);

  const page = {
    ...pageConfig,
    data: {
      text: "今晚有点累",
      cursor: 5,
      inputFocused: true,
      saveStatus: "",
      saveStatusVisible: false,
      clearConfirmOpen: false
    },
    archive: [],
    keywords: ["西瓜", "风"],
    setData(update) {
      this.data = { ...this.data, ...update };
    }
  };

  page.onSelectionChange({ detail: { selectionStart: 1, selectionEnd: 1 } });
  page.insertKeyword({ currentTarget: { dataset: { keyword: "西瓜" } } });

  assert.equal(page.data.text, "今西瓜晚有点累");
  assert.equal(page.data.cursor, 3);
});

test("keyword tap focus handling does not force blur before refocusing", () => {
  const source = readFileSync("miniprogram/pages/index/index.js", "utf8");
  const insertStart = source.indexOf("insertKeyword(event)");
  const insertEnd = source.indexOf("toggleHistory()", insertStart);
  const insertMethod = source.slice(insertStart, insertEnd);

  assert.doesNotMatch(insertMethod, /refocusWritingInput/);
  assert.doesNotMatch(source, /refocusWritingInput/);
});

test("clear tonight uses the same bottom confirmation drawer as web", () => {
  let pageConfig;
  const calls = [];
  const source = readFileSync("miniprogram/pages/index/index.js", "utf8");
  const context = {
    Page(config) {
      pageConfig = config;
    },
    wx: {
      getStorageSync() {},
      setStorageSync() {},
      removeStorageSync() {}
    },
    clearTimeout,
    console,
    setTimeout() {
      return 1;
    }
  };
  vm.runInNewContext(source, context);

  const page = {
    ...pageConfig,
    data: {
      text: "今晚有点累",
      hasText: true,
      historyOpen: true,
      clearConfirmOpen: false,
      saveStatus: "",
      saveStatusVisible: false
    },
    setData(update) {
      calls.push(update);
      this.data = { ...this.data, ...update };
    },
    closeHistory() {
      this.setData({ historyOpen: false });
    },
    focusWriting() {}
  };

  page.requestClearTonight();
  assert.equal(page.data.clearConfirmOpen, true);
  assert.equal(page.data.historyOpen, false);
  assert.equal(
    calls.some((call) => call.clearConfirming === true),
    false
  );

  page.cancelClearTonight();
  assert.equal(page.data.clearConfirmOpen, false);
});

test("export action writes user content and opens WeChat file sharing", () => {
  let pageConfig;
  let writtenFile;
  let sharedFile;
  const source = readFileSync("miniprogram/pages/index/index.js", "utf8");
  const context = {
    Page(config) {
      pageConfig = config;
    },
    wx: {
      env: { USER_DATA_PATH: "/user-data" },
      getFileSystemManager() {
        return {
          writeFile(options) {
            writtenFile = options;
            options.success();
          }
        };
      },
      shareFileMessage(options) {
        sharedFile = options;
      },
      showToast() {},
      getStorageSync() {},
      setStorageSync() {},
      removeStorageSync() {}
    },
    clearTimeout,
    console,
    setTimeout
  };
  vm.runInNewContext(source, context);

  const page = {
    ...pageConfig,
    data: { text: "这是用户真正写下的内容" },
    archive: [{ date: "2026-06-21", text: "这是用户真正写下的内容" }],
    persistText() {}
  };
  page.exportAll();

  assert.equal(writtenFile.encoding, "utf8");
  assert.equal(writtenFile.data, "\uFEFF2026年6月21日\n这是用户真正写下的内容\n");
  assert.equal(sharedFile.filePath, writtenFile.filePath);
  assert.match(sharedFile.fileName, /^今晚写点啥-\d{4}-\d{2}-\d{2}\.txt$/);
});

test("file sharing falls back to copying the complete writing", () => {
  const copied = [];
  const modals = [];
  const api = {
    shareFileMessage(options) {
      options.fail({ errMsg: "shareFileMessage:fail unsupported" });
    },
    setClipboardData(options) {
      copied.push(options.data);
      options.success();
    },
    showModal(options) {
      modals.push(options);
    },
    showToast() {}
  };
  const attempted = __test__.shareExportFile(
    "/user/export.txt",
    "export.txt",
    "\uFEFF2026年6月21日\n用户正文\n",
    api
  );

  assert.equal(attempted, true);
  assert.deepEqual(copied, ["2026年6月21日\n用户正文\n"]);
  assert.equal(modals[0].title, "已复制全部内容");
  assert.match(modals[0].content, /文件传输助手/);
});

test("clients without file sharing use the same clipboard fallback", () => {
  let copied = "";
  const api = {
    setClipboardData(options) {
      copied = options.data;
      options.success();
    },
    showModal() {},
    showToast() {}
  };

  const attempted = __test__.shareExportFile("/user/export.txt", "export.txt", "\uFEFF用户正文", api);

  assert.equal(attempted, true);
  assert.equal(copied, "用户正文");
});

test("uses web parity keyword generation instead of a fixed keyword list", () => {
  const firstDay = __test__.getKeywordCandidates(new Date(2026, 5, 16, 22, 30));
  const secondDay = __test__.getKeywordCandidates(new Date(2026, 5, 17, 22, 30));

  assert.equal(firstDay.length, 5);
  assert.equal(new Set(firstDay).size, 5);
  assert.notDeepEqual(firstDay, secondDay);
});

test("keyword items keep web visible state and active removal behavior", () => {
  const hidden = __test__.toKeywordItems(["西瓜", "晚风"], "", false);
  const visibleActive = __test__.toKeywordItems(["西瓜", "晚风"], "今晚想吃西瓜", true);
  const visibleRemoved = __test__.toKeywordItems(["西瓜", "晚风"], "今晚想吃水果", true, ["西瓜"]);

  assert.equal(hidden[0].visible, false);
  assert.equal(hidden[0].active, false);
  assert.equal(hidden[0].releasing, false);
  assert.equal(visibleActive[0].visible, true);
  assert.equal(visibleActive[0].active, true);
  assert.equal(visibleActive[0].releasing, false);
  assert.equal(visibleActive[1].active, false);
  assert.equal(visibleRemoved[0].visible, true);
  assert.equal(visibleRemoved[0].active, false);
  assert.equal(visibleRemoved[0].releasing, true);
});

test("refreshing text marks a removed active keyword for the release animation", () => {
  let pageConfig;
  let scheduledDelay;
  const source = readFileSync("miniprogram/pages/index/index.js", "utf8");
  const context = {
    Page(config) {
      pageConfig = config;
    },
    wx: {
      getStorageSync() {},
      setStorageSync() {},
      removeStorageSync() {}
    },
    clearTimeout,
    console,
    setTimeout(callback, delay) {
      scheduledDelay = delay;
      return 7;
    }
  };
  vm.runInNewContext(source, context);

  const page = {
    ...pageConfig,
    data: {
      text: "今晚想吃西瓜",
      keywordItems: [
        { word: "西瓜", visible: true, active: true },
        { word: "晚风", visible: true, active: false }
      ],
      keywordsVisible: true,
      saveStatus: "",
      saveStatusVisible: false,
      clearConfirmOpen: false
    },
    archive: [],
    keywords: ["西瓜", "晚风"],
    setData(update) {
      this.data = { ...this.data, ...update };
    }
  };

  page.refreshState("今晚想吃水果", { saveNow: false, now: new Date(2026, 5, 16, 22, 30) });

  assert.equal(page.data.keywordItems[0].word, "西瓜");
  assert.equal(page.data.keywordItems[0].active, false);
  assert.equal(page.data.keywordItems[0].releasing, true);
  assert.equal(page.data.keywordItems[1].releasing, false);
  assert.ok(scheduledDelay >= 700);
});

test("builds web parity visual state from daily accent and character count", () => {
  const blank = __test__.getVisualState("", new Date(2026, 5, 16, 22, 30));
  const firstChar = __test__.getVisualState("写", new Date(2026, 5, 16, 22, 30));
  const longText = __test__.getVisualState("写".repeat(120), new Date(2026, 5, 16, 22, 30));
  const state = __test__.buildState("写".repeat(60), [], new Date(2026, 5, 16, 22, 30));

  assert.equal(state.goodnightVisible, false);
  assert.equal(blank.lampPresence, "0.000");
  assert.equal(blank.writingLight, "0.060");
  assert.equal(blank.glowAlpha, "0.000");
  assert.equal(firstChar.lampPresence, "1.000");
  assert.equal(firstChar.writingLight, "0.132");
  assert.equal(firstChar.lineLight, "0.112");
  assert.equal(firstChar.glowAlpha, "0.130");
  assert.equal(firstChar.textGlow, "0.500");
  assert.equal(firstChar.roomQuiet, "0.000");
  assert.equal(longText.roomQuiet, "1.000");
  assert.equal(longText.vignetteAlpha, "1.000");
  assert.equal(state.visual.textGlow, "0.500");
  assert.equal(state.visual.glowAlpha, "0.130");
  assert.match(state.writerStyle, /--bg-r:\s*\d+;/);
  assert.match(state.writerStyle, /--lamp-presence:\s*1\.000;/);
  assert.match(state.writerStyle, /--writing-light:\s*0\.132;/);
  assert.match(state.writerStyle, /--line-light:\s*0\.112;/);
  assert.match(state.writerStyle, /--room-quiet:\s*0\.390;/);
  assert.match(state.writerStyle, /--glow-alpha:\s*0\.130;/);
  assert.equal(state.keywordItems.length, 5);
});
