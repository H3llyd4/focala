const AULAS_STORAGE_KEY = 'focala_aulas';
const AULAS_WEEK_RESET_KEY = 'focala_aulas_last_reset_week';

const DEFAULT_AULAS = [
  { id: 1, materia: 'História', professor: 'Ana', horario: 'Ter - 08:00', status: 'Em Andamento' },
  { id: 2, materia: 'Matemática', professor: 'Carlos', horario: 'Seg/Qua - 10:00', status: 'Pendente' },
  { id: 3, materia: 'Biologia', professor: 'Mariana', horario: 'Qui - 14:00', status: 'Concluída' },
  { id: 4, materia: 'Química', professor: 'Rafael', horario: 'Sex - 09:30', status: 'Em Andamento' }
];

function getCurrentWeekId() {
  const now = new Date();
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = Math.floor((now - firstDayOfYear) / 86400000);
  const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function normalizeStatus(status) {
  const s = (status || '').toLowerCase();
  if (s === 'concluída' || s === 'concluida') return 'Concluída';
  if (s === 'em andamento') return 'Em Andamento';
  return 'Pendente';
}

function getStoredAulas() {
  const raw = localStorage.getItem(AULAS_STORAGE_KEY);
  if (!raw) return [...DEFAULT_AULAS];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...DEFAULT_AULAS];
  } catch (_) {
    return [...DEFAULT_AULAS];
  }
}

function saveAulas(aulas) {
  localStorage.setItem(AULAS_STORAGE_KEY, JSON.stringify(aulas));
}

function resetStatusesIfWeekChanged(aulas) {
  const currentWeekId = getCurrentWeekId();
  const savedWeekId = localStorage.getItem(AULAS_WEEK_RESET_KEY);

  if (savedWeekId === currentWeekId) return aulas;

  const updated = aulas.map((aula) => ({ ...aula, status: 'Pendente' }));
  saveAulas(updated);
  localStorage.setItem(AULAS_WEEK_RESET_KEY, currentWeekId);
  return updated;
}

function classeStatus(status) {
  const normalizado = (status || '').toLowerCase();
  if (normalizado === 'pendente') return 'status-pendente';
  if (normalizado === 'em andamento') return 'status-andamento';
  return 'status-concluida';
}

function renderAulas(lista) {
  const container = document.getElementById('aulas-lista');
  if (!container) return;

  container.innerHTML = '';

  if (!lista.length) {
    container.innerHTML = '<li class="aula-card"><h3>Nenhuma aula cadastrada</h3></li>';
    return;
  }

  lista.forEach((aula) => {
    const item = document.createElement('li');
    item.className = 'aula-card';

    item.innerHTML = `
      <h3>${aula.materia}</h3>
      <p class="aula-meta">
        <span class="label">Professor:</span>
        <span>Prof. ${aula.professor}</span>
      </p>
      <p class="aula-meta">
        <span class="label">Horário:</span>
        <span>${aula.horario}</span>
      </p>
      <span class="status ${classeStatus(aula.status)}">${aula.status}</span>
      <div class="aula-actions">
        <button type="button" class="btn-concluir" data-action="concluir" data-id="${aula.id}">
          ${normalizeStatus(aula.status) === 'Concluída' ? 'Reabrir' : 'Concluir'}
        </button>
        <button type="button" class="btn-excluir" data-action="excluir" data-id="${aula.id}">Excluir</button>
      </div>
    `;

    container.appendChild(item);
  });
}

function setupForm(aulas, onUpdate) {
  const form = document.getElementById('aula-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const materia = document.getElementById('aula-materia')?.value?.trim();
    const professor = document.getElementById('aula-professor')?.value?.trim();
    const horario = document.getElementById('aula-horario')?.value?.trim();
    const status = normalizeStatus(document.getElementById('aula-status')?.value);

    if (!materia || !professor || !horario) return;

    const newAula = {
      id: Date.now(),
      materia,
      professor,
      horario,
      status
    };

    aulas.unshift(newAula);
    saveAulas(aulas);
    onUpdate(aulas);
    form.reset();
  });
}

let aulas = getStoredAulas();
aulas = resetStatusesIfWeekChanged(aulas);
saveAulas(aulas);
renderAulas(aulas);
setupForm(aulas, renderAulas);

document.getElementById('aulas-lista')?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const id = Number(target.dataset.id);
  if (!action || !id) return;

  if (action === 'concluir') {
    aulas = aulas.map((aula) => {
      if (aula.id !== id) return aula;
      const proximoStatus = normalizeStatus(aula.status) === 'Concluída' ? 'Pendente' : 'Concluída';
      return { ...aula, status: proximoStatus };
    });
    saveAulas(aulas);
    renderAulas(aulas);
    return;
  }

  if (action === 'excluir') {
    aulas = aulas.filter((aula) => aula.id !== id);
    saveAulas(aulas);
    renderAulas(aulas);
  }
});
