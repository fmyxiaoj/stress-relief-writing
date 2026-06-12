const STORAGE_KEY = "night-writing:v1";
const ARCHIVE_KEY = "night-writing:entries:v1";
const KEYWORD_KEY_PREFIX = "night-writing:keywords:";
const KEYWORD_VERSION = "night-lexicon-20260612-continuity";
const COMPLETION_COUNT = 120;
const HISTORY_DAYS = 7;
const HISTORY_PREVIEW_LIMIT = 80;
const DAY_MS = 24 * 60 * 60 * 1000;

const DAILY_ACCENTS = [
  { start: [7, 9, 16], end: [20, 11, 9] },
  { start: [8, 10, 18], end: [19, 12, 10] },
  { start: [6, 11, 17], end: [18, 12, 12] },
  { start: [9, 8, 16], end: [21, 10, 8] },
  { start: [7, 10, 14], end: [18, 13, 9] }
];

const KEYWORD_POOLS = {
  openers: [
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
    "没关系",
    "先这样",
    "再等等",
    "好像",
    "其实",
    "只是",
    "终于",
    "偏偏",
    "后来呢",
    "一瞬间",
    "某一天",
    "不必",
    "可以",
    "还给",
    "让它",
    "留着",
    "经过",
    "停留",
    "空出来",
    "没说",
    "说不清",
    "写下来"
  ],
  body: [
    "肩膀",
    "眼睛",
    "喉咙",
    "手指",
    "掌心",
    "心口",
    "脚步",
    "背影",
    "额头",
    "发梢",
    "脉搏",
    "体温",
    "气息",
    "叹气",
    "坐着",
    "躺下",
    "伸手",
    "转身",
    "揉揉",
    "松开",
    "闭上",
    "醒来",
    "缓一缓",
    "软下来",
    "歇一会",
    "不撑着"
  ],
  rooms: [
    "窗外",
    "空气",
    "灯下",
    "影子",
    "月亮",
    "远处",
    "房间",
    "路灯",
    "桌面",
    "杯子",
    "抽屉",
    "门缝",
    "窗帘",
    "椅背",
    "枕头",
    "墙角",
    "书页",
    "纸巾",
    "水汽",
    "玻璃",
    "楼下",
    "走廊",
    "电梯",
    "屋檐",
    "街口",
    "便利店",
    "小路",
    "车窗",
    "站台",
    "夜灯"
  ],
  feelings: [
    "委屈",
    "疲惫",
    "想念",
    "发酸",
    "空落",
    "紧绷",
    "慌张",
    "笨拙",
    "含糊",
    "迟疑",
    "失落",
    "柔软",
    "平静",
    "轻了",
    "淡了",
    "暖一点",
    "不追问",
    "别急",
    "算啦",
    "还在",
    "慢一点",
    "小声点",
    "轻一点",
    "先放着",
    "不解释",
    "不比较"
  ],
  memory: [
    "小时候",
    "旧照片",
    "那时候",
    "去年",
    "夏天",
    "门口",
    "名字",
    "回声",
    "纸条",
    "旧歌",
    "校门",
    "雨伞",
    "公交",
    "操场",
    "旧毛衣",
    "晚饭",
    "饭香",
    "奶茶",
    "电影票",
    "短信",
    "路过",
    "相册",
    "旧梦",
    "那个人",
    "没说完",
    "记不清",
    "又想起",
    "藏起来",
    "留一会"
  ],
  dream: [
    "梦里",
    "梦前",
    "梦边",
    "海边",
    "山坡",
    "云层",
    "星星",
    "雾气",
    "船",
    "树影",
    "花影",
    "河水",
    "草地",
    "风声",
    "白色",
    "蓝色",
    "一点光",
    "小岛",
    "远方",
    "慢船",
    "睡前",
    "醒着",
    "漂着",
    "走散",
    "看见",
    "抱住"
  ],
  release: [
    "放下",
    "松手",
    "退后",
    "停住",
    "呼出来",
    "散开",
    "流走",
    "翻页",
    "落地",
    "归还",
    "不留",
    "不装",
    "不急",
    "不忍了",
    "别扛",
    "轻放",
    "散一散",
    "过一会",
    "让风吹",
    "给夜晚",
    "交给梦",
    "放口袋",
    "揉成团",
    "先睡吧",
    "慢慢走"
  ],
  quiet: [
    "沉默",
    "低声",
    "悄悄",
    "静下来",
    "没声音",
    "软风",
    "暗处",
    "微光",
    "小灯",
    "空房间",
    "一盏灯",
    "不响",
    "不闹",
    "不催",
    "很轻",
    "很慢",
    "静静地",
    "轻轻地",
    "没人问",
    "不用答"
  ],
  warm: [
    "热水",
    "热茶",
    "被子",
    "毛毯",
    "围巾",
    "灯火",
    "汤碗",
    "饭后",
    "手套",
    "暖光",
    "小太阳",
    "甜味",
    "软糖",
    "豆浆",
    "面包",
    "棉袜",
    "靠垫",
    "炉火",
    "怀里",
    "抱一下"
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
    "慢下来",
    "收灯",
    "回家",
    "晚餐",
    "暮色",
    "街灯",
    "黄昏",
    "天黑前",
    "洗澡后",
    "晾衣架"
  ],
  lateNight: [
    "深夜",
    "被窝",
    "枕边",
    "失眠",
    "暗蓝",
    "闭眼",
    "梦前",
    "床沿",
    "夜里",
    "别急",
    "困意",
    "低声",
    "十二点",
    "凌晨",
    "床头",
    "月光",
    "手机光",
    "静音",
    "夜色",
    "睡不着",
    "梦快来",
    "天快亮"
  ],
  morning: [
    "清晨",
    "晨光",
    "醒来",
    "窗亮",
    "白粥",
    "洗脸",
    "出门前",
    "第一口",
    "还早",
    "新空气"
  ],
  afternoon: [
    "午后",
    "阳台",
    "树荫",
    "困倦",
    "咖啡杯",
    "半天",
    "日光",
    "云慢",
    "小憩",
    "透气"
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
    "结束",
    "电脑",
    "耳机",
    "键盘",
    "午休",
    "通勤",
    "下班",
    "已读",
    "排队",
    "一封信"
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
    "小事",
    "沙发",
    "早午餐",
    "晒太阳",
    "慢走",
    "洗衣机",
    "花店",
    "菜市场",
    "楼顶",
    "无所事事"
  ],
  spring: ["发芽", "雨声", "潮湿", "花影", "新叶", "风软", "柳枝", "春困", "薄外套", "小雨"],
  summer: ["蝉声", "热气", "西瓜", "短袖", "晚霞", "冰水", "风扇", "凉席", "暴雨", "绿荫"],
  autumn: ["落叶", "桂花", "凉意", "长夜", "旧毛衣", "风干", "柿子", "薄雾", "秋千", "月饼"],
  winter: ["冷光", "围巾", "热水", "窗雾", "被子", "雪意", "白气", "手炉", "厚袜", "暖气"]
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
const historyToggle = document.querySelector("#historyToggle");
const historyPanel = document.querySelector("#historyPanel");
const historyList = document.querySelector("#historyList");
const historyClose = document.querySelector("#historyClose");

let keywords = [];
let dailyAccent = getDailyAccent();
let saveTimer;
let goodnightTimer;
let goodnightShownForCurrentCompletion = false;

function getEntryDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDateSeed(date = new Date()) {
  const dateKey = typeof date === "string" ? date : getEntryDate(date);
  let hash = 2166136261;
  for (let index = 0; index < dateKey.length; index += 1) {
    hash ^= dateKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(values, seed) {
  const result = [...values];
  const random = seededRandom(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function getDailyAccent(date = new Date()) {
  return DAILY_ACCENTS[getDateSeed(date) % DAILY_ACCENTS.length];
}

function applyDailyAccent(date = new Date()) {
  dailyAccent = getDailyAccent(date);
  writer.style.setProperty("--end-r", dailyAccent.end[0]);
  writer.style.setProperty("--end-g", dailyAccent.end[1]);
  writer.style.setProperty("--end-b", dailyAccent.end[2]);
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
  if (hour < 11) return "morning";
  return "afternoon";
}

function getDayBucket(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
}

function unique(values) {
  return [...new Set(values)];
}

function collectAllKeywords() {
  return unique(Object.values(KEYWORD_POOLS).flat());
}

function drawKeywords(pool, count, selected = [], seed = getDateSeed()) {
  const available = seededShuffle(pool, seed).filter((word) => !selected.includes(word));
  return available.slice(0, count);
}

function getKeywordCandidates(date = new Date()) {
  const seed = getDateSeed(date);
  const selected = [];
  selected.push(...drawKeywords(KEYWORD_POOLS.openers, 1, selected, seed + 11));
  selected.push(...drawKeywords(KEYWORD_POOLS.feelings, 1, selected, seed + 23));
  selected.push(...drawKeywords(KEYWORD_POOLS[getTimeBucket(date)], 1, selected, seed + 37));
  selected.push(...drawKeywords(KEYWORD_POOLS[getSeason(date)], 1, selected, seed + 41));

  const softPools = [
    ...KEYWORD_POOLS.body,
    ...KEYWORD_POOLS.rooms,
    ...KEYWORD_POOLS.memory,
    ...KEYWORD_POOLS.dream,
    ...KEYWORD_POOLS.release,
    ...KEYWORD_POOLS.quiet,
    ...KEYWORD_POOLS.warm,
    ...KEYWORD_POOLS[getDayBucket(date)]
  ];
  selected.push(...drawKeywords(softPools, KEYWORD_POSITIONS.length - selected.length, selected, seed + 53));

  if (selected.length < KEYWORD_POSITIONS.length) {
    selected.push(...drawKeywords(collectAllKeywords(), KEYWORD_POSITIONS.length - selected.length, selected, seed + 97));
  }

  return selected.slice(0, KEYWORD_POSITIONS.length);
}

function loadKeywords() {
  const key = `${KEYWORD_KEY_PREFIX}${getEntryDate()}`;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (
      saved?.version === KEYWORD_VERSION &&
      Array.isArray(saved.words) &&
      saved.words.length === KEYWORD_POSITIONS.length
    ) {
      return saved.words;
    }
  } catch {
    localStorage.removeItem(key);
  }

  const selected = getKeywordCandidates();
  localStorage.setItem(key, JSON.stringify({ version: KEYWORD_VERSION, words: selected }));
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
  writer.style.setProperty("--bg-r", Math.round(lerp(dailyAccent.start[0], dailyAccent.end[0], glow)));
  writer.style.setProperty("--bg-g", Math.round(lerp(dailyAccent.start[1], dailyAccent.end[1], glow)));
  writer.style.setProperty("--bg-b", Math.round(lerp(dailyAccent.start[2], dailyAccent.end[2], glow)));
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

function parseEntryDate(dateString) {
  const parts = String(dateString).split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function getLocalDateStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getHistoryEntries(date = new Date()) {
  const today = getLocalDateStart(date);
  const byDate = new Map();

  loadArchive().forEach((entry) => {
    const entryDate = parseEntryDate(entry?.date);
    const text = typeof entry?.text === "string" ? entry.text.trim() : "";
    if (!entryDate || !text || byDate.has(entry.date)) {
      return;
    }

    const dayDistance = Math.round((today - entryDate) / DAY_MS);
    if (dayDistance >= 0 && dayDistance < HISTORY_DAYS) {
      byDate.set(entry.date, { ...entry, text });
    }
  });

  return [...byDate.values()].sort((left, right) => right.date.localeCompare(left.date)).slice(0, HISTORY_DAYS);
}

function formatHistoryDate(dateString) {
  const todayKey = getEntryDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === todayKey) return "今天";
  if (dateString === getEntryDate(yesterday)) return "昨天";

  const date = parseEntryDate(dateString);
  if (!date) return dateString;
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}

function getHistoryPreview(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= HISTORY_PREVIEW_LIMIT) {
    return normalized;
  }
  return `${normalized.slice(0, HISTORY_PREVIEW_LIMIT)}…`;
}

function createHistoryItem(entry) {
  const item = document.createElement("article");
  item.className = "nw-history-item";

  const date = document.createElement("div");
  date.className = "nw-history-date";
  date.textContent = formatHistoryDate(entry.date);

  const text = document.createElement("div");
  text.className = "nw-history-text";
  text.textContent = getHistoryPreview(entry.text);

  item.append(date, text);

  return item;
}

function renderHistory() {
  historyList.innerHTML = "";
  const entries = getHistoryEntries();

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "nw-history-empty";
    empty.textContent = "还没有留下前几天的文字";
    historyList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    historyList.appendChild(createHistoryItem(entry));
  });
}

function isHistoryOpen() {
  return historyPanel.classList.contains("open");
}

function setHistoryOpen(open) {
  writer.classList.toggle("history-open", open);
  historyPanel.classList.toggle("open", open);
  historyPanel.setAttribute("aria-hidden", String(!open));
  historyToggle.setAttribute("aria-expanded", String(open));

  if (open) {
    renderHistory();
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

  if (isHistoryOpen()) {
    renderHistory();
  }
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
  if (isHistoryOpen()) {
    setHistoryOpen(false);
  }
  input.focus({ preventScroll: true });
}

applyDailyAccent();
keywords = loadKeywords();
renderKeywords();
input.value = loadEntry();
setVisualState(input.value);
persistEntry(input.value);
focusWriting();

input.addEventListener("input", handleInput);
writer.addEventListener("click", focusWriting);
historyToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  setHistoryOpen(!isHistoryOpen());
});
historyClose.addEventListener("click", (event) => {
  event.stopPropagation();
  setHistoryOpen(false);
  focusWriting();
});
historyPanel.addEventListener("click", (event) => {
  event.stopPropagation();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && isHistoryOpen()) {
    setHistoryOpen(false);
    focusWriting();
  }
});
