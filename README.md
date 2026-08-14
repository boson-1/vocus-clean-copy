# vocus 複製去除來源網址

一支 userscript，讓 [vocus（方格子）](https://vocus.cc/) 文章內文的複製回到瀏覽器原生行為。

## 這支腳本解決什麼問題

在 vocus 文章頁反白內文按 Ctrl+C，貼出來會多一段你沒選到的東西：

```
父親節剛過，暑假也來到了後半。相較於母親節，父親節似乎「低調」多了……
—來自◯◯◯發佈於◯◯的沙龍 https://vocus.cc/article/6a7d5ba9fd897800018861cd
```

裝了這支腳本之後：

```
父親節剛過，暑假也來到了後半。相較於母親節，父親節似乎「低調」多了……
```

附帶好處：vocus 原本的處理會把複製結果一律降級成純文字，擋掉之後改走瀏覽器原生複製，
貼到 Word / Notion 可以保留原本的粗體、連結與段落。

## 安裝

1. 先安裝 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey、Greasemonkey 等 userscript 管理器）
2. 點這個連結，管理器會攔截並跳出安裝頁面：

   **➡️ [vocus-clean-copy.user.js — 點此安裝](https://raw.githubusercontent.com/boson-1/vocus-clean-copy/main/vocus-clean-copy.user.js)**

3. 按「安裝」，重新整理 vocus 文章頁即可

> 沒有跳出安裝畫面的話，代表瀏覽器沒有啟用 userscript 管理器，
> 連結會直接顯示原始碼；此時可複製全文後在 Tampermonkey 的「新增指令碼」貼上。

## 原理

vocus 在文章容器 `<article class="editor-content-block">` 上掛了一個**冒泡階段**的 `copy`
監聽器，在 `clipboardData` 寫入「選取文字 + 來源字串 + 文章網址」後呼叫 `preventDefault()`：

```js
// vocus 的 chunk 90211，webpack module 763447（僅 pages/article/[id] 使用，且恆開）
const el = document.querySelector('.editor-content-block');
el.addEventListener('copy', e => {
  const sel = getSelection().toString();
  if (sel) {
    e.clipboardData.setData('text/plain', `${sel}\n${來源字串} ${文章網址}`);
    e.preventDefault();
  }
});
```

因為它是掛在**元素**上的冒泡監聽器，本腳本只需要在 `document` 的**捕獲階段**先攔下 `copy`
事件並 `stopPropagation()`，事件就到不了該元素、它的 handler 不會執行、也不會
`preventDefault()`，瀏覽器便會執行原生複製。

腳本本身不碰 `clipboardData`、不申請任何 `@grant` 權限，全部邏輯不到 10 行。

## 範圍與安全防護

- 只在 `https://vocus.cc/*` 生效
- 只攔截發生在 `.editor-content-block`（文章內文）之內的複製
- 位於 `[contenteditable="true"]` 之中（例如 `/new-editor/` 的編輯器）時不介入
- 使用 `stopPropagation()` 而非 `stopImmediatePropagation()`，不影響 document 層其他監聽器
- 比對 `https://vocus.cc/*` 而非只比對 `/article/*`：vocus 是 Next.js SPA，
  從首頁 client-side 導航到文章頁不會重新注入 userscript，逐事件判斷才不會漏

## 授權

MIT
