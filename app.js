const STORAGE_KEY = "relief-notes:v1";

const prompts = [
  "先写一句现在脑子里最吵的声音。",
  "如果今天是一种天气，它是什么？",
  "写三个词：一个给现在，一个给过去，一个给等会儿。",
  "把脑子里最占地方的事写成一句很短的话。",
  "从“我其实只是……”开始写。",
  "给今天起一个很离谱但真实的标题。",
  "写下一个你不想解释的感受。",
  "把注意力放到手上，写它想写的第一个字。"
];

const categoryRules = [
  { type: "feeling", label: "心情", words: ["难受", "开心", "烦", "累", "焦虑", "害怕", "喜欢", "讨厌", "压力"] },
  { type: "idea", label: "灵感", words: ["想法", "灵感", "可以", "方案", "故事", "标题", "产品", "设计"] },
  { type: "mess", label: "碎片", words: ["不知道", "随便", "啊", "数字", "梦", "乱", "碎", "空"] }
];

const categories = {
  idea: "灵感",
  feeling: "心情",
  mess: "碎片"
};

const cueTemplates = {
  feeling: [
    "也许可以接着写：这件事真正压住我的地方是……",
    "换个角度写一句：我其实希望自己被怎样对待？",
    "把感受落到身体上：它现在像压在什么位置？"
  ],
  idea: [
    "可以顺着这个想法问：如果只做最小一步，会是什么？",
    "把它变成一个标题试试：一个关于……的故事。",
    "接着写一个使用场景：某个人在什么时候会需要它？"
  ],
  mess: [
    "不用整理，继续写下一个跳出来的词。",
    "把这团东西先命名：它现在像什么？",
    "随便接一句：我不知道，但我注意到……"
  ]
};

const keywordBank = [
  "压力",
  "焦虑",
  "拖延",
  "产品",
  "写作",
  "灵感",
  "设计",
  "故事",
  "工作",
  "学习",
  "心情",
  "AI",
  "整理",
  "记录",
  "注意力",
  "完美主义"
];

const noteInput = document.querySelector("#noteInput");
const saveBtn = document.querySelector("#saveBtn");
const clearBtn = document.querySelector("#clearBtn");
const promptBtn = document.querySelector("#promptBtn");
const promptText = document.querySelector("#promptText");
const notesList = document.querySelector("#notesList");
const noteMeta = document.querySelector("#noteMeta");
const saveState = document.querySelector("#saveState");
const noteCount = document.querySelector("#noteCount");
const streakCount = document.querySelector("#streakCount");
const searchInput = document.querySelector("#searchInput");
const newNoteBtn = document.querySelector("#newNoteBtn");
const focusBtn = document.querySelector("#focusBtn");
const notebookBtn = document.querySelector("#notebookBtn");
const closeNotebookBtn = document.querySelector("#closeNotebookBtn");
const exportBtn = document.querySelector("#exportBtn");
const importBtn = document.querySelector("#importBtn");
const importFileInput = document.querySelector("#importFileInput");
const tabs = document.querySelectorAll(".tab");
const categoryButtons = document.querySelectorAll(".box-option");
const releaseOptions = document.querySelectorAll(".release-option");
const doodleCanvas = document.querySelector("#doodleCanvas");
const doodleTools = document.querySelector("#doodleTools");
const clearDoodleBtn = document.querySelector("#clearDoodleBtn");
const eraserBtn = document.querySelector("#eraserBtn");
const colorSwatches = document.querySelectorAll(".color-swatch");
const aiCue = document.querySelector("#aiCue");
const aiCueText = document.querySelector("#aiCueText");
const appendCueBtn = document.querySelector("#appendCueBtn");
const refreshCueBtn = document.querySelector("#refreshCueBtn");
const insightFocus = document.querySelector("#insightFocus");
const insightSummary = document.querySelector("#insightSummary");
const insightKeywords = document.querySelector("#insightKeywords");
const insightNext = document.querySelector("#insightNext");

let notes = loadNotes();
let activeFilter = "all";
let selectedCategory = "auto";
let editingNoteId = null;
let releaseMode = "write";
let draftTimer;
let cueTimer;
let releaseTimer;
let saveReleaseTimer;
let currentCue = "";
let cueVariant = 0;
let isDrawing = false;
let hasDoodle = false;
let brushColor = "#20242b";
let doodleTool = "brush";

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function persistNotes(feedback = "已本地保存") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  saveState.textContent = feedback;
}

function formatExportStamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function notesToMarkdown(exportedNotes) {
  const lines = [
    "# 今天写点啥导出",
    "",
    `导出时间：${new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date())}`,
    "",
    "内容来自本机浏览器导出。",
    ""
  ];

  if (exportedNotes.length === 0) {
    lines.push("还没有被接住的内容。");
    return lines.join("\n");
  }

  exportedNotes.forEach((note) => {
    lines.push(`## ${formatTime(note.createdAt)} · ${note.label || categories[note.category] || "碎片"}`);
    lines.push("");
    if (note.doodle) {
      lines.push(`![涂鸦](${note.doodle})`);
      lines.push("");
    }
    lines.push(note.content || "一张没有解释的涂鸦");
    lines.push("");
  });

  return lines.join("\n").trimEnd() + "\n";
}

function exportNotes() {
  const blob = new Blob([notesToMarkdown(notes)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `relief-notes-${formatExportStamp()}.md`;
  link.click();
  URL.revokeObjectURL(url);
  saveState.textContent = `带走了 ${notes.length} 条`;
}

function importNotesFromFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const importedNotes = JSON.parse(reader.result);
      if (!Array.isArray(importedNotes)) {
        saveState.textContent = "这份备份读不了";
        return;
      }

      notes = importedNotes;
      persistNotes("带回来了");
      render();
    } catch {
      saveState.textContent = "这份备份读不了";
    }
  };
  reader.readAsText(file);
}

function classify(text) {
  const normalized = text.toLowerCase();
  const match = categoryRules.find((rule) => rule.words.some((word) => normalized.includes(word)));
  return match ?? { type: "mess", label: "碎片" };
}

function getSaveCategory(text) {
  if (selectedCategory === "auto") {
    return classify(text);
  }

  return {
    type: selectedCategory,
    label: categories[selectedCategory]
  };
}

function countText(text) {
  return text.replace(/\s/g, "").length;
}

function hasContent() {
  return Boolean(noteInput.value.trim()) || hasDoodle;
}

function isToday(dateValue) {
  if (!dateValue) return false;
  return new Date(dateValue).toDateString() === new Date().toDateString();
}

function getCurrentCategory(text) {
  return selectedCategory === "auto" ? classify(text) : { type: selectedCategory, label: categories[selectedCategory] };
}

function formatTime(dateValue) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

function saveNote() {
  const content = noteInput.value.trim();
  if (!hasContent()) {
    noteInput.focus();
    saveState.textContent = "留一点点就能收";
    return;
  }

  const category = getSaveCategory(content);
  const doodle = hasDoodle ? doodleCanvas.toDataURL("image/png") : "";
  const noteId = editingNoteId;

  clearTimeout(saveReleaseTimer);
  hideCue();
  document.body.classList.add("release-saving");

  saveReleaseTimer = setTimeout(() => {
    commitNote({ content, category, doodle, noteId });
    document.body.classList.remove("release-saving");
    resetEditor();
    persistNotes("已接住");
    render();
    noteInput.focus();
  }, 420);
}

function commitNote({ content, category, doodle, noteId }) {
  if (noteId) {
    notes = notes.map((note) =>
      note.id === noteId
        ? {
            ...note,
            content: content || "一张没有解释的涂鸦",
            doodle,
            category: category.type,
            label: category.label,
            updatedAt: new Date().toISOString()
          }
        : note
    );
  } else {
    notes.unshift({
      id: crypto.randomUUID(),
      content: content || "一张没有解释的涂鸦",
      doodle,
      category: category.type,
      label: category.label,
      createdAt: new Date().toISOString()
    });
  }
}

function render() {
  const keyword = searchInput.value.trim().toLowerCase();
  const visibleNotes = notes.filter((note) => {
    const matchFilter = activeFilter === "all" || note.category === activeFilter;
    const matchKeyword = !keyword || `${note.content} ${note.label}`.toLowerCase().includes(keyword);
    return matchFilter && matchKeyword;
  });

  noteCount.textContent = notes.length;
  const todayNotes = getTodayNotes();
  streakCount.textContent = todayNotes.length > 0 ? categories[getDominantCategory(todayNotes)] : "松弛";
  renderDailyInsight();

  if (visibleNotes.length === 0) {
    notesList.innerHTML = '<p class="empty-state">盒子还是空的。先丢进来一句话，不需要像样。</p>';
    return;
  }

  notesList.innerHTML = visibleNotes
    .map(
      (note) => `
        <article class="note-card ${note.id === editingNoteId ? "editing" : ""}">
          <button class="note-open" type="button" data-note-id="${note.id}" aria-label="打开这条闪记">
            ${note.doodle ? `<img class="note-doodle" src="${note.doodle}" alt="涂鸦缩略图" />` : ""}
            <p>${escapeHtml(note.content)}</p>
          </button>
            <footer>
              <span class="tag">${note.label}</span>
              <span>${formatTime(note.createdAt)}</span>
              <button class="note-delete" type="button" data-delete-id="${note.id}" title="删除" aria-label="删除这条闪记">×</button>
            </footer>
        </article>
      `
    )
    .join("");
}

function getTodayNotes() {
  return notes.filter((note) => isToday(note.createdAt));
}

function extractKeywords(todayNotes) {
  const text = todayNotes.map((note) => note.content).join(" ");
  const scored = keywordBank
    .map((keyword) => {
      const matches = text.match(new RegExp(keyword, "gi"));
      return { keyword, score: matches ? matches.length : 0 };
    })
    .filter((item) => item.score > 0);

  const englishWords = text
    .toLowerCase()
    .match(/[a-z][a-z0-9-]{2,}/g);

  if (englishWords) {
    const englishCounts = englishWords.reduce((map, word) => {
      map.set(word, (map.get(word) ?? 0) + 1);
      return map;
    }, new Map());

    englishCounts.forEach((score, keyword) => {
      scored.push({ keyword, score });
    });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.keyword.localeCompare(b.keyword))
    .slice(0, 5)
    .map((item) => item.keyword);
}

function getDominantCategory(todayNotes) {
  const counts = todayNotes.reduce(
    (total, note) => {
      total[note.category] = (total[note.category] ?? 0) + 1;
      return total;
    },
    { idea: 0, feeling: 0, mess: 0 }
  );

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function getInsightNext(categoryType, keywords) {
  const firstKeyword = keywords[0] ?? "这件事";
  const nextByCategory = {
    feeling: `下一句可以写：${firstKeyword}真正影响我的，是哪一小块？`,
    idea: `下一句可以写：如果只推进${firstKeyword}的一小步，会是什么？`,
    mess: `下一句可以写：这些碎片里，哪一个最想先被留下？`
  };

  return nextByCategory[categoryType] ?? nextByCategory.mess;
}

function renderDailyInsight() {
  const todayNotes = getTodayNotes();

  if (todayNotes.length === 0) {
    insightFocus.textContent = "等待输入";
    insightSummary.textContent = "这里不会催你复盘，只会在你留下东西后，轻轻回声一下。";
    insightKeywords.innerHTML = "";
    insightNext.textContent = "先写一句，不急着总结。";
    return;
  }

  const dominantCategory = getDominantCategory(todayNotes);
  const keywords = extractKeywords(todayNotes);
  const focusLabel = categories[dominantCategory] ?? "碎片";
  const keywordText = keywords.length > 0 ? `，里面轻轻冒出来的是「${keywords.slice(0, 3).join("、")}」` : "";

  insightFocus.textContent = focusLabel;
  insightSummary.textContent = `今天已经被接住 ${todayNotes.length} 次。整体更像「${focusLabel}」${keywordText}。`;
  insightKeywords.innerHTML = keywords.map((keyword) => `<span class="keyword-chip">${escapeHtml(keyword)}</span>`).join("");
  insightNext.textContent = getInsightNext(dominantCategory, keywords);
}

function updateMeta() {
  const content = noteInput.value;
  const category = selectedCategory === "auto" ? (content.trim() ? classify(content).label : "未分类") : categories[selectedCategory];
  const amount = hasDoodle && !content.trim() ? "一张涂鸦" : content.trim() ? "一点点" : "空空的";
  noteMeta.textContent = `${amount} · ${category}${editingNoteId ? " · 编辑中" : ""}`;
}

function selectCategory(category) {
  selectedCategory = category;
  categoryButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  updateMeta();
}

function getCanvasContext() {
  const context = doodleCanvas.getContext("2d");
  context.lineCap = "round";
  context.lineJoin = "round";
  context.globalCompositeOperation = doodleTool === "eraser" ? "destination-out" : "source-over";
  context.lineWidth = doodleTool === "eraser" ? 18 : 5;
  context.strokeStyle = brushColor;
  return context;
}

function selectDoodleTool(tool) {
  doodleTool = tool;
  eraserBtn.classList.toggle("active", tool === "eraser");
  colorSwatches.forEach((item) => {
    item.classList.toggle("active", tool === "brush" && item.dataset.color === brushColor);
  });
  getCanvasContext();
}

function resizeDoodleCanvas() {
  const previous = hasDoodle ? doodleCanvas.toDataURL("image/png") : "";
  const rect = doodleCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  doodleCanvas.width = Math.max(1, Math.floor(rect.width * ratio));
  doodleCanvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const context = getCanvasContext();
  context.scale(ratio, ratio);

  if (previous) {
    loadDoodle(previous);
  }
}

function clearDoodle() {
  const rect = doodleCanvas.getBoundingClientRect();
  getCanvasContext().clearRect(0, 0, rect.width, rect.height);
  hasDoodle = false;
  updateMeta();
}

function loadDoodle(dataUrl) {
  if (!dataUrl) {
    clearDoodle();
    return;
  }

  const image = new Image();
  image.onload = () => {
    const rect = doodleCanvas.getBoundingClientRect();
    const context = getCanvasContext();
    context.clearRect(0, 0, rect.width, rect.height);
    context.globalCompositeOperation = "source-over";
    context.drawImage(image, 0, 0, rect.width, rect.height);
    hasDoodle = true;
    getCanvasContext();
    updateMeta();
  };
  image.src = dataUrl;
}

function getPointerPosition(event) {
  const rect = doodleCanvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function startDoodle(event) {
  isDrawing = true;
  doodleCanvas.setPointerCapture(event.pointerId);
  const point = getPointerPosition(event);
  const context = getCanvasContext();
  context.beginPath();
  context.moveTo(point.x, point.y);
}

function drawDoodle(event) {
  if (!isDrawing) return;

  const point = getPointerPosition(event);
  const context = getCanvasContext();
  context.lineTo(point.x, point.y);
  context.stroke();
  hasDoodle = true;
  updateMeta();
}

function stopDoodle() {
  isDrawing = false;
}

function selectReleaseMode(mode) {
  releaseMode = mode;
  releaseOptions.forEach((button) => {
    button.classList.toggle("active", button.dataset.releaseMode === mode);
  });
  noteInput.classList.toggle("hidden", mode !== "write");
  doodleCanvas.classList.toggle("hidden", mode !== "doodle");
  doodleTools.classList.toggle("hidden", mode !== "doodle");

  if (mode === "doodle") {
    resizeDoodleCanvas();
  } else {
    noteInput.focus();
  }
}

function resetEditor() {
  editingNoteId = null;
  noteInput.value = "";
  saveBtn.textContent = "收进盒子";
  localStorage.removeItem(`${STORAGE_KEY}:draft`);
  clearDoodle();
  hideCue();
  selectReleaseMode("write");
  updateMeta();
}

function editNote(note) {
  editingNoteId = note.id;
  noteInput.value = note.content;
  saveBtn.textContent = "更新这条";
  saveState.textContent = "正在编辑旧闪记";
  selectCategory(note.category);
  if (note.doodle) {
    selectReleaseMode("doodle");
    loadDoodle(note.doodle);
  } else {
    clearDoodle();
    selectReleaseMode("write");
  }
  render();
  scheduleCue();
  noteInput.focus();
}

function getLastFragment(text) {
  const fragments = text
    .split(/[。！？!?，,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return fragments[fragments.length - 1];
}

function getRecentContext(categoryType) {
  return notes.find((note) => note.category === categoryType && note.id !== editingNoteId)?.content.trim();
}

function buildCue() {
  const content = noteInput.value.trim();
  if (countText(content) < 3) return "";

  const category = getCurrentCategory(content);
  const lastFragment = getLastFragment(content);
  const recentContext = getRecentContext(category.type);
  const templates = cueTemplates[category.type] ?? cueTemplates.mess;
  const seed = countText(content) + notes.length + new Date().getMinutes() + cueVariant;
  const template = templates[seed % templates.length];

  if (recentContext && recentContext !== content) {
    return `${template} 你之前也写过“${recentContext.slice(0, 18)}”，这次可以补一句它和现在有什么不同。`;
  }

  if (lastFragment) {
    return `${template} 刚才这句“${lastFragment.slice(0, 18)}”里，最值得继续追的是哪个词？`;
  }

  return template;
}

function showCue(cue) {
  currentCue = cue;
  aiCueText.textContent = cue;
  aiCue.classList.remove("hidden");
}

function hideCue() {
  clearTimeout(cueTimer);
  currentCue = "";
  aiCue.classList.add("hidden");
}

function scheduleCue() {
  clearTimeout(cueTimer);
  cueVariant = 0;
  aiCue.classList.add("hidden");
  cueTimer = setTimeout(() => {
    const cue = buildCue();
    if (cue) {
      showCue(cue);
    }
  }, 5000);
}

function appendCue() {
  if (!currentCue) return;

  const spacer = noteInput.value.trim() ? "\n" : "";
  noteInput.value = `${noteInput.value}${spacer}${currentCue}`;
  noteInput.dispatchEvent(new Event("input"));
  hideCue();
  noteInput.focus();
}

function releaseClear() {
  if (!hasContent()) {
    saveState.textContent = "已经是空的";
    noteInput.focus();
    return;
  }

  clearTimeout(releaseTimer);
  clearTimeout(saveReleaseTimer);
  hideCue();
  document.body.classList.remove("release-saving");
  document.body.classList.add("release-clearing");

  releaseTimer = setTimeout(() => {
    noteInput.value = "";
    if (!editingNoteId) {
      localStorage.removeItem(`${STORAGE_KEY}:draft`);
    }
    clearDoodle();
    document.body.classList.remove("release-clearing");
    saveState.textContent = "揉掉了，空出来了";
    updateMeta();
    noteInput.focus();
  }, 460);
}

function rotatePrompt() {
  const current = promptText.textContent;
  const pool = prompts.filter((prompt) => prompt !== current);
  promptText.textContent = pool[Math.floor(Math.random() * pool.length)];
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[char];
  });
}

noteInput.addEventListener("input", () => {
  updateMeta();
  saveState.textContent = "草稿在本机";
  clearTimeout(draftTimer);
  scheduleCue();
  draftTimer = setTimeout(() => {
    if (!editingNoteId) {
      localStorage.setItem(`${STORAGE_KEY}:draft`, noteInput.value);
      saveState.textContent = "草稿已暂存";
      return;
    }

    saveState.textContent = "改完记得更新";
  }, 260);
});

saveBtn.addEventListener("click", saveNote);
clearBtn.addEventListener("click", () => {
  releaseClear();
});

promptBtn.addEventListener("click", rotatePrompt);
newNoteBtn.addEventListener("click", () => {
  resetEditor();
  render();
  noteInput.focus();
});

focusBtn.addEventListener("click", () => {
  document.body.classList.toggle("focus-mode");
  noteInput.focus();
});

notebookBtn.addEventListener("click", () => {
  document.body.classList.add("notebook-open");
});

closeNotebookBtn.addEventListener("click", () => {
  document.body.classList.remove("notebook-open");
  notebookBtn.textContent = "□";
});

exportBtn.addEventListener("click", exportNotes);
importBtn.addEventListener("click", () => {
  importFileInput.click();
});
importFileInput.addEventListener("change", () => {
  importNotesFromFile(importFileInput.files[0]);
  importFileInput.value = "";
});

searchInput.addEventListener("input", render);
appendCueBtn.addEventListener("click", appendCue);
refreshCueBtn.addEventListener("click", () => {
  cueVariant += 1;
  const cue = buildCue();
  if (cue) {
    showCue(cue);
  }
  noteInput.focus();
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectCategory(button.dataset.category);
    scheduleCue();
    noteInput.focus();
  });
});

releaseOptions.forEach((button) => {
  button.addEventListener("click", () => {
    selectReleaseMode(button.dataset.releaseMode);
  });
});

colorSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    brushColor = swatch.dataset.color;
    selectDoodleTool("brush");
  });
});

eraserBtn.addEventListener("click", () => {
  selectDoodleTool("eraser");
});

clearDoodleBtn.addEventListener("click", () => {
  clearDoodle();
});

doodleCanvas.addEventListener("pointerdown", startDoodle);
doodleCanvas.addEventListener("pointermove", drawDoodle);
doodleCanvas.addEventListener("pointerup", stopDoodle);
doodleCanvas.addEventListener("pointerleave", stopDoodle);
window.addEventListener("resize", () => {
  if (releaseMode === "doodle") {
    resizeDoodleCanvas();
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    activeFilter = tab.dataset.filter;
    if (activeFilter !== "all") {
      selectCategory(activeFilter);
    }
    render();
  });
});

notesList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) {
    if (editingNoteId === deleteButton.dataset.deleteId) {
      resetEditor();
    }
    notes = notes.filter((item) => item.id !== deleteButton.dataset.deleteId);
    persistNotes();
    render();
    return;
  }

  const button = event.target.closest("[data-note-id]");
  if (!button) return;

  const note = notes.find((item) => item.id === button.dataset.noteId);
  if (!note) return;

  editNote(note);
});

noteInput.value = localStorage.getItem(`${STORAGE_KEY}:draft`) ?? "";
selectReleaseMode("write");
updateMeta();
render();
noteInput.focus();
