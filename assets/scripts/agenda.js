const STORAGE_KEY = 'focala_tasks';

function getTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function sortByDate(tasks) {
  return [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));
}

function createCategoryClass(category) {
  const normalized = category.toLowerCase();
  if (normalized === 'prova') return 'tag-prova';
  if (normalized === 'trabalho') return 'tag-trabalho';
  return 'tag-estudo';
}

function renderTasks() {
  const list = document.getElementById('task-list');
  const tasks = sortByDate(getTasks());

  list.innerHTML = '';

  if (tasks.length === 0) {
    list.innerHTML = `
      <li class="task-empty">
        Nenhuma tarefa cadastrada ainda. Adicione a primeira tarefa para começar.
      </li>
    `;
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = `task-card ${task.completed ? 'is-completed' : ''}`;

    const dateFormatted = new Date(`${task.date}T00:00:00`).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    item.innerHTML = `
      <div class="task-main">
        <h3>${task.title}</h3>
        <p class="task-date">${dateFormatted}</p>
        <span class="task-tag ${createCategoryClass(task.category)}">${task.category}</span>
      </div>
      <div class="task-actions">
        <button class="btn-soft btn-toggle" data-id="${task.id}">
          ${task.completed ? 'Reabrir' : 'Concluir'}
        </button>
        <button class="btn-danger btn-delete" data-id="${task.id}">Excluir</button>
      </div>
    `;

    list.appendChild(item);
  });
}

function addTask(event) {
  event.preventDefault();

  const titleInput = document.getElementById('task-title');
  const dateInput = document.getElementById('task-date');
  const categoryInput = document.getElementById('task-category');

  const newTask = {
    id: Date.now(),
    title: titleInput.value.trim(),
    date: dateInput.value,
    category: categoryInput.value,
    completed: false
  };

  if (!newTask.title || !newTask.date) return;

  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);

  event.target.reset();
  renderTasks();
}

function toggleTask(id) {
  const tasks = getTasks().map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  const tasks = getTasks().filter((task) => task.id !== id);
  saveTasks(tasks);
  renderTasks();
}

function handleTaskActions(event) {
  const toggleButton = event.target.closest('.btn-toggle');
  const deleteButton = event.target.closest('.btn-delete');

  if (toggleButton) {
    toggleTask(Number(toggleButton.dataset.id));
  }

  if (deleteButton) {
    deleteTask(Number(deleteButton.dataset.id));
  }
}

function initAgenda() {
  const form = document.getElementById('task-form');
  const list = document.getElementById('task-list');

  form.addEventListener('submit', addTask);
  list.addEventListener('click', handleTaskActions);

  renderTasks();
}

initAgenda();
