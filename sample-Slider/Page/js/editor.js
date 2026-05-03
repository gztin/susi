CKEDITOR.config.versionCheck = false;

let dragSrc = null;

function updateEmptyHint() {
  const zone = document.getElementById('dropZone');
  const hint = document.getElementById('emptyHint');
  const blocks = zone.querySelectorAll('.block-item');
  hint.style.display = blocks.length === 0 ? 'block' : 'none';
}

function addBlock(type) {
  const zone = document.getElementById('dropZone');

  // 主標題限制只能一個，且固定在最上方
  if (type === 'heading') {
    if (zone.querySelector('.block-heading')) return;
  }

  const block = document.createElement('div');
  block.className = 'block-item block-' + type;
  block.draggable = true;
  block.innerHTML = buildBlockHTML(type) + '<button class="block-close" onclick="removeBlock(this)">移除區塊</button>';

  if (type === 'heading') {
    const hint = zone.querySelector('#emptyHint');
    zone.insertBefore(block, hint ? hint.nextSibling : zone.firstChild);
  } else {
    zone.appendChild(block);
  }

  if (type === 'text') {
    const ta = block.querySelector('textarea');
    if (ta) initCKEditor(ta.id);
  }
  bindDrag(block);
  // 綁定 placeholder 行為
  block.querySelectorAll('[contenteditable][data-placeholder]').forEach(el => {
    const update = () => el.setAttribute('data-empty', el.innerText.trim() === '' ? 'true' : 'false');
    el.setAttribute('data-empty', 'true');
    el.addEventListener('input', update);
    el.addEventListener('blur', update);
  });
  updateEmptyHint();
  updateHeadingBtn();
}

function updateHeadingBtn() {
  const zone = document.getElementById('dropZone');
  const btn = document.getElementById('btnHeading');
  if (!btn) return;
  btn.disabled = !!zone.querySelector('.block-heading');
}

function initCKEditor(id) {
  CKEDITOR.replace(id, {
    language: 'zh',
    height: 200,
    resize_enabled: false,
    versionCheck: false,
    editorplaceholder: '請輸入內文文字...',
    format_tags: 'p;h1;h2;h3;h4;h5;h6',
    toolbar: [
      { name: 'clipboard', items: ['Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo'] },
      { name: 'basicstyles', items: ['Bold','Italic','Underline','Strike','-','RemoveFormat'] },
      { name: 'paragraph', items: ['NumberedList','BulletedList','-','Blockquote'] },
      { name: 'links', items: ['Link','Unlink'] },
      { name: 'insert', items: ['Image','Table'] },
      '/',
      { name: 'styles', items: ['Styles','Format'] },
      { name: 'colors', items: ['TextColor','BGColor'] },
      { name: 'tools', items: ['Source'] }
    ]
  });
  CKEDITOR.instances[id].on('instanceReady', function() {
    this.container.$.addEventListener('dragstart', e => e.stopPropagation());
  });
}

function buildBlockHTML(type) {
  switch (type) {
    case 'heading':
      return '<h5 class="tit" contenteditable="true" data-placeholder="請輸入標題文字" data-empty="true"><span></span></h5>';
    case 'subheading':
      return '<div class="subT" contenteditable="true" data-placeholder="請輸入副標題文字" data-empty="true"></div>';
    case 'text': {
      const uid = 'cke_ta_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      return `<textarea id="${uid}" style="width:100%;min-height:120px;"></textarea>`;
    }
    case 'image':
      return `<div class="upload-area" onclick="this.nextElementSibling.click()">
                ＋ 點擊上傳圖片
              </div>
              <input type="file" accept="image/*" onchange="previewImg(this)">`;
    case 'image-group': {
      const slot = `<div class="img-slot">
        <div class="upload-area" onclick="this.nextElementSibling.click()">＋ 上傳圖片</div>
        <input type="file" accept="image/*" onchange="previewSlotImg(this)">
        <button class="slot-remove" onclick="clearSlotImg(this)">✕</button>
      </div>`;
      return `<div class="img-group-grid" data-cols="2">
        ${slot}${slot}
      </div>
      <div class="img-group-controls">
        <button onclick="addImgSlot(this)">＋ 新增圖片</button>
        <button onclick="removeImgSlot(this)">－ 移除最後</button>
        <div class="cols-toggle">
          欄數：
          <button class="active" onclick="setImgCols(this,2)">2</button>
          <button onclick="setImgCols(this,3)">3</button>
        </div>
      </div>`;
    }
    case 'file':
      return `<table class="file-table">
        <tbody>
          <tr>
            <th contenteditable="true">檔案名稱</th>
            <th class="td-download" style="width:80px;text-align:center;">下載</th>
          </tr>
          <tr>
            <td contenteditable="true">請輸入檔案名稱</td>
            <td class="td-download">${fileDownloadCell()}</td>
          </tr>
        </tbody>
      </table>
      <div class="file-controls">
        <button onclick="addFileRow(this)">＋ 新增列</button>
        <button class="btn-del-row" onclick="delFileRow(this)">－ 刪除最後列</button>
      </div>`;
    case 'fold':
      return `<div class="fold-header">
        <div class="fold-title-input" contenteditable="true" data-placeholder="請輸入折疊標題文字" data-empty="true"></div>
      </div>
      <div class="fold-body">
        <div class="fold-toolbar">
          <span class="fold-toolbar-label">加入：</span>
          <button onclick="addFoldBlock(this,'subheading')">副標題</button>
          <button onclick="addFoldBlock(this,'text')">內文</button>
          <button onclick="addFoldBlock(this,'image')">圖片</button>
          <button onclick="addFoldBlock(this,'table')">表格</button>
        </div>
        <div class="fold-drop-zone"></div>
      </div>`;
    case 'table':
      return `<table class="environmental">
        <tbody>
          <tr>
            <th contenteditable="true" width="25%">項目</th>
            <th contenteditable="true">說明</th>
          </tr>
          <tr>
            <td contenteditable="true">請輸入項目</td>
            <td contenteditable="true">請輸入說明內容</td>
          </tr>
          <tr>
            <td contenteditable="true">請輸入項目</td>
            <td contenteditable="true">請輸入說明內容</td>
          </tr>
        </tbody>
      </table>
      <div class="table-controls">
        <button onclick="addTableRow(this)">＋ 新增列</button>
        <button class="btn-del-row" onclick="delTableRow(this)">－ 刪除最後列</button>
      </div>`;
  }
}

function toggleFold(btn) {
  // 編輯器內不做收折，按鈕僅為視覺裝飾
}

function addFoldBlock(btn, type) {
  const zone = btn.closest('.fold-body').querySelector('.fold-drop-zone');
  const child = document.createElement('div');
  child.className = 'fold-child';

  let inner = '';
  if (type === 'subheading') {
    inner = '<div class="subT" contenteditable="true" data-placeholder="請輸入副標題" data-empty="true"></div>';
  } else if (type === 'text') {
    const uid = 'cke_fold_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    inner = `<textarea id="${uid}" style="width:100%;min-height:80px;"></textarea>`;
  } else if (type === 'image') {
    inner = `<div class="upload-area" style="border:1px dashed #ccc;padding:20px;text-align:center;cursor:pointer;font-size:12px;color:#aaa;" onclick="this.nextElementSibling.click()">＋ 上傳圖片</div>
             <input type="file" accept="image/*" style="display:none;" onchange="previewFoldImg(this)">`;
  } else if (type === 'table') {
    inner = buildBlockHTML('table');
  }

  child.innerHTML = inner + '<button class="fold-child-remove" onclick="removeFoldChild(this)">移除</button>';
  zone.appendChild(child);

  if (type === 'text') {
    const ta = child.querySelector('textarea');
    if (ta) initCKEditor(ta.id);
  }
  child.querySelectorAll('[contenteditable][data-placeholder]').forEach(el => {
    const update = () => el.setAttribute('data-empty', el.innerText.trim() === '' ? 'true' : 'false');
    el.setAttribute('data-empty', 'true');
    el.addEventListener('input', update);
    el.addEventListener('blur', update);
  });
  bindFoldChildDrag(child, zone);
}

function bindFoldChildDrag(el, zone) {
  let dragSrcChild = null;
  el.addEventListener('dragstart', e => {
    if (e.target.closest && e.target.closest('.cke')) { e.preventDefault(); return; }
    dragSrcChild = el;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    zone.querySelectorAll('.fold-child').forEach(c => c.classList.remove('drag-over'));
  });
  el.addEventListener('dragover', e => {
    e.preventDefault(); e.stopPropagation();
    if (el !== dragSrcChild) el.classList.add('drag-over');
  });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', e => {
    e.preventDefault(); e.stopPropagation();
    el.classList.remove('drag-over');
    if (dragSrcChild && dragSrcChild !== el) {
      const children = [...zone.querySelectorAll('.fold-child')];
      const si = children.indexOf(dragSrcChild), ti = children.indexOf(el);
      zone.insertBefore(dragSrcChild, si < ti ? el.nextSibling : el);
    }
  });
  el.draggable = true;
}

function removeFoldChild(btn) {
  const child = btn.closest('.fold-child');
  const ta = child.querySelector('textarea');
  if (ta && CKEDITOR.instances[ta.id]) CKEDITOR.instances[ta.id].destroy();
  child.remove();
}

function previewFoldImg(input) {
  if (input.files && input.files[0]) {
    const area = input.previousElementSibling;
    const url = URL.createObjectURL(input.files[0]);
    area.innerHTML = `<img src="${url}" style="max-width:100%;display:block;">`;
    area.style.padding = '0';
    area.style.border = 'none';
    area.onclick = null;
  }
}

function addTableRow(btn) {
  const table = btn.closest('.block-table').querySelector('table');
  const tbody = table.querySelector('tbody');
  const colCount = tbody.querySelector('tr').children.length;
  const tr = document.createElement('tr');
  for (let i = 0; i < colCount; i++) {
    const td = document.createElement('td');
    td.contentEditable = 'true';
    td.textContent = '請輸入內容';
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
}

function delTableRow(btn) {
  const tbody = btn.closest('.block-table').querySelector('tbody');
  if (tbody.rows.length > 1) tbody.deleteRow(-1);
}

function makeImgSlot() {
  return `<div class="img-slot">
    <div class="upload-area" onclick="this.nextElementSibling.click()">＋ 上傳圖片</div>
    <input type="file" accept="image/*" onchange="previewSlotImg(this)">
    <button class="slot-remove" onclick="clearSlotImg(this)">✕</button>
  </div>`;
}

function previewSlotImg(input) {
  if (input.files && input.files[0]) {
    const area = input.previousElementSibling;
    const url = URL.createObjectURL(input.files[0]);
    area.innerHTML = `<img src="${url}" alt="">`;
    area.classList.add('has-image');
    area.style.padding = '0';
    area.onclick = null;
  }
}

function clearSlotImg(btn) {
  const slot = btn.closest('.img-slot');
  const area = slot.querySelector('.upload-area');
  area.innerHTML = '＋ 上傳圖片';
  area.classList.remove('has-image');
  area.style.padding = '';
  area.onclick = function() { slot.querySelector('input[type=file]').click(); };
  slot.querySelector('input[type=file]').value = '';
}

function addImgSlot(btn) {
  const grid = btn.closest('.block-image-group').querySelector('.img-group-grid');
  grid.insertAdjacentHTML('beforeend', `<div class="img-slot">
    <div class="upload-area" onclick="this.nextElementSibling.click()">＋ 上傳圖片</div>
    <input type="file" accept="image/*" onchange="previewSlotImg(this)">
    <button class="slot-remove" onclick="clearSlotImg(this)">✕</button>
  </div>`);
}

function removeImgSlot(btn) {
  const grid = btn.closest('.block-image-group').querySelector('.img-group-grid');
  if (grid.children.length > 1) grid.lastElementChild.remove();
}

function setImgCols(btn, cols) {
  const group = btn.closest('.block-image-group');
  const grid = group.querySelector('.img-group-grid');
  grid.className = 'img-group-grid' + (cols === 3 ? ' cols-3' : '');
  grid.dataset.cols = cols;
  btn.closest('.cols-toggle').querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function previewImg(input) {
  if (input.files && input.files[0]) {
    const area = input.previousElementSibling;
    const url = URL.createObjectURL(input.files[0]);
    area.innerHTML = `<img class="preview-img" src="${url}" alt="預覽圖片">
      <div class="img-actions">
        <button onclick="this.closest('.block-image').querySelector('input[type=file]').click()">重新上傳</button>
        <button onclick="clearImg(this)">移除圖片</button>
      </div>`;
    area.classList.add('has-image');
  }
}

function clearImg(btn) {
  const area = btn.closest('.upload-area');
  area.classList.remove('has-image');
  area.innerHTML = '＋ 點擊上傳圖片';
  btn.closest('.block-image').querySelector('input[type=file]').value = '';
}

function fileDownloadCell() {
  return `<button class="upload-link-btn" title="點擊設定連結" onclick="openUrlModal(this)"><img src="img/icon_downLoad.png" alt="下載" style="width:20px;height:20px;"></button>`;
}
let _urlTargetBtn = null;

function openUrlModal(btn) {
  _urlTargetBtn = btn;
  const input = document.getElementById('urlModalInput');
  input.value = btn.dataset.href || '';
  document.getElementById('urlModal').style.display = 'flex';
  setTimeout(() => input.focus(), 50);
}

function closeUrlModal() {
  document.getElementById('urlModal').style.display = 'none';
  _urlTargetBtn = null;
}

function confirmUrl() {
  const url = document.getElementById('urlModalInput').value.trim();
  if (_urlTargetBtn) {
    _urlTargetBtn.dataset.href = url;
    _urlTargetBtn.classList.toggle('has-link', !!url);
    _urlTargetBtn.title = url ? '已設定：' + url + '（點擊修改）' : '點擊設定連結';
    // 若有 URL，點按鈕直接開連結（編輯模式下 ctrl+click 或右鍵）
    _urlTargetBtn.onclick = url
      ? function(e) { if (e.ctrlKey || e.metaKey) { window.open(url, '_blank'); } else { openUrlModal(this); } }
      : function() { openUrlModal(this); };
  }
  closeUrlModal();
}

function attachFile(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const td = input.closest('tr').querySelector('td[contenteditable]');
    if (td && td.textContent.trim() === '請輸入檔案名稱') td.textContent = file.name;
    // 儲存檔案 URL 到 button 的 data 屬性供預覽用
    const btn = input.previousElementSibling;
    btn.dataset.fileUrl = URL.createObjectURL(file);
    btn.dataset.fileName = file.name;
    btn.style.color = '#4a7fc1';
  }
}

function addFileRow(btn) {
  const tbody = btn.closest('.block-file').querySelector('tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td contenteditable="true">請輸入檔案名稱</td>
    <td class="td-download">${fileDownloadCell()}</td>`;
  tbody.appendChild(tr);
}

function delFileRow(btn) {
  const tbody = btn.closest('.block-file').querySelector('tbody');
  // 保留 th 列，至少保留一筆 td 列
  const rows = tbody.querySelectorAll('tr');
  if (rows.length > 2) tbody.deleteRow(-1);
}

function removeBlock(btn) {
  const block = btn.closest('.block-item');
  // 銷毀該區塊內的 CKEditor instance
  const ta = block.querySelector('textarea');
  if (ta && CKEDITOR.instances[ta.id]) {
    CKEDITOR.instances[ta.id].destroy();
  }
  block.remove();
  updateEmptyHint();
  updateHeadingBtn();
}

function bindDrag(el) {
  el.addEventListener('dragstart', e => {
    // 標題區塊不可拖曳
    if (el.classList.contains('block-heading')) { e.preventDefault(); return; }
    // 若點擊來源在 CKEditor 內部則不啟動拖曳
    if (e.target.closest && e.target.closest('.cke')) {
      e.preventDefault();
      return;
    }
    dragSrc = el;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('.block-item').forEach(b => b.classList.remove('drag-over'));
  });
  el.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (el !== dragSrc) el.classList.add('drag-over');
  });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('drag-over');
    if (dragSrc && dragSrc !== el) {
      const zone = document.getElementById('dropZone');
      const items = [...zone.querySelectorAll('.block-item')];
      const srcIdx = items.indexOf(dragSrc);
      const tgtIdx = items.indexOf(el);

      // 不允許拖到標題區塊之前
      if (el.classList.contains('block-heading')) return;

      const ckData = saveCKEditors();

      if (srcIdx < tgtIdx) {
        zone.insertBefore(dragSrc, el.nextSibling);
      } else {
        zone.insertBefore(dragSrc, el);
      }

      // 移動後重建 CKEditor
      restoreCKEditors(ckData);
    }
  });
}

function saveCKEditors() {
  const data = {};
  for (const name in CKEDITOR.instances) {
    data[name] = CKEDITOR.instances[name].getData();
    CKEDITOR.instances[name].destroy();
  }
  return data;
}

function restoreCKEditors(data) {
  document.querySelectorAll('.block-text textarea').forEach(ta => {
    const savedData = data[ta.id] || ta.value;
    ta.value = savedData;
    initCKEditor(ta.id);
  });
}

function resetEditor() {
  if (!confirm('確定要重置所有內容嗎？')) return;
  const zone = document.getElementById('dropZone');
  // 銷毀所有 CKEditor
  zone.querySelectorAll('.block-text textarea').forEach(ta => {
    if (CKEDITOR.instances[ta.id]) CKEDITOR.instances[ta.id].destroy();
  });
  zone.querySelectorAll('.block-item').forEach(b => b.remove());
  updateEmptyHint();
  updateHeadingBtn();
  // 重置後主標題必須重新加入
  addBlock('heading');
}

function validateBlocks() {
  const zone = document.getElementById('dropZone');
  const errors = [];

  // 主標題優先檢查
  const headingBlock = zone.querySelector('.block-heading');
  if (headingBlock) {
    const tit = headingBlock.querySelector('h5.tit');
    if (!tit || tit.innerText.trim() === '') {
      alert('請填寫主標題文字後再預覽。');
      tit?.focus();
      return false;
    }
  }

  zone.querySelectorAll('.block-item').forEach((block, i) => {
    const idx = i + 1;

    // contenteditable 空白檢查（跳過主標題，已單獨處理）
    if (!block.classList.contains('block-heading')) {
      block.querySelectorAll('[contenteditable]').forEach(el => {
        if (el.innerText.trim() === '') {
          const name = block.classList.contains('block-subheading') ? '副標題'
            : block.classList.contains('block-file') ? '檔案下載'
            : block.classList.contains('block-table') ? '表格'
            : block.classList.contains('block-fold') ? '折文標題'
            : '元件';
          errors.push(`第 ${idx} 個區塊（${name}）有欄位尚未填寫`);
        }
      });
    }

    // CKEditor 空白檢查
    const ta = block.querySelector('textarea');
    if (ta && CKEDITOR.instances[ta.id]) {
      const text = CKEDITOR.instances[ta.id].getData().replace(/<[^>]*>/g, '').trim();
      if (!text) errors.push(`第 ${idx} 個區塊（內文）尚未填寫`);
    }

    // 圖片未上傳
    if (block.classList.contains('block-image')) {
      const img = block.querySelector('img.preview-img');
      if (!img) errors.push(`第 ${idx} 個區塊（圖片）尚未上傳圖片`);
    }
  });

  // 去重
  const unique = [...new Set(errors)];
  if (unique.length > 0) {
    alert('請完成以下欄位後再預覽：\n\n' + unique.join('\n'));
    return false;
  }
  return true;
}

function previewPage() {
  if (!validateBlocks()) return;
  const zone = document.getElementById('dropZone');
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>預覽</title>
    <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Microsoft JhengHei',sans-serif;background:#f0f0f0;padding:40px 20px;}
    .inner_box{width:780px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;padding:32px;}
    .inner_box > *{margin-bottom:20px;}
    ul,ol{padding-left:1.5em;margin:0.5em 0;}
    li{line-height:1.8;}
    h5.tit{font-size:20px;margin:0 0 20px;color:#000;border-left:4px solid #bb9157;padding-left:10px;display:flex;align-items:center;gap:16px;}
    h5.tit::after{content:'';flex:1;height:1px;background:#e8ddd0;}
    .subT{color:#fff;font-size:18px;line-height:1.2;background-color:#c4b993;padding:6px 15px;display:inline-block;margin:0 0 15px 0;}
    details summary{cursor:pointer;font-weight:bold;}
    .fold-section{border-bottom:1px solid #e0e0e0;margin-bottom:0;}
    .fold-section-header{display:flex;align-items:center;justify-content:space-between;height:40px;padding:0;cursor:pointer;}
    .fold-section-title{font-size:16px;font-weight:400;color:#4a7fc1;padding-left:0;}
    .fold-section-icon{width:24px;height:24px;display:block;background:url(img/icon_open.png) center no-repeat;background-size:contain;flex-shrink:0;}
    .fold-section.open .fold-section-icon{background-image:url(img/icon_close.png);}
    .fold-section-body{display:none;padding:12px 0 16px;}
    .fold-section.open .fold-section-body{display:block;}
    .fold-content-item{margin-bottom:12px;}
    img{width:740px;max-width:100%;display:block;}
    .img-group-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
    .img-group-grid.cols-3{grid-template-columns:repeat(3,1fr);}
    .img-group-grid img{width:100% !important;display:block;}
    table.environmental,table.file-table{width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e0d9ce;margin-bottom:12px;}
    table.environmental th,table.file-table th{background:#f8f8f8;border-bottom:2px solid #c8a96e;border-top:1px solid #e0d9ce;border-right:1px solid #e0d9ce;padding:12px 16px;text-align:left;font-weight:500;color:#4c4c4c;}
    table.environmental td,table.file-table td{border-bottom:1px solid #e0d9ce;border-right:1px solid #e0d9ce;padding:12px 16px;vertical-align:middle;color:#4c4c4c;font-size:14px;transition:color 0.15s;}
    table.environmental tr:hover td,table.file-table tr:hover td{background-color:#f9f9f9;color:#bb9157;}
    table.environmental th:last-child,table.file-table th:last-child,table.environmental td:last-child,table.file-table td:last-child{border-right:none;color:#4c4c4c;}
    table.environmental tr:last-child td,table.file-table tr:last-child td{border-bottom:none;}
    .td-download{width:80px;text-align:center;}
    .td-download a{display:block;width:20px;height:18px;background:url(img/icon_downLoad.png) bottom no-repeat;background-size:20px auto;margin:0 auto;text-decoration:none;}
    .td-download a:hover{background-position:top;}
    </style></head><body><div class="inner_box">`);

  zone.querySelectorAll('.block-item').forEach(block => {
    const clone = block.cloneNode(true);

    // 移除編輯器 UI
    clone.querySelector('.block-close')?.remove();
    clone.querySelectorAll('.table-controls, .file-controls, .img-actions, .fold-toolbar, .fold-child-remove, .fold-toggle-btn').forEach(el => el.remove());
    clone.querySelectorAll('input[type=file]').forEach(el => el.remove());
    clone.querySelectorAll('.cke').forEach(el => el.remove());

    // 折文元件：轉換成官網樣式輸出
    if (block.classList.contains('block-fold')) {
      const titleEl = block.querySelector('.fold-title-input');
      const title = (titleEl ? (titleEl.innerText || titleEl.textContent) : '折疊標題').trim();
      const foldClone = block.cloneNode(true);
      // CKEditor 內容
      foldClone.querySelectorAll('.fold-child textarea').forEach(ta => {
        if (CKEDITOR.instances[ta.id]) {
          const div = document.createElement('div');
          div.innerHTML = CKEDITOR.instances[ta.id].getData();
          ta.replaceWith(div);
        }
      });
      // 圖片
      foldClone.querySelectorAll('.fold-child .upload-area').forEach(area => {
        const img = area.querySelector('img');
        img ? area.replaceWith(img) : area.remove();
      });
      foldClone.querySelectorAll('.fold-child input[type=file], .fold-child .fold-child-remove, .cke, .fold-toolbar').forEach(el => el.remove());

      let childrenHTML = '';
      foldClone.querySelectorAll('.fold-child').forEach(child => {
        childrenHTML += `<div class="fold-content-item">${child.innerHTML}</div>`;
      });

      win.document.write(`
        <div class="fold-section">
          <div class="fold-section-header" onclick="this.parentElement.classList.toggle('open')">
            <span class="fold-section-title">${title}</span>
            <span class="fold-section-icon"></span>
          </div>
          <div class="fold-section-body">${childrenHTML}</div>
        </div>`);
      return;
    }

    // 折文子元件的 CKEditor 內容（非折文區塊）
    clone.querySelectorAll('.fold-child textarea').forEach(ta => {
      if (CKEDITOR.instances[ta.id]) {
        const div = document.createElement('div');
        div.innerHTML = CKEDITOR.instances[ta.id].getData();
        ta.replaceWith(div);
      }
    });

    // 移除單張圖片區塊的上傳提示（只保留 img）
    if (block.classList.contains('block-image')) {
      const uploadArea = clone.querySelector('.upload-area');
      if (uploadArea) {
        const img = uploadArea.querySelector('img.preview-img');
        if (img) {
          uploadArea.replaceWith(img);
        } else {
          uploadArea.remove();
        }
      }
    }
    // 圖片群組：清理每個 slot
    clone.querySelectorAll('.img-slot').forEach(slot => {
      const img = slot.querySelector('img');
      slot.querySelector('.slot-remove')?.remove();
      slot.querySelector('input[type=file]')?.remove();
      const area = slot.querySelector('.upload-area');
      if (img) {
        area ? area.replaceWith(img) : null;
      } else {
        slot.remove();
      }
    });
    clone.querySelector('.img-group-controls')?.remove();

    // CKEditor 內容
    const ta = clone.querySelector('textarea');
    if (ta && CKEDITOR.instances[ta.id]) {
      const div = document.createElement('div');
      div.innerHTML = CKEDITOR.instances[ta.id].getData();
      ta.replaceWith(div);
    }

    // 檔案下載按鈕轉 <a>
    clone.querySelectorAll('.upload-link-btn').forEach(btn => {
      const url = btn.dataset.href || '';
      const td = btn.closest('.td-download');
      const a = document.createElement('a');
      a.href = url || '#';
      if (url) a.target = '_blank';
      a.className = 'downLoad';
      a.innerHTML = '';
      td.innerHTML = '';
      td.appendChild(a);
    });

    win.document.write(clone.innerHTML);
  });

  win.document.write('</div></body></html>');
  win.document.close();
}

updateEmptyHint();
updateHeadingBtn();

// 預設加入主標題
addBlock('heading');

// 查看程式碼 modal
const componentCode = {
  heading: {
    html: `<h5 class="tit"><span>主標題文字</span></h5>`,
    css: `.tit {\n  font-size: 14px;\n  font-weight: bold;\n  border-left: 4px solid #c8a96e;\n  padding-left: 10px;\n}`
  },
  subheading: {
    html: `<div class="subT">副標題文字</div>`,
    css: `.subT {\n  font-size: 14px;\n  color: #333;\n}`
  },
  text: {
    html: `<p>請填入內文文字</p>`,
    css: `p {\n  font-size: 14px;\n  line-height: 1.8;\n  color: #333;\n}`
  },
  image: {
    html: `<!-- 圖片 -->\n<figure class="image-block">\n  <img src="image.jpg" alt="圖片說明">\n</figure>`,
    css: `.image-block img {\n  max-width: 100%;\n  display: block;\n}`
  },
  file: {
    html: `<!-- 檔案下載 -->\n<div class="file-block">\n  <a href="file.pdf" download>📎 檔案名稱.pdf</a>\n</div>`,
    css: `.file-block a {\n  font-size: 14px;\n  color: #4a7fc1;\n  text-decoration: none;\n}`
  },
  fold: {
    html: `<!-- 折文 -->\n<details class="fold-block">\n  <summary>折疊標題</summary>\n  <p>折疊內容文字</p>\n</details>`,
    css: `.fold-block summary {\n  cursor: pointer;\n  font-weight: bold;\n  font-size: 14px;\n}\n.fold-block p {\n  padding: 8px 0;\n  font-size: 14px;\n}`
  },
  table: {
    html: `<table class="environmental">\n  <tbody>\n    <tr>\n      <th width="25%">項目</th>\n      <th>說明</th>\n    </tr>\n    <tr>\n      <td>項目文字</td>\n      <td>說明內容</td>\n    </tr>\n  </tbody>\n</table>`,
    css: `.environmental {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 14px;\n}\n.environmental th {\n  border-bottom: 2px solid #c8a96e;\n  padding: 10px 14px;\n  text-align: left;\n}\n.environmental td {\n  border-bottom: 1px solid #e8e8e8;\n  padding: 10px 14px;\n  vertical-align: top;\n}`
  }
};

function showCode(type, mode) {
  const data = componentCode[type];
  if (!data) return;
  const modal = document.getElementById('codeModal');
  document.getElementById('codeModalTitle').textContent = type + ' — ' + mode.toUpperCase();
  document.getElementById('codeModalContent').textContent = data[mode] || '（尚未提供）';
  modal.style.display = 'flex';
}
