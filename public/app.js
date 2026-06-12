// ------------------------------------------------------------------
// Taskly UI controller — vanilla JS, no build step.
// All requests are wired through the live feed on the right rail.
// ------------------------------------------------------------------

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  page: 1,
  limit: 10,
  status: '',
  feed: [],
  feedPaused: false,
  feedSeq: 0,
  selectedFeedId: null,
};

// ---------- request feed ---------------------------------------------------

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(d = new Date()) {
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function statusBucket(status) {
  if (status >= 500) return 's5';
  if (status >= 400) return 's4';
  if (status >= 300) return 's3';
  return 's2';
}

function syntaxJson(obj) {
  if (obj === null || obj === undefined) return '<span class="json-null">// no body</span>';
  let json;
  try { json = JSON.stringify(obj, null, 2); } catch { return String(obj); }
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="json-key">$1</span><span class="json-punct">$2</span>')
    .replace(/(:\s*)("(?:[^"\\]|\\.)*")/g, '$1<span class="json-string">$2</span>')
    .replace(/(:\s*)(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, '$1<span class="json-number">$2</span>')
    .replace(/(:\s*)(true|false)/g, '$1<span class="json-bool">$2</span>')
    .replace(/(:\s*)(null)/g, '$1<span class="json-null">$2</span>')
    .replace(/([\[\]\{\},])/g, '<span class="json-punct">$1</span>');
}

function renderFeed() {
  const ul = $('#feed');
  if (!state.feed.length) {
    ul.innerHTML = '<li class="feed-empty">awaiting first request…</li>';
    return;
  }
  ul.innerHTML = '';
  for (const entry of state.feed) {
    const li = document.createElement('li');
    li.className = 'feed-item' + (entry.entering ? ' entering' : '') + (entry.id === state.selectedFeedId ? ' selected' : '');
    li.dataset.id = entry.id;
    const bucket = statusBucket(entry.status);
    li.innerHTML = `
      <span class="feed-time">${entry.time}</span>
      <span class="feed-method ${entry.method}">${entry.method}</span>
      <span class="feed-path" title="${entry.path}">${entry.path}</span>
      <span class="feed-status ${bucket}">${entry.status}</span>
    `;
    li.addEventListener('click', () => selectFeed(entry.id));
    ul.appendChild(li);
    // clear "entering" flag after animation so re-renders don't re-trigger
    if (entry.entering) requestAnimationFrame(() => requestAnimationFrame(() => { entry.entering = false; }));
  }
}

function selectFeed(id) {
  const entry = state.feed.find((e) => e.id === id);
  if (!entry) return;
  state.selectedFeedId = id;
  $('#response-meta').textContent = `${entry.method} ${entry.path} · ${entry.status} · ${entry.duration}ms`;
  $('#response-body').innerHTML = syntaxJson(entry.body);
  renderFeed();
}

function pushFeed(entry) {
  if (state.feedPaused) return;
  entry.id = ++state.feedSeq;
  entry.entering = true;
  state.feed.unshift(entry);
  if (state.feed.length > 50) state.feed.length = 50;
  // auto-select if nothing selected, or always select to keep response live
  state.selectedFeedId = entry.id;
  $('#response-meta').textContent = `${entry.method} ${entry.path} · ${entry.status} · ${entry.duration}ms`;
  $('#response-body').innerHTML = syntaxJson(entry.body);
  renderFeed();
}

// ---------- API helper ------------------------------------------------------

async function api(method, path, body) {
  const t0 = performance.now();
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  let res, data = null, error = null;
  try {
    res = await fetch(path, opts);
    if (res.status !== 204) {
      const text = await res.text();
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    }
  } catch (e) {
    error = e;
    res = { status: 0 };
  }
  const duration = Math.max(1, Math.round(performance.now() - t0));
  pushFeed({
    time: fmtTime(),
    method, path,
    status: res.status,
    duration,
    body: error ? { error: String(error) } : data,
  });
  if (res.status >= 400 || error) {
    const errText = (data && data.error) || (error && error.message) || `${res.status}`;
    $('#sb-last-error').textContent = errText.slice(0, 60);
  }
  return { status: res.status, data };
}

// ---------- task rendering --------------------------------------------------

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function loadTasks() {
  // Server-side filtering: pass ?status= through to the API (added in #16).
  const params = new URLSearchParams({ page: state.page, limit: state.limit });
  if (state.status) params.set('status', state.status);
  const { data } = await api('GET', `/tasks?${params}`);
  const ul = $('#task-list');
  ul.innerHTML = '';
  if (!data || !Array.isArray(data.tasks)) {
    ul.innerHTML = '<li class="empty">No tasks. The list is patient.</li>';
    $('#page-total').textContent = '—';
    return;
  }
  const visible = data.tasks;
  const pageTotal = Math.max(1, Math.ceil((data.total || 0) / state.limit));
  $('#page-total').textContent = pageTotal;

  if (!visible.length) {
    ul.innerHTML = `<li class="empty">${state.status ? `No ${state.status} tasks.` : 'No tasks on this page.'}</li>`;
    return;
  }

  for (const task of visible) {
    const li = document.createElement('li');
    li.className = 'task-row';
    const tags = (task.tags || []).map((t) => `<span class="chip">${t}</span>`).join('');
    li.innerHTML = `
      <span class="task-id">${task.id}</span>
      <span class="task-title">
        ${escapeHtml(task.title)}
        ${task.description ? `<span class="task-desc">${escapeHtml(task.description)}</span>` : ''}
        ${tags ? `<span class="row-tags">${tags}</span>` : ''}
      </span>
      <span class="task-meta"><span class="status ${task.status}">${task.status.replace('_', ' ')}</span></span>
      <span class="task-meta"><span class="prio ${task.priority}">${task.priority}</span></span>
      <span class="task-meta">${task.assigneeId ? `<span class="assignee">${task.assigneeId}</span>` : '—'}</span>
      <span class="row-actions">
        <button data-id="${task.id}" data-action="cycle" title="cycle status">↻</button>
        <button data-id="${task.id}" data-action="delete" title="delete">×</button>
      </span>
    `;
    ul.appendChild(li);
  }
}

// task row actions
async function cycleStatus(id) {
  const { data: task } = await api('GET', `/tasks/${id}`);
  if (!task) return;
  const order = ['todo', 'in_progress', 'done'];
  const next = order[(order.indexOf(task.status) + 1) % order.length];
  await api('PATCH', `/tasks/${id}`, { status: next });
  await loadTasks();
  flashRow(id);
}

async function deleteTask(id) {
  await api('DELETE', `/tasks/${id}`);
  await loadTasks();
}

function flashRow(id) {
  const row = $$('#task-list .task-row').find((el) => el.querySelector('.task-id')?.textContent === String(id));
  if (!row) return;
  row.classList.remove('flash');
  // force reflow
  void row.offsetWidth;
  row.classList.add('flash');
}

// ---------- users -----------------------------------------------------------

async function loadUsers() {
  const { data } = await api('GET', '/users');
  const ul = $('#user-list');
  ul.innerHTML = '';
  // accept both { users, ... } and bare array
  const users = Array.isArray(data) ? data : (data && data.users) || [];
  if (!users.length) {
    ul.innerHTML = '<li class="empty">No users yet.</li>';
    return;
  }
  for (const u of users) {
    const li = document.createElement('li');
    li.className = 'user-row';
    li.innerHTML = `
      <span class="task-id">${u.id}</span>
      <span class="user-name">${escapeHtml(u.name)}</span>
      <span class="user-email">${escapeHtml(u.email)}</span>
    `;
    ul.appendChild(li);
  }
}

// ---------- tags ------------------------------------------------------------

async function loadTags() {
  const { data } = await api('GET', '/tags');
  const ul = $('#tag-list');
  ul.innerHTML = '';
  const tags = Array.isArray(data) ? data : (data && data.tags) || [];
  if (!tags.length) {
    ul.innerHTML = '<li class="empty">No tags. Make one.</li>';
    return;
  }
  for (const t of tags) {
    const li = document.createElement('li');
    li.className = 'tag-row';
    li.textContent = t.name;
    li.title = `id: ${t.id}`;
    ul.appendChild(li);
  }
}

// ---------- form helpers ----------------------------------------------------

function formToJson(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    const v = el.value;
    if (v === '' || v == null) continue;
    out[el.name] = el.type === 'number' ? Number(v) : v;
  }
  return out;
}

function bindToggle(buttonId, formId, cancelId) {
  const form = $(formId);
  $(buttonId).addEventListener('click', () => {
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) form.elements[0]?.focus();
  });
  if (cancelId) $(cancelId).addEventListener('click', () => form.classList.add('hidden'));
}

// ---------- wiring ----------------------------------------------------------

bindToggle('#open-create-task', '#create-task-form', '#cancel-create-task');
bindToggle('#open-create-user', '#create-user-form', '#cancel-create-user');
bindToggle('#open-create-tag',  '#create-tag-form',  '#cancel-create-tag');

$('#create-task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = formToJson(e.target);
  const { status } = await api('POST', '/tasks', body);
  if (status === 201) {
    e.target.reset();
    e.target.classList.add('hidden');
    await loadTasks();
  }
});

$('#create-user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { status } = await api('POST', '/users', formToJson(e.target));
  if (status === 201) {
    e.target.reset();
    e.target.classList.add('hidden');
    await loadUsers();
  }
});

$('#create-tag-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { status } = await api('POST', '/tags', formToJson(e.target));
  if (status === 201) {
    e.target.reset();
    e.target.classList.add('hidden');
    await loadTags();
  }
});

// task row actions (event delegation)
$('#task-list').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === 'cycle')  cycleStatus(id);
  if (btn.dataset.action === 'delete') deleteTask(id);
});

// pagination
$('#prev-page').addEventListener('click', () => {
  if (state.page > 1) { state.page--; $('#page-input').value = state.page; loadTasks(); }
});
$('#next-page').addEventListener('click', () => {
  state.page++; $('#page-input').value = state.page; loadTasks();
});
$('#page-input').addEventListener('change', (e) => {
  state.page = Math.max(1, Number(e.target.value) || 1);
  loadTasks();
});
$('#limit-input').addEventListener('change', (e) => {
  state.limit = Math.max(1, Number(e.target.value) || 10);
  loadTasks();
});

// status filter
$('#filter-status').addEventListener('change', (e) => {
  state.status = e.target.value;
  state.page = 1;
  $('#page-input').value = 1;
  loadTasks();
});

// refresh buttons (none anymore — refresh comes from actions)

// feed pause/resume
$('#toggle-feed').addEventListener('click', () => {
  state.feedPaused = !state.feedPaused;
  $('#feed-state').textContent = state.feedPaused ? '▶ resume' : '▮▮ pause';
});

// connection check
async function checkConnection() {
  const t0 = performance.now();
  const { status } = await api('GET', '/health');
  const ok = status === 200;
  const pulse = $('#conn-pulse');
  const label = $('#conn-status');
  label.classList.toggle('connected', ok);
  label.classList.toggle('error', !ok);
  label.textContent = ok ? 'connected' : 'offline';
  if (ok) pulse.style.background = 'var(--ok)';
}

// utc clock
function tickClock() {
  $('#utc-clock').textContent = fmtTime();
}
setInterval(tickClock, 1000);
tickClock();

// ---------- boot -----------------------------------------------------------
// Stagger the initial loads so the feed cascades visibly. Pure showmanship
// for the demo recording — three quick request bursts the viewer can watch.

(async function boot() {
  $('#feed').innerHTML = '<li class="feed-empty">awaiting first request…</li>';
  await checkConnection();
  await new Promise((r) => setTimeout(r, 220));
  await loadTasks();
  await new Promise((r) => setTimeout(r, 120));
  await loadUsers();
  await new Promise((r) => setTimeout(r, 120));
  await loadTags();
})();
