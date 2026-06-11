const HOME_AULAS_KEY = 'focala_aulas';

function getAulasForWidget() {
  const raw = localStorage.getItem(HOME_AULAS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function normalizeStatus(status) {
  const value = (status || '').toLowerCase();
  if (value === 'concluída' || value === 'concluida') return 'concluida';
  if (value === 'em andamento') return 'andamento';
  return 'pendente';
}

function statusClass(status) {
  const normalized = normalizeStatus(status);
  if (normalized === 'concluida') return 'status-concluida';
  if (normalized === 'andamento') return 'status-andamento';
  return 'status-pendente';
}

function renderAulasWidget() {
  const listEl = document.getElementById('home-aulas-list');
  const countEl = document.getElementById('home-aulas-count');

  if (!listEl || !countEl) return;

  const aulas = getAulasForWidget();
  const pendentes = aulas.filter((aula) => normalizeStatus(aula.status) === 'pendente');
  const upcoming = pendentes.slice(0, 3);

  listEl.innerHTML = '';

  if (!aulas.length) {
    countEl.textContent = 'Nenhuma aula cadastrada';
    listEl.innerHTML = '<li class="task-empty">Nenhuma aula cadastrada.</li>';
    return;
  }

  countEl.textContent = `${pendentes.length} aulas pendentes`;

  if (!upcoming.length) {
    listEl.innerHTML = '<li class="task-empty">Nenhuma aula pendente no momento.</li>';
    return;
  }

  upcoming.forEach((aula) => {
    const li = document.createElement('li');
    li.className = 'task-card compact';

    li.innerHTML = `
      <div class="task-main">
        <h3>${aula.materia}</h3>
        <p class="task-date">Prof. ${aula.professor} • ${aula.horario}</p>
      </div>
      <span class="tag ${statusClass(aula.status)}">${aula.status}</span>
    `;

    listEl.appendChild(li);
  });
}

renderAulasWidget();
