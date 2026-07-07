const STORAGE_KEY = "night-writing:v1";
const ARCHIVE_KEY = "night-writing:entries:v1";
const KEYWORD_KEY_PREFIX = "night-writing:keywords:";
const HISTORY_HINT_KEY = "night-writing:history-hint-seen:v1";
const KEYWORD_VERSION = "night-lexicon-20260612-continuity";
const COMPLETION_COUNT = 120;
const HISTORY_DAYS = 7;
const HISTORY_PREVIEW_LIMIT = 80;
const DAY_MS = 24 * 60 * 60 * 1000;
const HISTORY_HINT_MS = 3600;
const SAVE_STATUS_MS = 1400;
const CLEAR_CONFIRM_MS = 2800;
const ARCHIVE_LIMIT = 60;

const DAILY_ACCENTS = [
  { start: [7, 9, 16], end: [20, 11, 9] },
  { start: [8, 10, 18], end: [19, 12, 10] },
  { start: [6, 11, 17], end: [18, 12, 12] },
  { start: [9, 8, 16], end: [21, 10, 8] },
  { start: [7, 10, 14], end: [18, 13, 9] }
];

const KEYWORD_POOLS = {
  openers: ["安静", "今天", "有点", "忽然", "窗外", "后来", "慢慢", "停下", "没事", "想起", "也许", "今晚", "轻轻", "一会儿", "梦里", "空气", "灯下", "影子", "手心", "呼吸", "温柔", "空白", "一点", "刚才", "不用", "算了", "还好", "记得", "放下", "回声", "醒着", "睡意", "纸上", "旧事", "名字", "没关系", "先这样", "再等等", "好像", "其实", "只是", "终于", "偏偏", "后来呢", "一瞬间", "某一天", "不必", "可以", "还给", "让它", "留着", "经过", "停留", "空出来", "没说", "说不清", "写下来"],
  body: ["肩膀", "眼睛", "喉咙", "手指", "掌心", "心口", "脚步", "背影", "额头", "发梢", "脉搏", "体温", "气息", "叹气", "坐着", "躺下", "伸手", "转身", "揉揉", "松开", "闭上", "醒来", "缓一缓", "软下来", "歇一会", "不撑着"],
  rooms: ["窗外", "空气", "灯下", "影子", "月亮", "远处", "房间", "路灯", "桌面", "杯子", "抽屉", "门缝", "窗帘", "椅背", "枕头", "墙角", "书页", "纸巾", "水汽", "玻璃", "楼下", "走廊", "电梯", "屋檐", "街口", "便利店", "小路", "车窗", "站台", "夜灯"],
  feelings: ["委屈", "疲惫", "想念", "发酸", "空落", "紧绷", "慌张", "笨拙", "含糊", "迟疑", "失落", "柔软", "平静", "轻了", "淡了", "暖一点", "不追问", "别急", "算啦", "还在", "慢一点", "小声点", "轻一点", "先放着", "不解释", "不比较"],
  memory: ["小时候", "旧照片", "那时候", "去年", "夏天", "门口", "名字", "回声", "纸条", "旧歌", "校门", "雨伞", "公交", "操场", "旧毛衣", "晚饭", "饭香", "奶茶", "电影票", "短信", "路过", "相册", "旧梦", "那个人", "没说完", "记不清", "又想起", "藏起来", "留一会"],
  dream: ["梦里", "梦前", "梦边", "海边", "山坡", "云层", "星星", "雾气", "船", "树影", "花影", "河水", "草地", "风声", "白色", "蓝色", "一点光", "小岛", "远方", "慢船", "睡前", "醒着", "漂着", "走散", "看见", "抱住"],
  release: ["放下", "松手", "退后", "停住", "呼出来", "散开", "流走", "翻页", "落地", "归还", "不留", "不装", "不急", "不忍了", "别扛", "轻放", "散一散", "过一会", "让风吹", "给夜晚", "交给梦", "放口袋", "揉成团", "先睡吧", "慢慢走"],
  quiet: ["沉默", "低声", "悄悄", "静下来", "没声音", "软风", "暗处", "微光", "小灯", "空房间", "一盏灯", "不响", "不闹", "不催", "很轻", "很慢", "静静地", "轻轻地", "没人问", "不用答"],
  warm: ["热水", "热茶", "被子", "毛毯", "围巾", "灯火", "汤碗", "饭后", "手套", "暖光", "小太阳", "甜味", "软糖", "豆浆", "面包", "棉袜", "靠垫", "炉火", "怀里", "抱一下"],
  evening: ["傍晚", "晚风", "饭后", "归来", "天色", "路上", "余温", "门口", "人声", "慢下来", "收灯", "回家", "晚餐", "暮色", "街灯", "黄昏", "天黑前", "洗澡后", "晾衣架"],
  lateNight: ["深夜", "被窝", "枕边", "失眠", "暗蓝", "闭眼", "梦前", "床沿", "夜里", "别急", "困意", "低声", "十二点", "凌晨", "床头", "月光", "手机光", "静音", "夜色", "睡不着", "梦快来", "天快亮"],
  morning: ["清晨", "晨光", "醒来", "窗亮", "白粥", "洗脸", "出门前", "第一口", "还早", "新空气"],
  afternoon: ["午后", "阳台", "树荫", "困倦", "咖啡杯", "半天", "日光", "云慢", "小憩", "透气"],
  weekday: ["工作", "消息", "明天", "地铁", "屏幕", "会议", "疲惫", "没说完", "还在", "结束", "电脑", "耳机", "键盘", "午休", "通勤", "下班", "已读", "排队", "一封信"],
  weekend: ["周末", "散步", "午后", "厨房", "电影", "躺着", "闲着", "风", "云", "小事", "沙发", "早午餐", "晒太阳", "慢走", "洗衣机", "花店", "菜市场", "楼顶", "无所事事"],
  spring: ["发芽", "雨声", "潮湿", "花影", "新叶", "风软", "柳枝", "春困", "薄外套", "小雨"],
  summer: ["蝉声", "热气", "西瓜", "短袖", "晚霞", "冰水", "风扇", "凉席", "暴雨", "绿荫"],
  autumn: ["落叶", "桂花", "凉意", "长夜", "旧毛衣", "风干", "柿子", "薄雾", "秋千", "月饼"],
  winter: ["冷光", "围巾", "热水", "窗雾", "被子", "雪意", "白气", "手炉", "厚袜", "暖气"]
};

const KEYWORD_POSITIONS = [
  { top: "25%", left: "60rpx" },
  { top: "23%", right: "18%" },
  { top: "42%", right: "10%" },
  { top: "64%", left: "60rpx" },
  { bottom: "17%", right: "10%" }
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function getEntryDate(date = new Date()) {
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

function positionToStyle(position) {
  return Object.entries(position)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
}

function getCharacterCount(text) {
  return String(text).replace(/\s/g, "").length;
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

function createEntry(text, date = new Date(), keywords = []) {
  return {
    date: getEntryDate(date),
    text,
    charCount: getCharacterCount(text),
    keywords,
    updatedAt: date.toISOString()
  };
}

function mergeArchive(entry, archive = [], previousEntryDate = null) {
  const replacedDates = new Set([entry.date]);
  if (previousEntryDate) {
    replacedDates.add(previousEntryDate);
  }
  const next = archive.filter((item) => item && !replacedDates.has(item.date));
  if (entry.text.trim()) {
    next.unshift(entry);
  }
  return next.slice(0, ARCHIVE_LIMIT);
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

function getHistoryEntries(archive = [], date = new Date()) {
  const today = getLocalDateStart(date);
  const byDate = new Map();

  archive.forEach((entry) => {
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

function getExportEntries(archive = []) {
  const byDate = new Map();

  archive.forEach((entry) => {
    const text = typeof entry?.text === "string" ? entry.text.trim() : "";
    if (!parseEntryDate(entry?.date) || !text || byDate.has(entry.date)) {
      return;
    }
    byDate.set(entry.date, { ...entry, text });
  });

  return [...byDate.values()].sort((left, right) => right.date.localeCompare(left.date));
}

function formatExportDate(dateString) {
  const date = parseEntryDate(dateString);
  return date ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日` : dateString;
}

function formatExportText(archive = []) {
  const entries = getExportEntries(archive);
  const body = entries.map((entry) => `${formatExportDate(entry.date)}\n${entry.text}`).join("\n\n--------------------\n\n");
  return `\uFEFF${body}${body ? "\n" : ""}`;
}

function getExportFilename(date = new Date()) {
  return `今晚写点啥-${getEntryDate(date)}.txt`;
}

function insertTextAtCursor(text, keyword, cursor = String(text).length) {
  const source = String(text);
  const numericCursor = Number(cursor);
  const point = clamp(Number.isFinite(numericCursor) ? numericCursor : source.length, 0, source.length);
  const nextText = `${source.slice(0, point)}${keyword}${source.slice(point)}`;
  return {
    text: nextText,
    cursor: point + String(keyword).length
  };
}

function copyExportContent(content, api = wx) {
  if (typeof api.setClipboardData !== "function") {
    api.showToast({ title: "导出失败", icon: "none" });
    return false;
  }

  api.setClipboardData({
    data: String(content).replace(/^\uFEFF/, ""),
    success() {
      api.showModal({
        title: "已复制全部内容",
        content: "当前微信未能打开文件分享，可粘贴到文件传输助手保存。",
        showCancel: false
      });
    },
    fail() {
      api.showToast({ title: "导出失败", icon: "none" });
    }
  });
  return true;
}

function shareExportFile(filePath, fileName, content, api = wx) {
  if (typeof api.shareFileMessage !== "function") {
    return copyExportContent(content, api);
  }

  api.shareFileMessage({
    filePath,
    fileName,
    fail(error) {
      if (!String(error?.errMsg || "").includes("cancel")) {
        copyExportContent(content, api);
      }
    }
  });
  return true;
}

function formatHistoryDate(dateString, now = new Date()) {
  const todayKey = getEntryDate(now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === todayKey) return "今天";
  if (dateString === getEntryDate(yesterday)) return "昨天";

  const date = parseEntryDate(dateString);
  if (!date) return dateString;
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}

function getPreview(text, limit = HISTORY_PREVIEW_LIMIT) {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit)}…` : normalized;
}

function toHistoryView(entries, now = new Date()) {
  return entries.map((entry) => ({
    ...entry,
    label: formatHistoryDate(entry.date, now),
    preview: getPreview(entry.text)
  }));
}

function toKeywordItems(keywords, text, visible = false, previousActiveWords = []) {
  const previousActive = previousActiveWords instanceof Set ? previousActiveWords : new Set(previousActiveWords);

  return keywords.map((word, index) => ({
    word,
    visible,
    active: text.includes(word),
    releasing: visible && previousActive.has(word) && !text.includes(word),
    styleText: positionToStyle(KEYWORD_POSITIONS[index])
  }));
}

function getActiveKeywordWords(keywordItems = []) {
  return new Set(
    keywordItems
      .filter((item) => item?.active)
      .map((item) => item.word)
  );
}

function getVisualState(text, date = new Date()) {
  const dailyAccent = getDailyAccent(date);
  const hasWriting = text.trim().length > 0;
  const glow = getGlow(text);
  const completeRatio = clamp((glow - 0.88) / 0.12, 0, 1);
  const lampRatio = hasWriting ? 1 : 0;
  const quietRatio = clamp((glow - 0.18) / 0.82, 0, 1);
  const backgroundRatio = lerp(0, 0.38, lampRatio);
  return {
    bgR: Math.round(lerp(dailyAccent.start[0], dailyAccent.end[0], backgroundRatio)),
    bgG: Math.round(lerp(dailyAccent.start[1], dailyAccent.end[1], backgroundRatio)),
    bgB: Math.round(lerp(dailyAccent.start[2], dailyAccent.end[2], backgroundRatio)),
    endR: dailyAccent.end[0],
    endG: dailyAccent.end[1],
    endB: dailyAccent.end[2],
    glowAlpha: lerp(0, 0.13, lampRatio).toFixed(3),
    lampPresence: lampRatio.toFixed(3),
    writingLight: lerp(0.06, 0.132, lampRatio).toFixed(3),
    lineLight: lerp(0.05, 0.112, lampRatio).toFixed(3),
    textGlow: lerp(0, 0.5, lampRatio).toFixed(3),
    roomQuiet: quietRatio.toFixed(3),
    vignetteAlpha: Math.max(completeRatio, quietRatio * 0.3).toFixed(3),
    glow
  };
}

function toWriterStyle(visual) {
  return [
    `--bg-r: ${visual.bgR};`,
    `--bg-g: ${visual.bgG};`,
    `--bg-b: ${visual.bgB};`,
    `--end-r: ${visual.endR};`,
    `--end-g: ${visual.endG};`,
    `--end-b: ${visual.endB};`,
    `--glow-alpha: ${visual.glowAlpha};`,
    `--lamp-presence: ${visual.lampPresence};`,
    `--writing-light: ${visual.writingLight};`,
    `--line-light: ${visual.lineLight};`,
    `--text-glow: ${visual.textGlow};`,
    `--room-quiet: ${visual.roomQuiet};`,
    `--vignette-alpha: ${visual.vignetteAlpha};`
  ].join(" ");
}

function buildState(
  text,
  archive = [],
  now = new Date(),
  keywords = getKeywordCandidates(now),
  keywordsVisible = false,
  previousActiveWords = []
) {
  const entry = createEntry(text, now, keywords);
  const historyEntries = getHistoryEntries(archive, now);
  const visual = getVisualState(text, now);

  return {
    entry,
    visual,
    writerStyle: toWriterStyle(visual),
    keywordItems: toKeywordItems(keywords, text, keywordsVisible, previousActiveWords),
    history: toHistoryView(historyEntries, now),
    historyEmpty: historyEntries.length === 0,
    hasText: text.trim().length > 0,
    goodnightVisible: visual.glow >= 0.88
  };
}

function readStorage(key, fallback) {
  try {
    const value = wx.getStorageSync(key);
    return value || fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
  } catch {}
}

function loadKeywords(now = new Date()) {
  const key = `${KEYWORD_KEY_PREFIX}${getEntryDate(now)}`;
  const saved = readStorage(key, null);
  if (
    saved?.version === KEYWORD_VERSION &&
    Array.isArray(saved.words) &&
    saved.words.length === KEYWORD_POSITIONS.length
  ) {
    return saved.words;
  }

  const words = getKeywordCandidates(now);
  writeStorage(key, { version: KEYWORD_VERSION, words });
  return words;
}

if (typeof Page === "function") {
  Page({
    data: {
      text: "",
      keywordItems: [],
      history: [],
      historyEmpty: true,
      historyOpen: false,
      detailOpen: false,
      detailEntry: null,
      historyHintVisible: false,
      keywordsVisible: false,
      saveStatus: "内容只保存在本机",
      saveStatusVisible: false,
      clearConfirmOpen: false,
      hasText: false,
      goodnightVisible: false,
      inputFocused: false,
      cursor: 0,
      writerStyle: toWriterStyle(getVisualState(""))
    },

    onLoad() {
      const now = new Date();
      this.keywords = loadKeywords(now);
      this.archive = Array.isArray(readStorage(ARCHIVE_KEY, [])) ? readStorage(ARCHIVE_KEY, []) : [];
      const saved = readStorage(STORAGE_KEY, null);
      const text = saved?.date === getEntryDate(now) && typeof saved.text === "string" ? saved.text : "";
      this.activeEntryDate = text ? saved.date : null;
      this.refreshState(text, { announce: false, now });
      this.keywordRevealTimer = setTimeout(() => this.showKeywords(), 520);
      this.showHistoryHint();
    },

    onUnload() {
      clearTimeout(this.saveTimer);
      clearTimeout(this.saveStatusTimer);
      clearTimeout(this.historyHintTimer);
      clearTimeout(this.clearConfirmTimer);
      clearTimeout(this.keywordRevealTimer);
      clearTimeout(this.keywordReleaseTimer);
    },

    onInput(event) {
      this.resetClearConfirmation();
      const cursor = Number.isFinite(event.detail.cursor) ? event.detail.cursor : event.detail.value.length;
      if (!this.data.inputFocused) {
        this.setData({ inputFocused: true });
      }
      this.setData({ cursor });
      this.refreshState(event.detail.value, { status: "正在保存", saveNow: false });
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        this.persistText(this.data.text, { announce: true });
      }, 220);
    },

    insertKeyword(event) {
      const keyword = event.currentTarget.dataset.keyword;
      const next = insertTextAtCursor(this.data.text, keyword, this.data.cursor);
      this.onInput({ detail: { value: next.text, cursor: next.cursor } });
    },

    onSelectionChange(event) {
      const cursor = Number.isFinite(event.detail.selectionEnd) ? event.detail.selectionEnd : this.data.cursor;
      this.setData({ cursor });
    },

    toggleHistory() {
      if (this.data.historyOpen) {
        this.closeHistory();
        return;
      }
      this.openHistory();
    },

    openHistory() {
      this.hideHistoryHint();
      this.setData({
        historyOpen: true,
        detailOpen: false,
        detailEntry: null,
        inputFocused: false
      });
      this.refreshHistory();
    },

    closeHistory() {
      this.setData({
        historyOpen: false,
        detailOpen: false,
        detailEntry: null,
        inputFocused: true,
        cursor: this.data.text.length
      });
    },

    focusWriting() {
      if (this.data.historyOpen) {
        this.closeHistory();
        return;
      }
      if (!this.data.inputFocused) {
        this.setData({ inputFocused: true });
      }
    },

    noop() {},

    showKeywords() {
      if (this.data.keywordsVisible) {
        return;
      }
      this.setData({
        keywordsVisible: true,
        keywordItems: toKeywordItems(this.keywords || [], this.data.text, true)
      });
    },

    clearKeywordRelease() {
      const keywordItems = this.data.keywordItems || [];
      if (!keywordItems.some((item) => item.releasing)) {
        return;
      }

      this.setData({
        keywordItems: keywordItems.map((item) => ({ ...item, releasing: false }))
      });
    },

    openDetail(event) {
      const date = event.currentTarget.dataset.date;
      const detailEntry = this.data.history.find((entry) => entry.date === date) || null;
      this.setData({
        detailOpen: Boolean(detailEntry),
        detailEntry
      });
    },

    backToHistory() {
      this.setData({
        detailOpen: false,
        detailEntry: null
      });
    },

    exportAll() {
      this.persistText(this.data.text, { announce: false });
      const entries = getExportEntries(this.archive || []);
      if (entries.length === 0) {
        wx.showToast({ title: "暂无可导出记录", icon: "none" });
        return;
      }

      const exportedAt = new Date();
      const fileName = getExportFilename(exportedAt);
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      const content = formatExportText(entries);
      wx.getFileSystemManager().writeFile({
        filePath,
        data: content,
        encoding: "utf8",
        success: () => shareExportFile(filePath, fileName, content),
        fail: () => wx.showToast({ title: "导出失败，请重试", icon: "none" })
      });
    },

    requestClearTonight() {
      if (!this.data.hasText) {
        return;
      }

      this.setClearConfirmOpen(true);
    },

    setClearConfirmOpen(open) {
      clearTimeout(this.clearConfirmTimer);
      const update = { clearConfirmOpen: open };

      if (open && this.data.historyOpen) {
        update.historyOpen = false;
        update.detailOpen = false;
        update.detailEntry = null;
      }

      if (this.data.clearConfirmOpen !== open || update.historyOpen === false) {
        this.setData(update);
      }

      if (open) {
        this.clearConfirmTimer = setTimeout(() => this.resetClearConfirmation(), CLEAR_CONFIRM_MS);
      }
    },

    cancelClearTonight() {
      this.setClearConfirmOpen(false);
      this.focusWriting();
    },

    confirmClearTonight() {
      this.clearTonightEntry();
    },

    clearTonightEntry() {
      clearTimeout(this.saveTimer);
      this.resetClearConfirmation();
      this.persistText("", { announce: false });
      this.setData({ cursor: 0 });
      this.setSaveStatus("已清空", true);
    },

    resetClearConfirmation() {
      clearTimeout(this.clearConfirmTimer);
      if (this.data.clearConfirmOpen) {
        this.setData({ clearConfirmOpen: false });
      }
    },

    showHistoryHint() {
      if (readStorage(HISTORY_HINT_KEY, "")) {
        return;
      }
      writeStorage(HISTORY_HINT_KEY, "1");
      this.setData({ historyHintVisible: true });
      clearTimeout(this.historyHintTimer);
      this.historyHintTimer = setTimeout(() => this.hideHistoryHint(), HISTORY_HINT_MS);
    },

    hideHistoryHint() {
      clearTimeout(this.historyHintTimer);
      if (this.data.historyHintVisible) {
        this.setData({ historyHintVisible: false });
      }
    },

    setSaveStatus(message, visible = false, sticky = false) {
      clearTimeout(this.saveStatusTimer);
      this.setData({
        saveStatus: message,
        saveStatusVisible: visible
      });
      if (visible && !sticky && (message === "已保存" || message === "已清空")) {
        this.saveStatusTimer = setTimeout(() => {
          this.setData({ saveStatusVisible: false });
        }, SAVE_STATUS_MS);
      }
    },

    persistText(text, { announce = true, now = new Date() } = {}) {
      const entry = createEntry(text, now, this.keywords || []);
      const previousEntryDate = this.activeEntryDate;
      const nextArchive = mergeArchive(entry, this.archive || [], previousEntryDate);
      const savedEntry = writeStorage(STORAGE_KEY, entry);
      const savedArchive = writeStorage(ARCHIVE_KEY, nextArchive);
      this.archive = nextArchive;
      this.activeEntryDate = entry.text.trim() ? entry.date : null;

      this.refreshState(text, { announce: false, now, saveNow: false });
      this.refreshHistory(now);

      if (!savedEntry || !savedArchive) {
        this.setSaveStatus("本机保存不可用", true, true);
        return;
      }

      if (announce) {
        this.setSaveStatus("已保存", true);
      }
    },

    refreshHistory(now = new Date()) {
      const historyEntries = getHistoryEntries(this.archive || [], now);
      this.setData({
        history: toHistoryView(historyEntries, now),
        historyEmpty: historyEntries.length === 0
      });
    },

    refreshState(text, options = {}) {
      const now = options.now || new Date();
      const previousActiveWords = getActiveKeywordWords(this.data.keywordItems || []);
      const state = buildState(
        text,
        this.archive || [],
        now,
        this.keywords || getKeywordCandidates(now),
        this.data.keywordsVisible,
        previousActiveWords
      );
      const hasReleasingKeyword = state.keywordItems.some((item) => item.releasing);

      clearTimeout(this.keywordReleaseTimer);

      if (options.saveNow !== false) {
        const savedEntry = writeStorage(STORAGE_KEY, state.entry);
        const previousEntryDate = this.activeEntryDate;
        this.archive = mergeArchive(state.entry, this.archive || [], previousEntryDate);
        const savedArchive = writeStorage(ARCHIVE_KEY, this.archive);
        this.activeEntryDate = state.entry.text.trim() ? state.entry.date : null;
        if (!savedEntry || !savedArchive) {
          this.setSaveStatus("本机保存不可用", true, true);
        }
      }

      this.setData({
        text,
        keywordItems: state.keywordItems,
        writerStyle: state.writerStyle,
        history: state.history,
        historyEmpty: state.historyEmpty,
        saveStatus: options.status || this.data.saveStatus,
        saveStatusVisible: Boolean(options.status) || this.data.saveStatusVisible,
        clearConfirmOpen: false,
        hasText: state.hasText,
        goodnightVisible: state.goodnightVisible
      });

      if (hasReleasingKeyword) {
        this.keywordReleaseTimer = setTimeout(() => this.clearKeywordRelease(), 760);
      }
    },

    resetLocalDataForTesting() {
      removeStorage(STORAGE_KEY);
      removeStorage(ARCHIVE_KEY);
      removeStorage(HISTORY_HINT_KEY);
    }
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    __test__: {
      createEntry,
      mergeArchive,
      getHistoryEntries,
      getExportEntries,
      formatExportText,
      getExportFilename,
      copyExportContent,
      shareExportFile,
      formatHistoryDate,
      getPreview,
      getKeywordCandidates,
      getVisualState,
      toKeywordItems,
      getActiveKeywordWords,
      buildState,
      insertTextAtCursor
    }
  };
}
