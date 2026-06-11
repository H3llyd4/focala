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

function isDateInCurrentWeek(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const now = new Date();

  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}

function getProductiveDays(tasks) {
  const completedDates = tasks
    .filter((task) => task.completed && task.date)
    .map((task) => task.date);

  return new Set(completedDates).size;
}

function calculateProgressData(tasks) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const focusHours = completedTasks * 0.75;
  const productiveDays = getProductiveDays(tasks);

  const weeklyTasks = tasks.filter((task) => task.date && isDateInCurrentWeek(task.date));
  const weeklyCompleted = weeklyTasks.filter((task) => task.completed).length;
  const weeklyProgress = weeklyTasks.length === 0 ? 0 : Math.round((weeklyCompleted / weeklyTasks.length) * 100);

  return {
    completedTasks,
    focusHours,
    productiveDays,
    weeklyProgress
  };
}

function renderProgress() {
  const tasks = getStoredTasks();
  const data = calculateProgressData(tasks);

  const completedEl = document.getElementById('completed-tasks');
  const focusHoursEl = document.getElementById('focus-hours');
  const productiveDaysEl = document.getElementById('productive-days');
  const progressFillEl = document.getElementById('weekly-progress-fill');
  const progressTextEl = document.getElementById('weekly-progress-text');
  const progressTrackEl = document.querySelector('.progress-track');

  completedEl.textContent = String(data.completedTasks);
  focusHoursEl.textContent = `${data.focusHours.toFixed(1)}h`;
  productiveDaysEl.textContent = String(data.productiveDays);

  progressFillEl.style.width = `${data.weeklyProgress}%`;
  progressTextEl.textContent = `${data.weeklyProgress}% das tarefas da semana concluídas`;
  progressTrackEl.setAttribute('aria-valuenow', String(data.weeklyProgress));
}

renderProgress();
