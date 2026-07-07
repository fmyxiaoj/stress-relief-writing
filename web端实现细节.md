# 《今晚写点啥》Web 端实现细节

本文档记录当前 Web 端的真实实现，来源于根目录的 `index.html`、`styles.css`、`app.js`。它不是下一版规划，而是现有版本的实现说明，方便后续和小程序端做一致性校对。

## 1. 文件入口

Web 端由三个核心文件组成：

- `index.html`：页面结构和可访问性属性。
- `styles.css`：所有视觉、字体、布局、动效、移动端适配。
- `app.js`：关键词生成、输入状态、保存、历史、清空确认、导出和键盘适配。

`index.html` 当前引用：

```html
<link rel="stylesheet" href="styles.css?v=20260707-title-fix" />
<script src="app.js?v=20260707-title-fix"></script>
```

如果修改了 `styles.css` 或 `app.js` 并要发布到 GitHub Pages，需要同步更新这两个 query string，避免浏览器继续使用旧缓存。

## 2. 页面结构

页面只有一个主容器：

```html
<main id="nightWriter" class="night-writer" aria-label="睡前写作区">
```

主容器内部按层叠关系包含：

- `.nw-glow`：台灯光、纸面光线和横线的视觉层。
- `.nw-vignette`：越写越安静时的暗角层。
- `#keywordLayer.nw-keyword-layer`：关键词浮层。
- `#introNote.nw-intro-note`：首屏提示“本机保存 / 不登录，不上传”。
- `#writingInput.nw-textarea`：核心写作输入区。
- `#historyToggle.nw-history-dot`：右上角“过去 7 天”入口。
- `#historyPanel.nw-history-panel`：历史记录抽屉。
- `#goodnightSignal.nw-goodnight`：写够后出现的“晚安”。
- `#clearTonight.nw-clear-tonight`：左下角“清空今晚”。
- `#clearPanel.nw-clear-panel`：清空确认抽屉。
- `#saveStatus.nw-save-status`：保存状态。

核心交互层级是：写作输入层在中间，关键词在它上方，历史和清空抽屉在最上方。历史和清空打开时，主写作内容会降低透明度并轻微模糊。

## 3. 字体策略

Web 端内置了一个 UI 字体：

```css
@font-face {
  font-family: "Night UI WenKai";
  src:
    local("LXGW WenKai Screen"),
    url("assets/fonts/lxgw-wenkai-screen-ui.woff2") format("woff2");
}
```

当前有两套字体变量：

```css
--ui-diary-font: "Night UI WenKai", "LXGW WenKai Screen", "Kaiti SC", "STKaiti", "KaiTi", serif;
--diary-font: "Songti SC", "STSong", "LXGW WenKai Screen", "LXGW WenKai", "Kaiti SC", "STKaiti", "KaiTi", "FangSong", "Noto Serif CJK SC", serif;
```

使用规则：

- 正文输入框使用 `--diary-font`，优先尝试 iOS/macOS 的宋体，再回退到文楷、楷体、仿宋和 serif。
- 小文本、占位文案、历史标题、按钮、保存状态使用 `--ui-diary-font`，优先使用内置文楷。
- 关键词单独使用 `"Songti SC", "STSong", "SimSun", Georgia, serif`，让它更像纸面上的隐约字迹。

需要注意：浏览器输入框里的中文字体是否命中宋体，仍受系统字体和浏览器限制影响。Web 端通过 font stack 尽量靠近宋体气质，但不是所有系统都一定有同名宋体。

## 4. 设计变量

视觉主要由 CSS 变量驱动：

```css
--night-surface: #05060b;
--paper-ink: #e2cc91;
--dusk-blue: #7280a4;
--ember: #bd7751;
--panel-surface: #07080f;
--glow-alpha: 0;
--writing-light: 0.06;
--line-light: 0.06;
--stage-breath: 0;
--text-glow: 0;
--lamp-presence: 0;
--room-quiet: 0;
--vignette-alpha: 0;
--safe-bottom: env(safe-area-inset-bottom, 0px);
--keyboard-bottom: 0px;
```

这些变量分成三类：

- 颜色：夜色背景、纸面文字、蓝灰辅助色、暖橙灯光。
- 状态：台灯存在感、写作光强、横线光强、暗角、文字发光。
- 设备：安全区底部和移动端键盘高度。

JS 会在用户输入时动态更新这些变量，CSS 根据变量完成视觉变化。

## 5. 首屏和台灯视觉

`.night-writer` 是全屏容器，使用 `100vw`、`100vh` 和 `100dvh` 占满视口。背景由两层径向渐变和一层线性渐变组成：

- 左中部偏暖的暗房间光。
- 右侧偏蓝的夜色阴影。
- 从顶部到底部的深夜底色。

`.nw-glow::before` 负责模拟台灯打开后的光域：

- 一层偏黄的圆形暖光。
- 一层偏橙的散射光。
- 一层斜向线性光束。
- 整体 `rotate(-6deg)`，让灯光像斜斜照在纸面上。

`.nw-glow::after` 负责纸面横线：

- 三条横向细线，分别在 0、86px、172px。
- 透明到暖色再透明。
- 整体 `rotate(-5deg)`，和光域方向一致。

首次输入后，主容器获得 `.has-text`，`.nw-glow` 播放 `lamp-switch-on`：

```css
@keyframes lamp-switch-on {
  0% { filter: brightness(0.82) saturate(0.96); opacity: 0.72; }
  18% { filter: brightness(1.55) saturate(1.1); opacity: 1; }
  48% { filter: brightness(1.16) saturate(1.04); opacity: 1; }
  100% { filter: brightness(1) saturate(1); opacity: 1; }
}
```

这就是“首个字写下时，小台灯一瞬间打开”的效果。

在用户继续书写时，灯光不是持续变亮，而是进入一个更稳定的微亮状态。`prefers-reduced-motion: no-preference` 时，`.nw-glow::before` 还会播放 `writing-light-breathe`，周期为 6200ms，模拟很轻的呼吸感。

## 6. 写作输入区

输入区是一个全屏 `textarea`：

```html
<textarea id="writingInput" class="nw-textarea"></textarea>
```

关键样式：

- `position: absolute; inset: 0;`
- `z-index: 10`
- `background: transparent`
- `resize: none`
- 隐藏滚动条
- 字号：`clamp(19px, 4.8vw, 27px)`
- 行高：`2.08`
- 字距：`0.025em`
- 文字颜色：`var(--paper-ink)`
- 光晕：由 `--text-glow` 控制

输入框的 padding 用来形成“可写光域”：

```css
padding:
  clamp(116px, 18vh, 180px)
  max(var(--content-x), calc(100vw - var(--content-x) - 610px))
  calc(88px + var(--safe-bottom) + var(--keyboard-bottom))
  var(--content-x);
```

这让文字主要落在左侧的台灯光域里，而不是铺满整屏。

## 7. 输入后的视觉状态

输入时调用 `setVisualState(text)`。核心逻辑：

```js
const hasWriting = text.trim().length > 0;
const glow = getGlow(text);
const completeRatio = clamp((glow - 0.88) / 0.12, 0, 1);
const lampRatio = hasWriting ? 1 : 0;
const quietRatio = clamp((glow - 0.18) / 0.82, 0, 1);
```

`glow` 基于去掉空白后的字数：

```js
getCharacterCount(text) / COMPLETION_COUNT
```

当前 `COMPLETION_COUNT = 120`。也就是说，约 120 个非空白字符会到达完整状态。

视觉变化分为几层：

- 有文字后，打开 `.has-text`。
- 台灯光从无到有：`--lamp-presence` 从 0 到 1。
- 背景略微进入当天暖色：`backgroundRatio = 0.38`。
- 写作光增强到 `0.132`。
- 横线光增强到 `0.112`。
- 文字光晕增强到 `0.5`。
- 写得越多，`--room-quiet` 越高，整体更安静。
- 接近完成时，`--vignette-alpha` 增大，暗角更明显。

“晚安”出现阈值：

- `glow >= 0.88` 时显示。
- `glow < 0.82` 时隐藏。

这个滞后区间避免用户删几个字时“晚安”频繁闪烁。

## 8. 每日颜色

Web 端内置 5 套每日背景色：

```js
const DAILY_ACCENTS = [
  { start: [7, 9, 16], end: [20, 11, 9] },
  { start: [8, 10, 18], end: [19, 12, 10] },
  { start: [6, 11, 17], end: [18, 12, 12] },
  { start: [9, 8, 16], end: [21, 10, 8] },
  { start: [7, 10, 14], end: [18, 13, 9] }
];
```

`getDateSeed()` 根据当天日期生成稳定 seed。`getDailyAccent()` 用日期 seed 选择当天色组。这样每天会有轻微不同，但同一天刷新页面不会跳变。

## 9. 关键词生成

关键词相关常量：

```js
const KEYWORD_KEY_PREFIX = "night-writing:keywords:";
const KEYWORD_VERSION = "night-lexicon-20260612-continuity";
```

关键词来自 `KEYWORD_POOLS`，分为：

- `openers`
- `body`
- `rooms`
- `feelings`
- `memory`
- `dream`
- `release`
- `quiet`
- `warm`
- `evening`
- `lateNight`
- `morning`
- `afternoon`
- `weekday`
- `weekend`
- `spring`
- `summer`
- `autumn`
- `winter`

每天生成 5 个关键词，对应 5 个位置：

```js
const KEYWORD_POSITIONS = [
  { top: "10%", left: "6%" },
  { top: "7%", left: "54%" },
  { top: "22%", right: "6%" },
  { top: "61%", left: "5%" },
  { bottom: "20%", right: "5%" }
];
```

生成规则：

- 从 `openers` 抽 1 个。
- 从 `feelings` 抽 1 个。
- 根据时间段抽 1 个：深夜、傍晚、清晨、午后。
- 根据季节抽 1 个：春、夏、秋、冬。
- 剩余位置从身体、房间、记忆、梦、释放、安静、温暖、工作日/周末池里补足。
- 如果还不够，从所有词里兜底补齐。

关键词会存入当天 localStorage。只要 `KEYWORD_VERSION` 不变，同一天刷新页面仍然保持同一组词。

## 10. 关键词交互

关键词渲染成按钮：

```html
<button class="nw-keyword" type="button"></button>
```

点击关键词时，`insertKeyword(keyword)` 会：

- 读取当前光标位置。
- 把关键词插入输入框。
- 把光标移动到关键词后面。
- 重新触发 `handleInput()`。

关键词状态由 `updateKeywordState(text)` 控制：

```js
button.classList.toggle("active", text.includes(button.dataset.keyword));
```

也就是说：

- 当前文字里包含某个关键词，它就点亮。
- 删除这个关键词后，它退出 active 状态。

Web 端关键词没有额外 JS 退光定时器，主要依赖 CSS transition：

```css
transition:
  color 1800ms ease,
  opacity 1600ms ease,
  text-shadow 1800ms ease,
  transform 1600ms ease;
```

所以 Web 端删除关键词时，会自然从暖黄高亮退回蓝灰暗字。

移动端关键词位置会覆盖为更适合手机屏幕的布局：

- 第 1 个：左侧 25% 高度。
- 第 2 个：右上 23% 高度。
- 第 3 个：右侧 42% 高度。
- 第 4 个：左下 64% 高度。
- 第 5 个：右下 17%。

## 11. 历史入口

右上角历史入口是：

```html
<button id="historyToggle" class="nw-history-dot">
  <span id="historyHint" class="nw-history-hint">过去 7 天</span>
</button>
```

视觉上它不是传统按钮，而是一个小圆点加一段低透明度文字。圆点由 `.nw-history-dot::after` 绘制。

第一次访问时会显示历史提示，逻辑：

- localStorage key：`night-writing:history-hint-seen:v1`
- 首次显示 `3600ms`
- 打开历史后立即隐藏
- 看过一次后不再自动出现

## 12. 历史抽屉

历史面板结构：

- 顶部：返回按钮、标题、关闭按钮。
- 中间：历史列表或历史详情。
- 底部：导出全部和隐私说明。

打开历史时：

```js
setHistoryOpen(true)
```

会执行：

- 关闭清空确认。
- 给主容器加 `.history-open`。
- 给历史面板加 `.open`。
- 设置 `aria-hidden=false`。
- 设置历史入口 `aria-expanded=true`。
- 渲染过去 7 天历史。

关闭历史时做相反操作。

历史抽屉在桌面端是右上浮层：

- 宽度：最多 340px。
- 最大高度：最多 560px。
- 背景：深色半透明渐变。
- 有 `backdrop-filter: blur(18px)`。
- 边框是低透明蓝灰。

在手机端是底部抽屉：

```css
top: auto;
right: 12px;
bottom: calc(12px + var(--safe-bottom));
left: 12px;
width: auto;
max-height: min(62dvh, calc(100dvh - 112px - var(--safe-bottom)));
transform: translate3d(0, 14px, 0);
```

抽屉顶部有一个小 handle，由 `.nw-history-panel::before` 绘制。

返回和关闭图标都不是文字字符，而是 CSS 伪元素画出来的线条：

- `.nw-history-back::before/after`：两条线组成返回箭头。
- `.nw-history-close::before/after`：两条线组成关闭叉号。

## 13. 历史数据规则

当前保存 key：

```js
const STORAGE_KEY = "night-writing:v1";
const ARCHIVE_KEY = "night-writing:entries:v1";
```

历史展示规则：

- 只展示最近 7 天。
- 空文本不进入历史。
- 同一天只保留一条。
- 按日期从新到旧排序。
- 最多取 7 条。

历史列表预览长度：

```js
const HISTORY_PREVIEW_LIMIT = 80;
```

超过 80 个字符会截断并加省略号。

日期格式：

- 今天：`今天`
- 昨天：`昨天`
- 其他：`M月D日 周X`

点历史条目后进入详情：

- 标题变为 `完整记录`。
- 返回按钮显示。
- 历史列表隐藏。
- 详情文本完整展示，保留换行。

## 14. 本地保存

Web 端只使用浏览器 localStorage，不登录、不上传。

保存前会先检测 localStorage 是否可用：

```js
localStorage.setItem(STORAGE_TEST_KEY, "1");
localStorage.removeItem(STORAGE_TEST_KEY);
```

输入时流程：

```js
handleInput()
  -> resetClearConfirmation()
  -> setVisualState(input.value)
  -> scheduleSave()
```

`scheduleSave()` 会：

- 显示“正在保存”。
- 清掉上一次保存定时器。
- 220ms 后调用 `persistEntry()`。

`persistEntry()` 会：

- 保存当前条目到 `night-writing:v1`。
- 把有内容的条目合并进 `night-writing:entries:v1`。
- 同一天数据会替换旧版本。
- archive 最多保留 60 条。
- 保存成功显示“已保存”。
- 保存失败显示“本机保存不可用”，并保持可见。

## 15. 清空今晚

有文字时，左下角显示：

```html
<button id="clearTonight" class="nw-clear-tonight">清空今晚</button>
```

点击后打开清空确认抽屉：

```js
setClearConfirmOpen(true)
```

打开时会：

- 关闭历史抽屉。
- 给主容器加 `.clear-open`。
- 给清空面板加 `.open`。
- 2800ms 后自动关闭。

清空面板内容：

- 问题：`清空今晚写下的内容？`
- 按钮：`保留`、`清空`

点击“清空”会：

- 取消保存定时器。
- 清空 textarea。
- 关闭确认抽屉。
- 重新计算视觉状态。
- 保存空内容。
- 显示“已清空”或“本机保存不可用”。
- 重新聚焦输入框。

## 16. 导出全部

导出按钮在历史抽屉底部：

```html
<button id="exportAll" class="nw-export-all">导出全部</button>
```

点击后先保存当前文本，再读取 archive。

导出文件名：

```js
今晚写点啥-YYYY-MM-DD.txt
```

导出内容格式：

```text
2026年7月8日
今晚写下的内容

--------------------

2026年7月7日
前一天的内容
```

文件开头带 UTF-8 BOM，避免部分系统打开 txt 时中文乱码。

导出策略：

- 如果浏览器支持 `navigator.share` 且能分享文件，优先打开系统分享。
- 如果是移动端或微信内置浏览器，尝试复制到剪贴板。
- 如果是桌面浏览器，则创建 Blob 并触发下载。

导出状态直接复用按钮文字：

- `暂无记录`
- `已打开分享`
- `已取消`
- `已复制，可粘贴保存`
- `请用系统浏览器导出`
- `已下载，请查看文件`

状态文字会在指定时间后恢复为 `导出全部`。

## 17. 移动端和键盘适配

移动端核心靠两个变量：

```css
--safe-bottom: env(safe-area-inset-bottom, 0px);
--keyboard-bottom: 0px;
```

`--safe-bottom` 处理 iPhone 底部安全区。

`--keyboard-bottom` 由 JS 计算：

```js
const rawInset = layoutHeight - viewport.height - viewport.offsetTop;
const maxInset = Math.round(layoutHeight * 0.52);
```

计算结果会 clamp 到合理范围，避免浏览器异常值把界面顶飞。

绑定的事件：

- window `resize`
- window `orientationchange`
- input `focus`
- input `blur`
- `visualViewport.resize`
- `visualViewport.scroll`

受键盘高度影响的位置：

- 输入框底部 padding。
- “晚安”位置。
- “清空今晚”位置。
- 保存状态位置。
- 清空确认抽屉位置。

历史抽屉当前移动端不叠加 `--keyboard-bottom`，它按底部安全区定位，避免历史打开时跟随键盘跳动。

## 18. 动效清单

当前 Web 端核心动效：

- `night-entry`：页面进入时轻微提亮。
- `lamp-switch-on`：首个字输入时台灯瞬间打开。
- `writing-light-breathe`：写作中灯光轻微呼吸。
- `goodnight-pulse`：写够后“晚安”慢速发光。
- 历史抽屉：透明度和位移动效。
- 清空抽屉：透明度和底部上滑动效。
- 关键词：颜色、透明度、光晕、位移的 1600-1800ms 过渡。
- 首屏提示：输入后淡出并上移。

降低动态效果：

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 1ms !important;
  }
}
```

用户系统设置为减少动态效果时，所有动画和过渡都会基本关闭。

## 19. 事件绑定

初始化顺序：

1. 检查 localStorage 是否可用。
2. 应用当天颜色。
3. 绑定移动端 viewport/键盘监听。
4. 加载当天关键词。
5. 渲染关键词。
6. 加载今天保存的文本。
7. 设置视觉状态。
8. 静默保存一次，保证 archive 状态一致。
9. 聚焦写作输入框。
10. 尝试显示历史提示。

主要事件：

- `input` 输入：更新视觉状态并延迟保存。
- 点击关键词：插入关键词。
- 点击主容器：聚焦输入框。
- 点击历史入口：打开或关闭历史抽屉。
- 点击历史关闭：关闭历史并回到输入。
- 点击历史返回：从详情回到列表。
- 点击导出全部：导出 archive。
- 点击清空今晚：打开清空确认。
- 点击保留：关闭清空确认。
- 点击清空：清空当前文本。
- 按 `Escape`：关闭历史或清空抽屉，并回到输入。

历史面板和清空面板会阻止点击事件冒泡，避免点面板内部时触发主容器聚焦。

## 20. 当前体验边界

当前 Web 端的设计边界是：

- 数据只在当前浏览器本地保存，不跨设备同步。
- 清理浏览器数据会丢失记录。
- 历史抽屉只展示最近 7 天，但 archive 内部最多保留 60 条用于导出。
- 正文宋体感依赖系统字体；UI 小字优先使用内置文楷。
- Web 端关键词删除后的退光主要由 CSS transition 实现，没有独立的释放态 class。
- 移动端抽屉样式是 Web CSS 实现，和小程序端需要分别维护。

## 21. 和小程序端同步时的重点

同步小程序端时，最容易出现差异的是：

- 字体：小程序需要单独声明 font-family 和内置字体资源，不能直接依赖浏览器 font stack。
- 按钮：小程序原生 `button` 有默认字体、padding、line-height，需要避免污染视觉。
- 关键词退光：Web 靠 CSS transition，小程序如果状态刷新过快，需要额外保留 releasing 状态。
- 历史抽屉：Web 是 bottom drawer + CSS 图标，小程序要单独实现右上关闭图标和返回图标。
- 清空抽屉：Web button 样式和小程序 button 默认样式不同，小程序更适合用 `view role="button"` 模拟。
- 键盘：Web 用 `visualViewport`，小程序要用微信自己的键盘和安全区 API。
