# AGENTS.md

給 Codex（及其他 coding agent）的專案說明。請用繁體中文回覆與撰寫註解。

## 專案概要

「跳跳跑酷 · Jump Runner」：單一檔案的 HTML5 Canvas 跑酷小遊戲，手機與桌機皆可玩。
沒有 build 流程、沒有任何依賴，直接用瀏覽器開 `index.html` 即可。

```
index.html          整個遊戲（HTML + CSS + JS + 內嵌 PNG 圖片）
scripts/check.mjs   語法檢查腳本（只需要 Node，不需安裝套件）
```

## ⚠️ 讀取 index.html 的注意事項（很重要）

`index.html` 約 2.6 MB，其中大部分是 **base64 內嵌圖片**，集中在少數幾行超長的單行：

| 行號（約） | 內容 |
|---|---|
| 81  | `HERO_SRC` 主角精靈圖（約 58 萬字元） |
| 95  | `CROUCH.src` 蹲下圖 |
| 97  | `ATLAS.src` 動物障礙物圖集 |
| 1006–1019 | 第二段 `<script>`（`/*__SPRITE_ASSETS__*/`），設定 `window.IMG_*` 圖片 |

- **不要整檔讀取或 `cat index.html`**，會把 context 塞爆。
- 用 `grep -n ... | cut -c1-200` 找位置，用 `sed -n 'A,Bp' index.html | cut -c1-300` 看片段。
- 修改時避開上述 base64 行；除非任務就是換圖，否則不要動它們。
- 行號會隨修改變動，動手前先用 `grep -n` 重新確認。

## 程式結構（第一段 `<script>`，約 80–1003 行）

整段包在一個 IIFE 裡，全域狀態用 `let` 宣告，主要區塊：

- **畫面/尺寸**：`resize()`、`layout()`、`VW/VH/dpr/groundY`
- **音效與音樂**：Web Audio 即時合成（`actx()`、`tone()`、`noise()`、`sfx`、`startMusic()`/`stopMusic()`），沒有音檔
- **天空/背景**：`SKIES`、`approachSky()`、鯨魚、流星、飛碟、海鷗等場景物件
- **遊戲狀態**：`state`（`'ready' | 'play' | 'over' | 'win'`）、`score`、`coins`、`best`，`GOAL_SCORE=100` 到達即勝利
- **操作**：`doJump()`、`releaseJump()`（短按小跳）、`doSlide()`、`tap()`
- **流程**：`init()` → `start()`/`reset()` → `loop()`（`requestAnimationFrame`）→ `gameOver()` / 勝利
- **物件**：障礙 `spawn()`、磚塊 `spawnBricks()`/`bumpBrick()`、蘑菇（變大）`spawnMushroom()`、碎片、金幣
- **手感效果**：`addShake()`、`hitStop()`、`puff()`（粉塵）

## 開發規範

- 維持「單一 HTML 檔、零依賴」：不要引入框架、npm 套件或 build 工具，也不要拆檔（除非使用者要求）。
- 沿用既有風格：精簡的單行函式、短變數名、中文註解。
- 尺寸一律相對於 `VW` / `VH` / `player.baseH`，不要寫死像素，以支援各種螢幕。
- 同時顧及觸控（手機）與鍵盤（桌機）操作。
- UI 文字使用繁體中文。

## 驗證

每次修改後都要執行：

```bash
node scripts/check.mjs
```

它會抽出所有 inline `<script>` 並用 `node --check` 做語法檢查，全部 `ok` 才算通過。
若環境有瀏覽器，可再用 `python3 -m http.server 8000` 開啟 `http://localhost:8000/` 實際試玩。

## Git

- commit 訊息簡潔說明改了什麼（中英文皆可）。
- 不要 commit 暫存檔、截圖或 `node_modules`。
