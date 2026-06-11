const HOME_STORAGE_KEY = 'focala_tasks';

function readTasks() {
  const raw = localStorage.getItem(HOME_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

function getUpcomingTasks(limit = 3) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return readTasks()
    .filter((task) => !task.completed && new Date(`${task.date}T00:00:00`) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, limit);
}

function categoryBadgeClass(category) {
  const normalized = category.toLowerCase();
  if (normalized === 'prova') return 'tag-prova';
  if (normalized === 'trabalho') return 'tag-trabalho';
  return 'tag-estudo';
}

function renderHomeAgendaWidget() {
  const list = document.getElementById('upcoming-task-list');
  if (!list) return;

  const tasks = getUpcomingTasks(3);
  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = `
      <li class="task-empty">
        Sem tarefas urgentes no momento. Ótimo trabalho!
      </li>
    `;
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task-card compact';

    const dateFormatted = new Date(`${task.date}T00:00:00`).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });

    item.innerHTML = `
      <div class="task-main">
        <h3>${task.title}</h3>
        <p class="task-date">${dateFormatted}</p>
        <span class="task-tag ${categoryBadgeClass(task.category)}">${task.category}</span>
      </div>
    `;

    list.appendChild(item);
  });
}

renderHomeAgendaWidget();
