const $ = (sel) => document.querySelector(sel);

async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  let data = null;
  if (res.status !== 204) {
    try { data = await res.json(); } catch { data = null; }
  }
  showResponse(method, path, res.status, data);
  return { status: res.status, data };
}

function showResponse(method, path, status, data) {
  const badge = $('#last-status');
  badge.textContent = `${method} ${path} → ${status}`;
  badge.className = 'status-badge status-' + Math.floor(status / 100) + 'xx';
  $('#last-response').textContent = data === null ? '(no body)' : JSON.stringify(data, null, 2);
}

async function loadTasks() {
  const page = $('#page-input').value;
  const limit = $('#limit-input').value;
  const { data } = await api('GET', `/tasks?page=${page}&limit=${limit}`);
  const tbody = $('#tasks-table tbody');
  tbody.innerHTML = '';
  if (!data || !Array.isArray(data.tasks)) return;
  for (const task of data.tasks) {
    const tr = document.createElement('tr');
    const tagsHtml = (task.tags || []).map((t) => `<span class="tag-chip">#${t}</span>`).join('');
    tr.innerHTML = `
      <td>${task.id}</td>
      <td>${task.title}</td>
      <td>${task.status}</td>
      <td>${task.priority}</td>
      <td>${task.assigneeId ?? '—'}</td>
      <td>${tagsHtml || '—'}</td>
      <td><button class="btn-danger" data-id="${task.id}">Delete</button></td>
    `;
    tr.querySelector('button').addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      await api('DELETE', `/tasks/${id}`);
      loadTasks();
    });
    tbody.appendChild(tr);
  }
}

async function loadUsers() {
  const { data } = await api('GET', '/users');
  const ul = $('#users-list');
  ul.innerHTML = '';
  // Handle both bare-array and { users, ... } shapes (auto-mode prompt may normalize this)
  const users = Array.isArray(data) ? data : (data && data.users) || [];
  for (const u of users) {
    const li = document.createElement('li');
    li.textContent = `#${u.id} — ${u.name} <${u.email}>`;
    ul.appendChild(li);
  }
}

async function loadTags() {
  const { data } = await api('GET', '/tags');
  const ul = $('#tags-list');
  ul.innerHTML = '';
  const tags = Array.isArray(data) ? data : (data && data.tags) || [];
  for (const t of tags) {
    const li = document.createElement('li');
    li.textContent = `#${t.id} — ${t.name}`;
    ul.appendChild(li);
  }
}

function formToJson(form) {
  const data = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    let v = el.value.trim();
    if (v === '') continue;
    if (el.type === 'number') v = Number(v);
    data[el.name] = v;
  }
  return data;
}

$('#refresh-tasks').addEventListener('click', loadTasks);
$('#refresh-users').addEventListener('click', loadUsers);
$('#refresh-tags').addEventListener('click', loadTags);

$('#prev-page').addEventListener('click', () => {
  const input = $('#page-input');
  if (Number(input.value) > 1) { input.value = Number(input.value) - 1; loadTasks(); }
});
$('#next-page').addEventListener('click', () => {
  const input = $('#page-input');
  input.value = Number(input.value) + 1;
  loadTasks();
});
$('#page-input').addEventListener('change', loadTasks);
$('#limit-input').addEventListener('change', loadTasks);

$('#create-task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('POST', '/tasks', formToJson(e.target));
  e.target.reset();
  loadTasks();
});

$('#create-user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('POST', '/users', formToJson(e.target));
  e.target.reset();
  loadUsers();
});

$('#create-tag-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('POST', '/tags', formToJson(e.target));
  e.target.reset();
  loadTags();
});

loadTasks();
loadUsers();
loadTags();
