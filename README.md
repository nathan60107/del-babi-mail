# 巴哈姆特之刪除動畫瘋中獎信件

在巴哈姆特站內信（`https://mailbox.gamer.com.tw`）一鍵刪除動畫瘋問答遊戲的巴幣中獎通知信。本專案為 userscript，主要原始碼為本 repo 的 `main.js`。

**安裝**
1. 安裝使用者腳本管理器，例如 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。
2. 前往 Greasy Fork 安裝本腳本：https://greasyfork.org/zh-TW/scripts/399420

從 Greasy Fork 安裝後，腳本管理器會自動更新到最新版本。除非要參與開發，否則不需要從本 repo 手動安裝。

**功能**
- 在站內信收件匣的選單列加入「刪除巴幣中獎信」按鈕。
- 按下後依序讀取收件匣所有頁面的信件列表，逐封檢查內容。
- 只刪除內容完全符合動畫瘋問答遊戲巴幣中獎通知格式的信件（「恭喜您於…答對了動畫瘋的問答遊戲！本次獎勵：… 巴幣」）。
- 刪除進度會顯示在按鈕文字上，每刪除一封都會跳出通知。全部完成後點按鈕即可重新整理頁面。

**注意事項**
- 本腳本雖經過測試，但無法保證不會誤刪。刪除的信件無法復原，請理解風險後再使用。
- 為避免請求過於頻繁，每封信之間會間隔 150 ms、每頁列表之間間隔 100 ms，信件很多時需要一些時間。
- 本腳本依賴巴哈姆特站內信的頁面結構與內部 API，網站改版後可能失效。

**快速開發流程（Chrome + Tampermonkey）**
1. 確認腳本原始碼為本 repo 的 `main.js`（Windows 範例路徑：`C:\path\to\del-babi-mail\main.js`）。
2. 開啟 Chrome，若尚未安裝 Tampermonkey 請先安裝。
3. 允許 Tampermonkey 存取本機檔案：開啟 `chrome://extensions/`，找到 Tampermonkey，點選「詳細資料」，開啟「允許存取檔案網址」。
4. 在 Tampermonkey 新增腳本（控制台 → 新增腳本），貼上下方的 header，並將 `@require` 的本機路徑改為你自己的絕對路徑。
5. 儲存腳本。由於 `@require` 指向 `file:///` 網址，每次載入目標頁面時 Tampermonkey 都會從磁碟讀取 `main.js`，因此在外部修改檔案後重新整理站內信頁面即可看到變更。

**Userscript header（貼到 Tampermonkey，並將 `file:///...` 改為你自己的絕對路徑）**

```js
// ==UserScript==
// @name         巴哈姆特之刪除動畫瘋中獎信件
// @description  一鍵刪除惱人的中獎信件，本腳本雖經過測試，但無法保證不會誤刪，請理解風險後再使用
// @namespace    nathan60107
// @version      0.0.0
// @author       nathan60107(貝果)
// @homepage     https://home.gamer.com.tw/homeindex.php?owner=nathan60107
// @match        https://mailbox.gamer.com.tw/?l=1
// @match        https://mailbox.gamer.com.tw
// @grant        none
// @require      file:///C:/path/to/del-babi-mail/main.js
// ==/UserScript==
```
