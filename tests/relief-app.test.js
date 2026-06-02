const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");

class FakeClassList {
  constructor(initial = "") {
    this.values = new Set(initial.split(/\s+/).filter(Boolean));
  }

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }

  toggle(value, force) {
    if (force === true) {
      this.add(value);
      return true;
    }
    if (force === false) {
      this.remove(value);
      return false;
    }
    if (this.values.has(value)) {
      this.remove(value);
      return false;
    }
    this.add(value);
    return true;
  }

  contains(value) {
    return this.values.has(value);
  }

  toString() {
    return [...this.values].join(" ");
  }
}

class FakeElement {
  constructor({ id = "", textContent = "", dataset = {}, className = "", type = "" } = {}) {
    this.id = id;
    this.attributes = {};
    this.files = [];
    this.href = "";
    this.download = "";
    this.type = type;
    this.value = "";
    this.textContent = textContent;
    this.innerHTML = "";
    this.dataset = dataset;
    this.listeners = {};
    this.classList = new FakeClassList(className);
  }

  addEventListener(type, handler) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(handler);
  }

  dispatchEvent(event) {
    event.target = event.target || this;
    for (const handler of this.listeners[event.type] || []) {
      handler(event);
    }
  }

  click() {
    this.dispatchEvent({ type: "click", target: this });
  }

  focus() {}

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getContext() {
    this.context = this.context || {
      drawImageCompositeOperations: [],
      globalCompositeOperation: "source-over",
      lineWidth: 0,
      strokeStyle: "",
      beginPath() {},
      clearRect() {},
      drawImage() {
        this.drawImageCompositeOperations.push(this.globalCompositeOperation);
      },
      lineTo() {},
      moveTo() {},
      scale() {},
      stroke() {}
    };
    return this.context;
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 800, height: 420 };
  }

  setPointerCapture() {}

  toDataURL() {
    return "data:image/png;base64,FAKE";
  }
}

function loadApp({ initialStorage = {} } = {}) {
  const elements = {
    noteInput: new FakeElement({ id: "noteInput" }),
    saveBtn: new FakeElement({ id: "saveBtn", textContent: "收进盒子" }),
    clearBtn: new FakeElement({ id: "clearBtn" }),
    promptBtn: new FakeElement({ id: "promptBtn" }),
    promptText: new FakeElement({ id: "promptText", textContent: "先写一句现在脑子里最吵的声音。" }),
    notesList: new FakeElement({ id: "notesList" }),
    noteMeta: new FakeElement({ id: "noteMeta" }),
    saveState: new FakeElement({ id: "saveState" }),
    noteCount: new FakeElement({ id: "noteCount" }),
    streakCount: new FakeElement({ id: "streakCount" }),
    searchInput: new FakeElement({ id: "searchInput" }),
    newNoteBtn: new FakeElement({ id: "newNoteBtn" }),
    focusBtn: new FakeElement({ id: "focusBtn" }),
    notebookBtn: new FakeElement({ id: "notebookBtn", textContent: "□" }),
    closeNotebookBtn: new FakeElement({ id: "closeNotebookBtn" }),
    exportBtn: new FakeElement({ id: "exportBtn" }),
    importBtn: new FakeElement({ id: "importBtn" }),
    importFileInput: new FakeElement({ id: "importFileInput", type: "file" }),
    doodleCanvas: new FakeElement({ id: "doodleCanvas", className: "hidden" }),
    doodleTools: new FakeElement({ id: "doodleTools", className: "hidden" }),
    clearDoodleBtn: new FakeElement({ id: "clearDoodleBtn" }),
    eraserBtn: new FakeElement({ id: "eraserBtn" }),
    aiCue: new FakeElement({ id: "aiCue", className: "hidden" }),
    aiCueText: new FakeElement({ id: "aiCueText" }),
    appendCueBtn: new FakeElement({ id: "appendCueBtn" }),
    refreshCueBtn: new FakeElement({ id: "refreshCueBtn" }),
    insightFocus: new FakeElement({ id: "insightFocus" }),
    insightSummary: new FakeElement({ id: "insightSummary" }),
    insightKeywords: new FakeElement({ id: "insightKeywords" }),
    insightNext: new FakeElement({ id: "insightNext" })
  };
  const body = new FakeElement({ className: "notebook-collapsed" });

  const categoryButtons = ["auto", "idea", "feeling", "mess"].map(
    (category) => new FakeElement({ dataset: { category } })
  );
  const releaseOptions = ["write", "doodle"].map(
    (releaseMode) => new FakeElement({ dataset: { releaseMode } })
  );
  const tabs = ["all", "idea", "feeling", "mess"].map((filter) => new FakeElement({ dataset: { filter } }));
  const colorSwatches = ["#20242b", "#1e9d92", "#d85855"].map((color) => new FakeElement({ dataset: { color } }));

  const byId = Object.fromEntries(Object.entries(elements).map(([key, element]) => [`#${element.id}`, element]));
  const localStorageData = new Map(Object.entries(initialStorage));
  const createdAnchors = [];
  const objectUrls = [];
  const windowListeners = {};

  const context = {
    Blob: class {
      constructor(parts, options) {
        this.parts = parts;
        this.type = options?.type || "";
      }

      async text() {
        return this.parts.join("");
      }
    },
    console,
    setTimeout,
    clearTimeout,
    window: {
      addEventListener(type, handler) {
        windowListeners[type] = handler;
      },
      devicePixelRatio: 1
    },
    document: {
      body,
      createElement(tagName) {
        if (tagName === "a") {
          const anchor = new FakeElement();
          anchor.click = () => {
            anchor.clicked = true;
          };
          createdAnchors.push(anchor);
          return anchor;
        }
        return new FakeElement();
      },
      querySelector(selector) {
        if (selector === "body") return body;
        return byId[selector] || null;
      },
      querySelectorAll(selector) {
        if (selector === ".box-option") return categoryButtons;
        if (selector === ".release-option") return releaseOptions;
        if (selector === ".tab") return tabs;
        if (selector === ".color-swatch") return colorSwatches;
        return [];
      }
    },
    FileReader: class {
      readAsText(file) {
        this.result = file.content;
        this.onload();
      }
    },
    localStorage: {
      getItem(key) {
        return localStorageData.has(key) ? localStorageData.get(key) : null;
      },
      setItem(key, value) {
        localStorageData.set(key, value);
      },
      removeItem(key) {
        localStorageData.delete(key);
      }
    },
    crypto: {
      randomUUID() {
        return "test-id";
      }
    },
    Image: class {
      set src(value) {
        this._src = value;
        if (this.onload) this.onload();
      }
    },
    Event: class {
      constructor(type) {
        this.type = type;
      }
    },
    URL: {
      createObjectURL(blob) {
        const url = `blob:test-${objectUrls.length}`;
        objectUrls.push({ blob, url });
        return url;
      },
      revokeObjectURL() {}
    }
  };

  vm.createContext(context);
  vm.runInContext(readFileSync(join(__dirname, "..", "app.js"), "utf8"), context);
  return { body, colorSwatches, createdAnchors, elements, localStorageData, objectUrls, releaseOptions, windowListeners };
}

test("揉掉重来 plays a release animation before clearing text", async () => {
  const { body, elements } = loadApp();
  elements.noteInput.value = "今天脑子里很吵";

  elements.clearBtn.click();

  assert.equal(body.classList.contains("release-clearing"), true);
  assert.equal(elements.noteInput.value, "今天脑子里很吵");

  await new Promise((resolve) => setTimeout(resolve, 520));

  assert.equal(elements.noteInput.value, "");
  assert.equal(body.classList.contains("release-clearing"), false);
  assert.equal(elements.saveState.textContent, "揉掉了，空出来了");
});

test("saving a note plays a received animation before clearing text", async () => {
  const { body, elements, localStorageData } = loadApp();
  elements.noteInput.value = "先放下一点点";

  elements.saveBtn.click();

  assert.equal(body.classList.contains("release-saving"), true);
  assert.equal(elements.noteInput.value, "先放下一点点");
  assert.equal(localStorageData.get("relief-notes:v1"), undefined);

  await new Promise((resolve) => setTimeout(resolve, 480));

  assert.equal(body.classList.contains("release-saving"), false);
  assert.equal(elements.noteInput.value, "");
  assert.equal(elements.saveState.textContent, "已接住");
  assert.match(localStorageData.get("relief-notes:v1"), /先放下一点点/);
});

test("揉掉重来 cancels a pending save animation before it writes to storage", async () => {
  const { body, elements, localStorageData } = loadApp();
  elements.noteInput.value = "这一句想反悔";

  elements.saveBtn.click();
  elements.clearBtn.click();

  assert.equal(body.classList.contains("release-saving"), false);
  assert.equal(body.classList.contains("release-clearing"), true);

  await new Promise((resolve) => setTimeout(resolve, 520));

  assert.equal(localStorageData.get("relief-notes:v1"), undefined);
  assert.equal(elements.noteInput.value, "");
  assert.equal(elements.saveState.textContent, "揉掉了，空出来了");
});

test("doodle eraser switches into erase mode and color switches back to ink", () => {
  const { colorSwatches, elements } = loadApp();

  elements.eraserBtn.click();

  assert.equal(elements.doodleCanvas.context.globalCompositeOperation, "destination-out");
  assert.equal(elements.doodleCanvas.context.lineWidth, 18);
  assert.equal(elements.eraserBtn.classList.contains("active"), true);

  colorSwatches[0].click();

  assert.equal(elements.doodleCanvas.context.globalCompositeOperation, "source-over");
  assert.equal(elements.doodleCanvas.context.lineWidth, 5);
  assert.equal(elements.eraserBtn.classList.contains("active"), false);
});

test("restoring a doodle image uses normal draw mode even when eraser is selected", () => {
  const { elements, releaseOptions, windowListeners } = loadApp();

  releaseOptions[1].click();
  elements.doodleCanvas.dispatchEvent({ type: "pointerdown", pointerId: 1, clientX: 8, clientY: 8 });
  elements.doodleCanvas.dispatchEvent({ type: "pointermove", clientX: 16, clientY: 16 });
  elements.doodleCanvas.dispatchEvent({ type: "pointerup" });
  elements.eraserBtn.click();

  windowListeners.resize();

  assert.equal(elements.doodleCanvas.context.drawImageCompositeOperations.at(-1), "source-over");
  assert.equal(elements.doodleCanvas.context.globalCompositeOperation, "destination-out");
});

test("export downloads current local notes as readable markdown", async () => {
  const { createdAnchors, elements, objectUrls } = loadApp({
    initialStorage: {
      "relief-notes:v1": JSON.stringify([
        {
          id: "n1",
          content: "可以导出的本地记录",
          category: "idea",
          label: "灵感",
          createdAt: "2026-05-31T00:00:00.000Z"
        },
        {
          id: "n2",
          content: "一张没有解释的涂鸦",
          doodle: "data:image/png;base64,FAKE",
          category: "mess",
          label: "碎片",
          createdAt: "2026-05-31T01:00:00.000Z"
        }
      ])
    }
  });

  elements.exportBtn.click();

  assert.equal(createdAnchors.length, 1);
  assert.equal(createdAnchors[0].clicked, true);
  assert.match(createdAnchors[0].download, /^relief-notes-\d{4}-\d{2}-\d{2}-\d{6}\.md$/);
  assert.equal(objectUrls[0].blob.type, "text/markdown;charset=utf-8");
  const markdown = await objectUrls[0].blob.text();
  assert.match(markdown, /^# 今天写点啥导出/m);
  assert.match(markdown, /## 05\/31 08:00 · 灵感/);
  assert.match(markdown, /可以导出的本地记录/);
  assert.match(markdown, /!\[涂鸦\]\(data:image\/png;base64,FAKE\)/);
});

test("launch copy does not claim AI for local rule-based cueing", () => {
  const html = readFileSync(join(__dirname, "..", "index.html"), "utf8");

  assert.doesNotMatch(html, /AI 提词器/);
  assert.match(html, /灵感回声/);
  assert.match(html, /内容只保存在本机浏览器/);
});

test("import replaces local notes from a json backup and refreshes the box", () => {
  const { elements, localStorageData } = loadApp();
  const imported = [{ id: "n2", content: "重新带回来的记录", category: "feeling", label: "心情", createdAt: "2026-05-31T00:00:00.000Z" }];
  elements.importFileInput.files = [{ content: JSON.stringify(imported) }];

  elements.importFileInput.dispatchEvent({ type: "change", target: elements.importFileInput });

  assert.equal(localStorageData.get("relief-notes:v1"), JSON.stringify(imported));
  assert.match(elements.notesList.innerHTML, /重新带回来的记录/);
  assert.equal(elements.saveState.textContent, "带回来了");
});

test("notebook drawer closes from inside the drawer", () => {
  const { body, elements } = loadApp();

  elements.notebookBtn.click();
  assert.equal(body.classList.contains("notebook-open"), true);

  elements.closeNotebookBtn.click();

  assert.equal(body.classList.contains("notebook-open"), false);
  assert.equal(elements.notebookBtn.textContent, "□");
});
