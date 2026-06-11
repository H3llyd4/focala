const HOME_PROGRESS_STORAGE_KEY = 'focala_tasks';

function getHomeTasks() {
  const raw = localStorage.getItem(HOME_PROGRESS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

function getTodayCompletedCount(tasks) {
  const today = new Date().toISOString().slice(0, 10);
  return tasks.filter((task) => task.completed && task.date === today).length;
}

function getEncouragementMessage(count) {
  if (count === 0) return 'Comece com uma tarefa pequena e ganhe ritmo.';
  if (count === 1) return 'Ótimo começo! Você já conquistou sua primeira meta de hoje.';
  if (count <= 3) return 'Excelente progresso! Continue nesse ritmo tranquilo.';
  return 'Incrível! Seu foco de hoje está fazendo a diferença.';
}

function renderTodaysWinsWidget() {
  const statEl = document.getElementById('todays-wins-stat');
  const messageEl = document.getElementById('todays-wins-message');

  if (!statEl || !messageEl) return;

  const tasks = getHomeTasks();
  const completedToday = getTodayCompletedCount(tasks);

  statEl.textContent = `${completedToday} ${completedToday === 1 ? 'Tarefas Concluídas' : 'Tarefas Concluídas'}`;
  messageEl.textContent = getEncouragementMessage(completedToday);
}

renderTodaysWinsWidget();
