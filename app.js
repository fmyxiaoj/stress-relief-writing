const STORAGE_KEY = "night-writing:v1";
const ARCHIVE_KEY = "night-writing:entries:v1";
const KEYWORD_KEY_PREFIX = "night-writing:keywords:";
const COMPLETION_COUNT = 120;

const KEYWORD_POOLS = {
  base: [
    "安静",
    "今天",
    "有点",
    "忽然",
    "窗外",
    "后来",
    "慢慢",
    "停下",
    "没事",
    "想起",
    "也许",
    "今晚",
    "轻轻",
    "一会儿",
    "梦里",
    "空气",
    "灯下",
    "影子",
    "手心",
    "呼吸",
    "月亮",
    "远处",
    "房间",
    "沉默",
    "温柔",
    "空白",
    "一点",
    "刚才",
    "不用",
    "算了",
    "还好",
    "记得",
    "放下",
    "回声",
    "醒着",
    "睡意",
    "纸上",
    "旧事",
    "名字",
    "路灯"
  ],
  evening: [
    "傍晚",
    "晚风",
    "饭后",
    "归来",
    "天色",
    "路上",
    "余温",
    "门口",
    "人声",
    "慢下来"
  ],
  lateNight: [
    "深夜",
    "被窝",
    "枕边",
    "失眠",
    "黑暗",
    "闭眼",
    "梦前",
    "床沿",
    "夜里",
    "别急",
    "困意",
    "低声"
  ],
  weekday: [
    "工作",
    "消息",
    "明天",
    "地铁",
    "屏幕",
    "会议",
    "疲惫",
    "没说完",
    "还在",
    "结束"
  ],
  weekend: [
    "周末",
    "散步",
    "午后",
    "厨房",
    "电影",
    "躺着",
    "闲着",
    "风",
    "云",
    "小事"
  ],
  spring: ["发芽", "雨声", "潮湿", "花影", "新叶", "风软"],
  summer: ["蝉声", "热气", "西瓜", "短袖", "晚霞", "冰水"],
  autumn: ["落叶", "桂花", "凉意", "长夜", "旧毛衣", "风干"],
  winter: ["冷光", "围巾", "热水", "窗雾", "被子", "雪意"]
};

const KEYWORD_POSITIONS = [
  { top: "10%", left: "6%" },
  { top: "7%", left: "54%" },
  { top: "22%", right: "6%" },
  { top: "61%", left: "5%" },
  { bottom: "20%", right: "5%" }
];

const writer = document.querySelector("#nightWriter");
const input = document.querySelector("#writingInput");
const keywordLayer = document.querySelector("#keywordLayer");
const goodnightSignal = document.querySelector("#goodnightSignal");
const saveStatus = document.querySelector("#saveStatus");

let keywords = [];
let saveTimer;
let goodnightTimer;
let goodnightShownForCurrentCompletion = false;

function getEntryDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function getTimeBucket(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 22 || hour < 5) return "lateNight";
  if (hour >= 17) return "evening";
  return "base";
}

function getDayBucket(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
}

function unique(values) {
  return [...new Set(values)];
}

function getKeywordCandidates(date = new Date()) {
  return unique([
    ...KEYWORD_POOLS.base,
    ...KEYWORD_POOLS[getTimeBucket(date)],
    ...KEYWORD_POOLS[getDayBucket(date)],
    ...KEYWORD_POOLS[getSeason(date)]
  ]);
}

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function loadKeywords() {
  const key = `${KEYWORD_KEY_PREFIX}${getEntryDate()}`;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved) && saved.length === KEYWORD_POSITIONS.length) {
      return saved;
    }
  } catch {
    localStorage.removeItem(key);
  }

  const selected = shuffle(getKeywordCandidates()).slice(0, KEYWORD_POSITIONS.length);
  localStorage.setItem(key, JSON.stringify(selected));
  return selected;
}

function getCharacterCount(text) {
  return text.replace(/\s/g, "").length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, ratio) {
  return start + (end - start) * ratio;
}

function getGlow(text) {
  return clamp(getCharacterCount(text) / COMPLETION_COUNT, 0, 1);
}

function setVisualState(text) {
  const glow = getGlow(text);
  const completeRatio = clamp((glow - 0.88) / 0.12, 0, 1);
  writer.style.setProperty("--bg-r", Math.round(lerp(7, 20, glow)));
  writer.style.setProperty("--bg-g", Math.round(lerp(9, 11, glow)));
  writer.style.setProperty("--bg-b", Math.round(lerp(16, 9, glow)));
  writer.style.setProperty("--glow-alpha", lerp(0, 0.18, glow).toFixed(3));
  writer.style.setProperty("--text-glow", glow.toFixed(3));
  writer.style.setProperty("--vignette-alpha", completeRatio.toFixed(3));

  updateKeywordState(text);

  if (glow >= 0.88 && !goodnightShownForCurrentCompletion) {
    showGoodnight();
    goodnightShownForCurrentCompletion = true;
  }

  if (glow < 0.82) {
    goodnightShownForCurrentCompletion = false;
  }
}

function createKeywordButton(keyword, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "nw-keyword";
  button.textContent = keyword;
  button.dataset.keyword = keyword;
  button.setAttribute("aria-label", `插入关键词：${keyword}`);
  Object.assign(button.style, KEYWORD_POSITIONS[index]);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    insertKeyword(keyword);
  });
  return button;
}

function renderKeywords() {
  keywordLayer.innerHTML = "";
  keywords.forEach((keyword, index) => {
    keywordLayer.appendChild(createKeywordButton(keyword, index));
  });

  window.setTimeout(() => {
    document.querySelectorAll(".nw-keyword").forEach((button) => button.classList.add("visible"));
  }, 420);
}

function updateKeywordState(text) {
  document.querySelectorAll(".nw-keyword").forEach((button) => {
    button.classList.toggle("active", text.includes(button.dataset.keyword));
  });
}

function insertKeyword(keyword) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const nextText = `${input.value.slice(0, start)}${keyword}${input.value.slice(end)}`;
  input.value = nextText;
  const cursor = start + keyword.length;
  input.focus();
  input.setSelectionRange(cursor, cursor);
  handleInput();
}

function loadEntry() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.date === getEntryDate() && typeof saved.text === "string") {
      return saved.text;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return "";
}

function loadArchive() {
  try {
    const archive = JSON.parse(localStorage.getItem(ARCHIVE_KEY));
    return Array.isArray(archive) ? archive : [];
  } catch {
    return [];
  }
}

function persistEntry(text) {
  const now = new Date();
  const entry = {
    date: getEntryDate(now),
    text,
    charCount: getCharacterCount(text),
    keywords,
    updatedAt: now.toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));

  const archive = loadArchive().filter((item) => item.date !== entry.date);
  if (text.trim()) {
    archive.unshift(entry);
  }
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive.slice(0, 60)));
  saveStatus.textContent = "已在本机保存";
}

function scheduleSave() {
  window.clearTimeout(saveTimer);
  saveStatus.textContent = "正在本机保存";
  saveTimer = window.setTimeout(() => persistEntry(input.value), 220);
}

function showGoodnight() {
  window.clearTimeout(goodnightTimer);
  goodnightSignal.classList.remove("visible");
  void goodnightSignal.offsetWidth;
  goodnightSignal.classList.add("visible");
  goodnightTimer = window.setTimeout(() => {
    goodnightSignal.classList.remove("visible");
  }, 5400);
}

function handleInput() {
  setVisualState(input.value);
  scheduleSave();
}

function focusWriting() {
  input.focus({ preventScroll: true });
}

keywords = loadKeywords();
renderKeywords();
input.value = loadEntry();
setVisualState(input.value);
persistEntry(input.value);
focusWriting();

input.addEventListener("input", handleInput);
writer.addEventListener("click", focusWriting);
