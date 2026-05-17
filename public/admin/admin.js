// ── File definitions ──
const FILES = [
  { path:'src/content/products/night-light-01.md', name:'经典圆柱夜灯', group:'产品 (中文)' },
  { path:'src/content/products/night-light-02.md', name:'文创长条夜灯', group:'产品 (中文)' },
  { path:'src/content/products/night-light-03.md', name:'异形定制夜灯', group:'产品 (中文)' },
  { path:'src/content/products/flip-book-01.md', name:'翻页图册', group:'产品 (中文)' },
  { path:'src/content/products/nixie-clock-01.md', name:'IPS彩屏时钟', group:'产品 (中文)' },
  { path:'src/content/products/neon-sign-01.md', name:'迷你电气灯', group:'产品 (中文)' },
  { path:'src/content/products/ambient-light-01.md', name:'创意氛围灯', group:'产品 (中文)' },
  { path:'src/content/products_en/night-light-01.md', name:'Classic Night Light', group:'Products (EN)' },
  { path:'src/content/products_en/night-light-02.md', name:'Cultural Night Light', group:'Products (EN)' },
  { path:'src/content/products_en/night-light-03.md', name:'Custom Night Light', group:'Products (EN)' },
  { path:'src/content/products_en/flip-book-01.md', name:'Flip Book', group:'Products (EN)' },
  { path:'src/content/products_en/nixie-clock-01.md', name:'IPS Clock', group:'Products (EN)' },
  { path:'src/content/products_en/neon-sign-01.md', name:'Neon Sign', group:'Products (EN)' },
  { path:'src/content/products_en/ambient-light-01.md', name:'Ambient Light', group:'Products (EN)' },
  { path:'src/content/cases/buaa-case.md', name:'北航案例', group:'案例 (中文)' },
  { path:'src/content/cases/corp-gift-case.md', name:'企业礼品案例', group:'案例 (中文)' },
  { path:'src/content/cases_en/buaa-case.md', name:'BUAA Case', group:'Cases (EN)' },
  { path:'src/content/cases_en/corp-gift-case.md', name:'Corp Gift Case', group:'Cases (EN)' },
];

const CATEGORIES = ['night-light','flip-book','nixie-clock','neon-sign','ambient-light'];
const TEMPLATES = ['image-only','slideshow','image-center','image-left','image-right'];

let currentFile = null;
let currentData = null;
let currentDirty = false;

// ── Render sidebar ──
const fileList = document.getElementById('fileList');
let group = '';
FILES.forEach(f => {
  if (f.group !== group) { group = f.group;
    const l = document.createElement('div'); l.className = 'nav-group'; l.textContent = f.group; fileList.appendChild(l); }
  const btn = document.createElement('button'); btn.className = 'nav-item'; btn.textContent = f.name;
  btn.onclick = () => selectFile(f, btn);
  fileList.appendChild(btn);
});

// ── Select file ──
async function selectFile(file, btn) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentFile = file;
  document.getElementById('editorTitle').textContent = file.name + ' — 编辑中';

  const status = document.getElementById('saveStatus');
  const saveBtn = document.getElementById('saveBtn');
  status.textContent = '加载中...'; status.className = 'save-status';
  saveBtn.disabled = true;

  try {
    const res = await fetch(`/api/data?path=${file.path}`);
    const text = await res.text();
    currentData = parseFrontmatter(text);
    renderForm(currentData);
    currentDirty = false;
    saveBtn.disabled = false;
    status.textContent = '已加载'; status.className = 'save-status';
  } catch (e) {
    status.textContent = '加载失败'; status.className = 'save-status error';
  }
}

// ── Parse frontmatter via js-yaml ──
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)?$/);
  if (!m) return { data: {}, body: text || '' };
  try {
    const data = jsyaml.load(m[1]);
    return { data: data || {}, body: (m[2] || '').trim() };
  } catch { return { data: {}, body: text }; }
}

// ── Render form ──
function renderForm(fm) {
  const d = fm.data || {};
  const panel = document.getElementById('formPanel');
  panel.classList.remove('hidden');
  document.getElementById('emptyState').classList.add('hidden');

  panel.innerHTML = `
    <div class="form">
      <div class="form-row">
        <div class="form-group"><label class="form-label">ID</label><input class="form-input" id="f_id" value="${esc(d.id||'')}" readonly style="background:var(--bg)"></div>
        <div class="form-group"><label class="form-label">排序</label><input class="form-input" id="f_order" type="number" value="${d.order||0}"></div>
      </div>
      <div class="form-group"><label class="form-label">标题</label><input class="form-input" id="f_title" value="${esc(d.title||'')}"></div>
      <div class="form-group"><label class="form-label">副标题</label><input class="form-input" id="f_subtitle" value="${esc(d.subtitle||'')}"></div>
      <div class="form-group"><label class="form-label">描述</label><textarea class="form-textarea" id="f_description" rows="4">${esc(d.description||'')}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">分类</label><select class="form-select" id="f_category">${CATEGORIES.map(c => `<option value="${c}"${d.category===c?' selected':''}>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">模板</label><select class="form-select" id="f_template">${TEMPLATES.map(t => `<option value="${t}"${(d.template||'image-only')===t?' selected':''}>${t}</option>`).join('')}</select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">起订量</label><input class="form-input" id="f_moq" value="${esc(d.moq||'')}"></div>
        <div class="form-group"><label class="form-label">价格区间</label><input class="form-input" id="f_priceRange" value="${esc(d.priceRange||'')}"></div>
      </div>
      <div class="form-group"><label class="form-checkbox"><input type="checkbox" id="f_published" ${d.published!==false?'checked':''}> 已发布</label></div>

      <div class="form-section">产品图片</div>
      <div class="image-grid" id="imageGrid"></div>
      <label class="upload-area" id="uploadArea">+ 点击上传图片<input type="file" id="fileInput" accept="image/*"></label>

      <div class="form-section">产品特点</div>
      <div class="list-group" id="featuresList"></div>

      <div class="form-section">规格参数</div>
      <div class="list-group" id="specsList"></div>

      <div class="form-section">定制选项</div>
      <div class="list-group" id="customList"></div>
    </div>
  `;

  // Populate images
  renderImages(d.images || []);
  // Populate features
  renderStringList('featuresList', d.features || [], '特点');
  // Populate specs
  renderSpecs(d.specs || []);
  // Populate customization
  renderStringList('customList', d.customization || [], '选项');

  // Image upload
  document.getElementById('uploadArea').onclick = () => document.getElementById('fileInput').click();
  document.getElementById('fileInput').onchange = uploadImage;

  // Track changes for dirty flag
  panel.querySelectorAll('input,textarea,select').forEach(el => {
    el.addEventListener('change', () => markDirty());
    el.addEventListener('input', () => markDirty());
  });
}

function renderImages(images) {
  const grid = document.getElementById('imageGrid');
  grid.innerHTML = (images||[]).map((img, i) => `
    <div class="image-card${i===0?' active':''}" onclick="selectCover(${i})">
      <img src="${img}" alt="">
      <div class="overlay"><button class="del" onclick="event.stopPropagation();removeImage(${i})">×</button></div>
    </div>
  `).join('');
}

function renderStringList(id, items, placeholder) {
  const el = document.getElementById(id);
  el.innerHTML = (items||[]).map((v, i) => `
    <div class="list-item">
      <textarea rows="1" oninput="autoResize(this);markDirty()" placeholder="${placeholder} ${i+1}">${esc(v)}</textarea>
      <button class="remove-btn" onclick="this.parentElement.remove();markDirty()">×</button>
    </div>
  `).join('') + `<button class="btn btn-secondary btn-sm add-btn" onclick="addStringItem('${id}','${placeholder}')">+ 添加</button>`;
}

function renderSpecs(specs) {
  const el = document.getElementById('specsList');
  el.innerHTML = (specs||[]).map((s, i) => `
    <div class="list-item">
      <input placeholder="参数名" value="${esc(s.label||'')}" oninput="markDirty()">
      <input placeholder="参数值" value="${esc(s.value||'')}" oninput="markDirty()">
      <button class="remove-btn" onclick="this.parentElement.remove();markDirty()">×</button>
    </div>
  `).join('') + `<button class="btn btn-secondary btn-sm add-btn" onclick="addSpecItem()">+ 添加</button>`;
}

function addStringItem(id, placeholder) {
  const el = document.getElementById(id);
  const addBtn = el.querySelector('.add-btn');
  const item = document.createElement('div'); item.className = 'list-item';
  item.innerHTML = `<textarea rows="1" oninput="autoResize(this);markDirty()" placeholder="${placeholder}"></textarea><button class="remove-btn" onclick="this.parentElement.remove();markDirty()">×</button>`;
  el.insertBefore(item, addBtn);
  markDirty();
}

function addSpecItem() {
  const el = document.getElementById('specsList');
  const addBtn = el.querySelector('.add-btn');
  const item = document.createElement('div'); item.className = 'list-item';
  item.innerHTML = `<input placeholder="参数名" oninput="markDirty()"><input placeholder="参数值" oninput="markDirty()"><button class="remove-btn" onclick="this.parentElement.remove();markDirty()">×</button>`;
  el.insertBefore(item, addBtn);
  markDirty();
}

function selectCover(idx) {
  document.querySelectorAll('.image-card').forEach((c, i) => c.classList.toggle('active', i === idx));
  // Update the data
}

async function removeImage(idx) {
  const data = getFormData();
  data.images.splice(idx, 1);
  renderImages(data.images);
  markDirty();
}

async function uploadImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const status = document.getElementById('saveStatus');
  status.textContent = '上传中...'; status.className = 'save-status';
  const form = new FormData();
  form.append('file', file);
  form.append('name', file.name);
  try {
    const res = await fetch('/api/data/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (data.url) {
      const images = getFormData().images || [];
      images.push(data.url);
      renderImages(images);
      markDirty();
      status.textContent = '图片已上传'; status.className = 'save-status success';
    } else {
      status.textContent = '上传失败: ' + (data.error || ''); status.className = 'save-status error';
    }
  } catch (e) {
    status.textContent = '上传失败'; status.className = 'save-status error';
  }
}

// ── Collect form data ──
function getFormData() {
  const data = {};
  const g = id => document.getElementById(id);
  data.id = g('f_id')?.value || '';
  data.title = g('f_title')?.value || '';
  data.subtitle = g('f_subtitle')?.value || '';
  data.description = g('f_description')?.value || '';
  data.category = g('f_category')?.value || '';
  data.template = g('f_template')?.value || 'image-only';
  data.moq = g('f_moq')?.value || '';
  data.priceRange = g('f_priceRange')?.value || '';
  data.order = parseInt(g('f_order')?.value) || 0;
  data.published = g('f_published')?.checked ?? true;

  data.images = [];
  document.querySelectorAll('.image-card img').forEach(img => data.images.push(img.src));

  data.features = [];
  document.querySelectorAll('#featuresList textarea').forEach(t => { const v = t.value.trim(); if (v) data.features.push(v); });

  data.specs = [];
  const specInputs = document.querySelectorAll('#specsList .list-item');
  specInputs.forEach(item => {
    const inputs = item.querySelectorAll('input');
    if (inputs.length >= 2) {
      const label = inputs[0].value.trim(); const value = inputs[1].value.trim();
      if (label && value) data.specs.push({ label, value });
    }
  });

  data.customization = [];
  document.querySelectorAll('#customList textarea').forEach(t => { const v = t.value.trim(); if (v) data.customization.push(v); });

  return data;
}

// ── Build frontmatter via js-yaml ──
function buildFrontmatter(data) {
  // Fields in desired order
  const clean = {};
  const order = ['id','title','subtitle','description','category','template','features','specs','materials','customization','images','coverImage','moq','priceRange','order','published'];
  order.forEach(key => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '' && !(Array.isArray(data[key]) && data[key].length === 0)) {
      clean[key] = data[key];
    }
  });
  const yaml = jsyaml.dump(clean, { lineWidth: -1, quotingType: "'", forceQuotes: true });
  return `---\n${yaml}---\n`;
}

// ── Save ──
document.getElementById('saveBtn').onclick = async () => {
  const btn = document.getElementById('saveBtn');
  const status = document.getElementById('saveStatus');
  btn.disabled = true; status.textContent = '保存中...'; status.className = 'save-status';

  const data = getFormData();
  data.coverImage = data.images?.[0] || '';
  const content = buildFrontmatter(data);

  try {
    const res = await fetch(`/api/data?path=${currentFile.path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const result = await res.json();
    if (result.ok) {
      status.textContent = '✅ 已保存，正在重新部署...'; status.className = 'save-status success';
      currentDirty = false;
    } else {
      status.textContent = '❌ ' + (result.error || '保存失败'); status.className = 'save-status error';
    }
  } catch (e) {
    status.textContent = '❌ 保存失败'; status.className = 'save-status error';
  }
  btn.disabled = false;
};

function markDirty() { currentDirty = true; }

function autoResize(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
