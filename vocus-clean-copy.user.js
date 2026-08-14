// ==UserScript==
// @name         vocus 複製去除來源網址
// @name:en      vocus Clean Copy
// @namespace    https://vocus.cc/vocus-clean-copy
// @version      1.0.0
// @description  複製 vocus（方格子）文章內文時，移除自動附加的「—來自◯◯發佈於◯◯ https://vocus.cc/article/…」尾巴，改用瀏覽器原生複製。
// @description:en  Stop vocus.cc from appending the author/source line and article URL to copied text.
// @author       boson
// @license      MIT
// @homepageURL  https://vocus.cc/
// @match        https://vocus.cc/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // vocus 在 <article class="editor-content-block"> 上掛冒泡階段的 copy listener，
  // 於 clipboardData 補上來源字串與文章網址後 preventDefault()。
  // 這裡在 document 捕獲階段先攔下並 stopPropagation()，事件到不了該元素，
  // 網站的 handler 不會執行，瀏覽器改走原生複製。
  document.addEventListener('copy', function (e) {
    var node = e.target;
    var el = node && node.nodeType === 1 ? node : node && node.parentElement;
    if (!el || !el.closest) return;
    if (el.closest('[contenteditable="true"]')) return;  // 編輯器維持原生行為，不介入
    if (!el.closest('.editor-content-block')) return;    // 只處理文章內文
    e.stopPropagation();
  }, true);
})();
