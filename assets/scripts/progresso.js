const PROGRESS_STORAGE_KEY = 'focala_tasks';

function getStoredTasks() {
  const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

function parseTaskDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;

  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function getCurrentWeekRange() {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

function isDateInCurrentWeek(dateString) {
  const parsedDate = parseTaskDate(dateString);
  if (!parsedDate) return false;

  const { startOfWeek, endOfWeek } = getCurrentWeekRange();
  const timestamp = parsedDate.getTime();

  return timestamp >= startOfWeek.getTime() && timestamp <= endOfWeek.getTime();
}

function getProductiveDays(tasks) {
  const completedDates = tasks
    .filter((task) => task.completed && task.date)
    .map((task) => task.date);

  return new Set(completedDates).size;
}

function calculateProgressData(tasks) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.filter((task) => !task.completed).length;
  const productiveDays = getProductiveDays(tasks);

  const totalTasks = tasks.length;
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    completedTasks,
    pendingCount,
    productiveDays,
    overallProgress
  };
}

function sortByDate(tasks) {
  return [...tasks].sort((a, b) => {
    const dateA = parseTaskDate(a.date);
    const dateB = parseTaskDate(b.date);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    return dateA.getTime() - dateB.getTime();
  });
}

function renderPendingTasks(tasks) {
  const pendingListEl = document.getElementById('pending-tasks-list');
  if (!pendingListEl) return;

  const pendingTasks = sortByDate(tasks.filter((task) => !task.completed));
  pendingListEl.innerHTML = '';

  if (pendingTasks.length === 0) {
    pendingListEl.innerHTML = '<li class="pending-empty">Nenhuma atividade pendente no momento.</li>';
    return;
  }

  pendingTasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'pending-task-item';

    const dateFormatted = task.date
      ? new Date(`${task.date}T00:00:00`).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : 'Sem data';

    item.innerHTML = `
      <div class="pending-task-content">
        <h3>${task.title}</h3>
        <p>${dateFormatted}${task.category ? ` • ${task.category}` : ''}</p>
      </div>
    `;

    pendingListEl.appendChild(item);
  });
}

function renderProgress() {
  const tasks = getStoredTasks();
  const data = calculateProgressData(tasks);

  const completedEl = document.getElementById('completed-tasks');
  const pendingCountEl = document.getElementById('pending-count');
  const productiveDaysEl = document.getElementById('productive-days');
  const progressFillEl = document.getElementById('weekly-progress-fill');
  const progressTextEl = document.getElementById('weekly-progress-text');
  const progressTrackEl = document.querySelector('.progress-track');

  completedEl.textContent = String(data.completedTasks);
  pendingCountEl.textContent = String(data.pendingCount);
  productiveDaysEl.textContent = String(data.productiveDays);

  const safeOverallProgress = Math.max(0, Math.min(100, Number(data.overallProgress) || 0));

  if (progressFillEl) {
    progressFillEl.style.width = `${safeOverallProgress}%`;
  }

  if (progressTextEl) {
    progressTextEl.textContent = `${safeOverallProgress}% das atividades concluídas`;
  }

  if (progressTrackEl) {
    progressTrackEl.setAttribute('aria-valuenow', String(safeOverallProgress));
  }

  renderPendingTasks(tasks);
}

renderProgress();
