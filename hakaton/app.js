import { supabase } from './supabase_config.js';

const state = {
  module: 'dashboard',
  pending: [],
  done: [],
  editingId: null,
};

const elements = {
  appShell: document.getElementById('appShell'),
  menuToggle: document.getElementById('menuToggle'),
  sidebarBackdrop: document.getElementById('sidebarBackdrop'),
  navLinks: document.querySelectorAll('.nav-link'),
  dashboardView: document.getElementById('dashboardView'),
  activitiesView: document.getElementById('activitiesView'),
  historicoView: document.getElementById('historicoView'),
  dashboardTotal: document.getElementById('dashboardTotal'),
  dashboardPending: document.getElementById('dashboardPending'),
  dashboardDone: document.getElementById('dashboardDone'),
  activitiesList: document.getElementById('activitiesList'),
  historicoList: document.getElementById('historicoList'),
  historicoSearch: document.getElementById('historicoSearch'),
  historicoDate: document.getElementById('historicoDate'),
  modal: document.getElementById('activityModal'),
  modalTitle: document.getElementById('modalTitle'),
  openModalBtn: document.getElementById('openModalBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  form: document.getElementById('activityForm'),
  submitBtn: document.getElementById('submitBtn'),
};

ButterPop.configure({
  position: 'top-right',
  theme: 'glassmorphism',
  duration: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  maxVisible: 3,
});

function showToast(message, type = 'success') {
  const options = {
    position: 'top-right',
    theme: 'glassmorphism',
    duration: 3000,
    pauseOnHover: true,
  };

  if (type === 'success') {
    return ButterPop.success(message, options);
  }

  if (type === 'error') {
    return ButterPop.error(message, options);
  }

  if (type === 'warning') {
    return ButterPop.warning(message, options);
  }

  return ButterPop.info(message, options);
}

function toggleSidebar(forceOpen) {
  if (typeof forceOpen === 'boolean') {
    elements.appShell.classList.toggle('sidebar-open', forceOpen);
    return;
  }

  elements.appShell.classList.toggle('sidebar-open');
}

function showModule(moduleName) {
  state.module = moduleName;

  elements.navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.module === moduleName);
  });

  const moduleMap = {
    dashboard: elements.dashboardView,
    activities: elements.activitiesView,
    historico: elements.historicoView,
  };

  Object.entries(moduleMap).forEach(([key, view]) => {
    view.classList.toggle('active', key === moduleName);
  });

  if (window.innerWidth <= 820) {
    toggleSidebar(false);
  }
}

function openModal() {
  elements.modal.classList.remove('hidden');
  elements.modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  elements.modal.classList.add('hidden');
  elements.modal.setAttribute('aria-hidden', 'true');
  state.editingId = null;
  elements.form.reset();
  elements.modalTitle.textContent = 'Nova atividade';
  elements.submitBtn.textContent = 'Salvar atividade';
}

function formatDate(value) {
  if (!value) {
    return 'Sem prazo';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Sem prazo';
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function buildStatusBadge(status) {
  const badge = document.createElement('span');
  badge.classList.add('meta-pill');

  if (status) {
    badge.classList.add('status-done');
    badge.textContent = 'Concluída';
  } else {
    badge.classList.add('status-pending');
    badge.textContent = 'Pendente';
  }

  return badge;
}

function createActivityCard(activity, options = {}) {
  const card = document.createElement('article');
  card.classList.add('activity-card');
  card.classList.add(activity.status ? 'done' : 'pending');

  const head = document.createElement('div');
  head.classList.add('activity-head');

  const info = document.createElement('div');
  const title = document.createElement('h3');
  title.classList.add('activity-title');
  title.textContent = activity.titulo;

  const meta = document.createElement('div');
  meta.classList.add('activity-meta');

  const discipline = document.createElement('span');
  discipline.classList.add('meta-pill');
  discipline.textContent = activity.disciplina;

  const dueDate = document.createElement('span');
  dueDate.classList.add('meta-pill');
  dueDate.textContent = `Prazo: ${formatDate(activity.prazo)}`;

  meta.appendChild(discipline);
  meta.appendChild(dueDate);

  info.appendChild(title);
  info.appendChild(meta);

  const statusBadge = buildStatusBadge(activity.status);
  head.appendChild(info);
  head.appendChild(statusBadge);

  const description = document.createElement('p');
  description.classList.add('activity-description');
  description.textContent = activity.descricao;

  const actions = document.createElement('div');
  actions.classList.add('activity-actions');

  const actionGroup = document.createElement('div');
  actionGroup.classList.add('action-group');

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.classList.add('action-btn');
  editButton.textContent = 'Editar';
  editButton.dataset.action = 'edit';
  editButton.dataset.id = activity.id;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.classList.add('action-btn', 'delete');
  deleteButton.textContent = 'Excluir';
  deleteButton.dataset.action = 'delete';
  deleteButton.dataset.id = activity.id;

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.classList.add('action-btn', 'toggle');
  toggleButton.textContent = activity.status ? 'Reabrir' : 'Concluir';
  toggleButton.dataset.action = 'toggle';
  toggleButton.dataset.id = activity.id;

  if (options.hideEdit) {
    editButton.style.display = 'none';
  }

  if (options.hideDelete) {
    deleteButton.style.display = 'none';
  }

  if (options.hideToggle) {
    toggleButton.style.display = 'none';
  }

  actionGroup.appendChild(editButton);
  actionGroup.appendChild(deleteButton);
  actionGroup.appendChild(toggleButton);

  actions.appendChild(actionGroup);
  card.appendChild(head);
  card.appendChild(description);
  card.appendChild(actions);

  return card;
}

function renderDashboard() {
  const pending = state.pending.length;
  const done = state.done.length;
  const total = pending;

  elements.dashboardTotal.textContent = String(total);
  elements.dashboardPending.textContent = String(pending);
  elements.dashboardDone.textContent = String(done);
}

function renderActivitiesList() {
  elements.activitiesList.replaceChildren();

  if (!state.pending.length) {
    const emptyState = document.createElement('div');
    emptyState.classList.add('empty-state');
    emptyState.textContent = 'Nenhuma atividade pendente no momento.';
    elements.activitiesList.appendChild(emptyState);
    return;
  }

  state.pending.forEach((activity) => {
    const card = createActivityCard(activity, {
      hideEdit: false,
      hideDelete: false,
      hideToggle: false,
    });
    elements.activitiesList.appendChild(card);
  });
}

function renderHistoricoList() {
  const query = elements.historicoSearch.value.trim().toLowerCase();
  const dateFilter = elements.historicoDate.value;

  const filtered = state.done.filter((activity) => {
    const matchesText = !query ||
      (activity.titulo && activity.titulo.toLowerCase().includes(query)) ||
      (activity.disciplina && activity.disciplina.toLowerCase().includes(query));

    const matchesDate = !dateFilter || activity.prazo === dateFilter;
    return matchesText && matchesDate;
  });

  elements.historicoList.replaceChildren();

  if (!filtered.length) {
    const emptyState = document.createElement('div');
    emptyState.classList.add('empty-state');
    emptyState.textContent = 'Nenhuma atividade concluída encontrada.';
    elements.historicoList.appendChild(emptyState);
    return;
  }

  filtered.forEach((activity) => {
    const card = createActivityCard(activity, {
      hideEdit: true,
      hideDelete: true,
      hideToggle: false,
    });

    const buttons = card.querySelectorAll('.action-btn');
    buttons.forEach((button) => {
      if (button.dataset.action === 'toggle') {
        button.textContent = 'Reabrir';
      }
    });

    elements.historicoList.appendChild(card);
  });
}

function validateForm(formData) {
  const titulo = formData.get('titulo')?.toString().trim() || '';
  const disciplina = formData.get('disciplina')?.toString().trim() || '';
  const descricao = formData.get('descricao')?.toString().trim() || '';
  const prazo = formData.get('prazo')?.toString() || '';

  if (!titulo || !disciplina || !descricao || !prazo) {
    return 'Preencha todos os campos antes de salvar.';
  }

  if (titulo.length > 100 || disciplina.length > 80 || descricao.length > 500) {
    return 'Algum campo excedeu o limite de caracteres permitido.';
  }

  return '';
}

function populateFormForEdit(activity) {
  document.getElementById('titulo').value = activity.titulo || '';
  document.getElementById('disciplina').value = activity.disciplina || '';
  document.getElementById('descricao').value = activity.descricao || '';
  document.getElementById('prazo').value = activity.prazo || '';

  state.editingId = activity.id;
  elements.modalTitle.textContent = 'Editar atividade';
  elements.submitBtn.textContent = 'Atualizar atividade';
  openModal();
}

async function loadActivitiesByStatus(status) {
  const { data, error } = await supabase
    .from('atividades')
    .select('*')
    .eq('status', status)
    .order('prazo', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

async function fetchAllActivities() {
  try {
    const [pending, done] = await Promise.all([
      loadActivitiesByStatus(false),
      loadActivitiesByStatus(true),
    ]);

    state.pending = pending;
    state.done = done;

    renderDashboard();
    renderActivitiesList();
    renderHistoricoList();
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    showToast('Não foi possível carregar as atividades.', 'error');
    state.pending = [];
    state.done = [];
    renderDashboard();
    renderActivitiesList();
    renderHistoricoList();
  }
}

async function saveActivity(event) {
  event.preventDefault();

  const formData = new FormData(elements.form);
  const validationMessage = validateForm(formData);

  if (validationMessage) {
    showToast(validationMessage, 'error');
    return;
  }

  const payload = {
    titulo: formData.get('titulo').toString().trim(),
    disciplina: formData.get('disciplina').toString().trim(),
    descricao: formData.get('descricao').toString().trim(),
    prazo: formData.get('prazo').toString(),
  };

  try {
    const isEditing = Boolean(state.editingId);

    if (isEditing) {
      const { error } = await supabase
        .from('atividades')
        .update(payload)
        .eq('id', state.editingId);

      if (error) {
        throw error;
      }

      showToast('Atividade atualizada com sucesso!');
    } else {
      const { error } = await supabase.from('atividades').insert(payload);

      if (error) {
        throw error;
      }

      showToast('Atividade cadastrada com sucesso!');
    }

    closeModal();
    await fetchAllActivities();
  } catch (error) {
    console.error('Erro ao salvar atividade:', error);
    showToast('Erro ao salvar atividade. Tente novamente.', 'error');
  }
}

async function confirmDeleteActivity(activityId) {
  try {
    const { error } = await supabase.from('atividades').delete().eq('id', activityId);

    if (error) {
      throw error;
    }

    showToast('Atividade excluída com sucesso!');
    await fetchAllActivities();
  } catch (error) {
    console.error('Erro ao excluir atividade:', error);
    showToast('Erro ao excluir atividade. Tente novamente.', 'error');
  }
}

function deleteActivity(activityId) {
  ButterPop.show({
    message: 'Deseja realmente excluir esta atividade?',
    type: 'warning',
    position: 'center',
    duration: 0,
    theme: 'material',
    closable: false,
    icon: '⚠️',
    actions: [
      {
        text: 'Confirmar',
        callback: async (toast) => {
          ButterPop.remove(toast.id);
          await confirmDeleteActivity(activityId);
        },
      },
      {
        text: 'Cancelar',
        callback: (toast) => ButterPop.remove(toast.id),
      },
    ],
  });
}

async function updateStatus(activityId, nextStatus) {
  try {
    const { error } = await supabase
      .from('atividades')
      .update({ status: nextStatus })
      .eq('id', activityId);

    if (error) {
      throw error;
    }

    const message = nextStatus ? 'Atividade movida para o histórico.' : 'Atividade reaberta com sucesso!';
    showToast(message);
    await fetchAllActivities();
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    showToast('Não foi possível atualizar a atividade.', 'error');
  }
}

async function handleActivityAction(event) {
  const button = event.target.closest('button');

  if (!button) {
    return;
  }

  const { action, id } = button.dataset;

  if (!action || !id) {
    return;
  }

  if (action === 'delete') {
    deleteActivity(id);
    return;
  }

  if (action === 'toggle') {
    const card = button.closest('.activity-card');
    const nextStatus = card && card.classList.contains('done') ? false : true;
    await updateStatus(id, nextStatus);
    return;
  }

  if (action === 'edit') {
    try {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      populateFormForEdit(data);
    } catch (error) {
      console.error('Erro ao carregar atividade para edição:', error);
      showToast('Não foi possível abrir a atividade para edição.', 'error');
    }
  }
}

function bindEvents() {
  elements.navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      showModule(link.dataset.module);
    });
  });

  elements.menuToggle.addEventListener('click', () => {
    toggleSidebar();
  });

  elements.sidebarBackdrop.addEventListener('click', () => {
    toggleSidebar(false);
  });

  elements.openModalBtn.addEventListener('click', () => {
    state.editingId = null;
    elements.form.reset();
    elements.modalTitle.textContent = 'Nova atividade';
    elements.submitBtn.textContent = 'Salvar atividade';
    openModal();
  });

  elements.closeModalBtn.addEventListener('click', closeModal);
  elements.cancelBtn.addEventListener('click', closeModal);

  elements.modal.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.close === 'true') {
      closeModal();
    }
  });

  elements.form.addEventListener('submit', saveActivity);
  elements.activitiesList.addEventListener('click', handleActivityAction);
  elements.historicoList.addEventListener('click', handleActivityAction);

  elements.historicoSearch.addEventListener('input', renderHistoricoList);
  elements.historicoDate.addEventListener('input', renderHistoricoList);
}

async function init() {
  bindEvents();
  showModule('dashboard');
  await fetchAllActivities();
}

init();
