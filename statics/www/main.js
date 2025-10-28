import {
  computed,
  createApp,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

import HcButton from './ds/components/HcButton.js';
import HcCard from './ds/components/HcCard.js';
import HcInput from './ds/components/HcInput.js';
import HcSelect from './ds/components/HcSelect.js';

const localdev = window.location.hostname === 'localhost';

const baseUrls = {
  auth: localdev ? '/fakeapi/authapi' : '',
  projects: localdev ? '/fakeapi/projectsapi' : 'https://projects.hola.cloud',
  inception: localdev ? '/fakeapi/inceptionapi' : 'https://inceptiondb.hola.cloud',
  lambdas: localdev ? '/fakeapi/lambdasapi' : 'https://lambda.hola.cloud',
  config: 'https://config.hola.cloud',
  files: 'https://files.hola.cloud',
  logs: 'https://instantlogs.hola.cloud',
};

const requestHeaders = reactive(
  localdev ? { 'X-Glue-Authentication': JSON.stringify({ user: { id: 'user1' } }) } : {},
);

function defaultTabs(projectId) {
  const embedSuffix = projectId ? `?embed&project=${projectId}` : '';
  return [
    {
      key: 'database',
      name: 'Base de datos',
      icon: 'img/icon-db.png',
      url: projectId ? `${baseUrls.inception}/${embedSuffix}` : '',
      closable: false,
    },
    {
      key: 'lambda',
      name: 'Lambdas',
      icon: 'img/icon-lambda.png',
      url: projectId ? `${baseUrls.lambdas}/?embed&project=${projectId}` : '',
      closable: false,
    },
    {
      key: 'config',
      name: 'Config',
      icon: 'img/icon-config.png',
      url: projectId ? `${baseUrls.config}/?embed&project=${projectId}` : '',
      closable: false,
    },
    {
      key: 'files',
      name: 'Archivos',
      icon: 'img/icon-files.png',
      url: projectId ? `${baseUrls.files}/?embed&project=${projectId}` : '',
      closable: false,
    },
  ];
}

const App = defineComponent({
  name: 'HolaCloudConsole',
  components: { HcButton, HcCard, HcInput, HcSelect },
  setup() {
    const user = ref(null);
    const userLoading = ref(true);

    const projects = ref([]);
    const projectsLoading = ref(false);

    const storedProjectId = window.localStorage.getItem('holaCloud:lastProjectId');
    const selectedProjectId = ref(storedProjectId || null);

    const showCreateProject = ref(false);
    const newProjectName = ref('');
    const createProjectError = ref('');
    const creatingProject = ref(false);

    const tabs = ref(defaultTabs(selectedProjectId.value));
    const activeTabIndex = ref(0);

    const showLogsPanel = ref(false);

    const tree = reactive({
      databases: [],
      lambdas: [],
    });
    const databasesLoading = ref(false);
    const lambdasLoading = ref(false);

    const projectSelectOptions = computed(() =>
      projects.value.map((project) => ({
        value: project.id,
        label: project.name,
        meta: project.id,
      })),
    );

    const selectedProject = computed(() =>
      projects.value.find((project) => project.id === selectedProjectId.value) || null,
    );

    const hasProjects = computed(() => projects.value.length > 0);
    const projectSubtitle = computed(() =>
      selectedProject.value ? `ID · ${selectedProject.value.id}` : '',
    );
    const databaseCount = computed(() => tree.databases.length);
    const lambdaCount = computed(() => tree.lambdas.length);
    const logsUrl = computed(() =>
      selectedProjectId.value
        ? `${baseUrls.logs}/?embed&project=${selectedProjectId.value}`
        : '',
    );
    const resourceDescription = computed(() =>
      selectedProject.value
        ? 'Explora los recursos asociados a tu proyecto.'
        : 'Selecciona un proyecto para ver los recursos disponibles.',
    );
    const isTreeFetching = computed(() => databasesLoading.value || lambdasLoading.value);

    const activeTab = computed(() => tabs.value[activeTabIndex.value] || null);

    const isAuthenticated = computed(() => Boolean(user.value));

    const fetchJson = async (url, options = {}) => {
      try {
        const response = await fetch(url, {
          credentials: 'include',
          ...options,
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('Request error', error);
        throw error;
      }
    };

    const applyHeaders = (additional = {}) => ({
      ...requestHeaders,
      ...additional,
    });

    const loadUser = async () => {
      userLoading.value = true;
      try {
        const data = await fetchJson(`${baseUrls.auth}/auth/me`);
        if (data && !data.error) {
          user.value = data;
          if (localdev) {
            requestHeaders['X-Glue-Authentication'] = JSON.stringify({ user: data });
          }
        } else {
          user.value = null;
        }
      } catch (error) {
        user.value = null;
      } finally {
        userLoading.value = false;
      }
    };

    const loadProjects = async () => {
      projectsLoading.value = true;
      try {
        const data = await fetchJson(`${baseUrls.projects}/v0/projects`);
        if (Array.isArray(data)) {
          projects.value = data.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          projects.value = [];
        }
      } catch (error) {
        projects.value = [];
      } finally {
        projectsLoading.value = false;
      }
    };

    const refreshTabs = (projectId) => {
      tabs.value = defaultTabs(projectId);
      activeTabIndex.value = 0;
    };

    const ensureProjectSelection = () => {
      if (!projects.value.length) {
        selectedProjectId.value = null;
        return;
      }
      if (
        selectedProjectId.value &&
        !projects.value.some((project) => project.id === selectedProjectId.value)
      ) {
        selectedProjectId.value = projects.value[0].id;
        return;
      }
      if (!selectedProjectId.value) {
        selectedProjectId.value = projects.value[0].id;
      }
    };

    const fetchDatabases = async (projectId) => {
      if (!projectId) {
        tree.databases = [];
        return;
      }
      databasesLoading.value = true;
      try {
        const data = await fetchJson(`${baseUrls.inception}/v1/databases`, {
          headers: applyHeaders({ 'X-Project': projectId }),
        });
        tree.databases = data
          .map((database) => ({
            ...database,
            open: false,
            loading: false,
            loaded: false,
            collections: [],
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      } catch (error) {
        tree.databases = [];
      } finally {
        databasesLoading.value = false;
      }
    };

    const fetchLambdas = async (projectId) => {
      if (!projectId) {
        tree.lambdas = [];
        return;
      }
      lambdasLoading.value = true;
      try {
        const data = await fetchJson(`${baseUrls.lambdas}/api/v0/lambdas`, {
          headers: applyHeaders({ 'X-Project': projectId }),
        });
        tree.lambdas = data.sort((a, b) =>
          `${a.path} ${a.method}`.localeCompare(`${b.path} ${b.method}`),
        );
      } catch (error) {
        tree.lambdas = [];
      } finally {
        lambdasLoading.value = false;
      }
    };

    const fetchTree = async (projectId) => {
      if (!projectId) return;
      await Promise.all([fetchDatabases(projectId), fetchLambdas(projectId)]);
    };

    const toggleDatabase = async (database) => {
      database.open = !database.open;
      if (!database.open || database.loaded) return;
      database.loading = true;
      try {
        const data = await fetchJson(
          `${baseUrls.inception}/v1/databases/${database.id}/collections`,
          { headers: applyHeaders({ 'X-Project': selectedProjectId.value }) },
        );
        database.collections = data.sort((a, b) => a.name.localeCompare(b.name));
        database.loaded = true;
      } catch (error) {
        database.collections = [];
      } finally {
        database.loading = false;
      }
    };

    const openCollection = (database, collection) => {
      if (!selectedProjectId.value) return;
      const url = `${baseUrls.inception}/?embed&project=${selectedProjectId.value}#/databases/${database.id}/collections/${collection.name}`;
      const key = `collection-${database.id}-${collection.name}`;
      openTab({
        key,
        name: collection.name,
        icon: 'img/icon-db.png',
        url,
      });
    };

    const openLambda = (lambda) => {
      if (!selectedProjectId.value) return;
      const url = `${baseUrls.lambdas}/?embed&project=${selectedProjectId.value}#/lambdas/${lambda.id}`;
      const key = `lambda-${lambda.id}`;
      openTab({
        key,
        name: `${lambda.method} ${lambda.path}`,
        icon: 'img/icon-lambda.png',
        url,
      });
    };

    const toggleCreateProject = () => {
      showCreateProject.value = !showCreateProject.value;
    };

    const openTab = (tab) => {
      const existingIndex = tabs.value.findIndex((item) => item.key === tab.key);
      if (existingIndex >= 0) {
        tabs.value.splice(existingIndex, 1, { ...tabs.value[existingIndex], ...tab, closable: true });
        activeTabIndex.value = existingIndex;
        return;
      }
      tabs.value.push({ ...tab, closable: true });
      activeTabIndex.value = tabs.value.length - 1;
    };

    const closeTab = (index) => {
      const tab = tabs.value[index];
      if (!tab || !tab.closable) return;
      tabs.value.splice(index, 1);
      if (activeTabIndex.value >= tabs.value.length) {
        activeTabIndex.value = Math.max(0, tabs.value.length - 1);
      }
    };

    const selectTab = (index) => {
      if (index < 0 || index >= tabs.value.length) return;
      activeTabIndex.value = index;
    };

    const goToLogin = () => {
      window.location.href = 'https://hola.cloud/auth/login';
    };

    const goToLogout = () => {
      window.location.href = '/auth/logout';
    };

    const selectProject = (projectId) => {
      if (projectId === selectedProjectId.value) return;
      selectedProjectId.value = projectId;
    };

    const handleProjectSubmit = async () => {
      createProjectError.value = '';
      if (!newProjectName.value.trim()) {
        createProjectError.value = 'Indica un nombre para el proyecto.';
        return;
      }
      creatingProject.value = true;
      try {
        const payload = { name: newProjectName.value.trim() };
        const data = await fetchJson(`${baseUrls.projects}/v0/projects`, {
          method: 'POST',
          headers: {
            ...applyHeaders({ 'Content-Type': 'application/json' }),
          },
          body: JSON.stringify(payload),
        });
        projects.value.push(data);
        projects.value.sort((a, b) => a.name.localeCompare(b.name));
        newProjectName.value = '';
        showCreateProject.value = false;
        selectedProjectId.value = data.id;
      } catch (error) {
        createProjectError.value = 'No se pudo crear el proyecto. Intenta nuevamente.';
      } finally {
        creatingProject.value = false;
      }
    };

    watch(
      projects,
      () => {
        ensureProjectSelection();
      },
      { deep: true },
    );

    watch(hasProjects, (value) => {
      if (!value) {
        showCreateProject.value = true;
      }
    });

    watch(
      selectedProjectId,
      (projectId) => {
        if (projectId) {
          requestHeaders['X-Project'] = projectId;
          window.localStorage.setItem('holaCloud:lastProjectId', projectId);
          refreshTabs(projectId);
          fetchTree(projectId);
          showLogsPanel.value = true;
        } else {
          delete requestHeaders['X-Project'];
          window.localStorage.removeItem('holaCloud:lastProjectId');
          refreshTabs(null);
          tree.databases = [];
          tree.lambdas = [];
          showLogsPanel.value = false;
        }
      },
      { immediate: true },
    );

    watch(
      () => tabs.value.length,
      () => {
        if (activeTabIndex.value >= tabs.value.length) {
          activeTabIndex.value = Math.max(0, tabs.value.length - 1);
        }
      },
    );

    onMounted(async () => {
      await Promise.all([loadUser(), loadProjects()]);
      ensureProjectSelection();
      if (selectedProjectId.value) {
        refreshTabs(selectedProjectId.value);
        fetchTree(selectedProjectId.value);
      }
    });

    return {
      user,
      userLoading,
      isAuthenticated,
      projects,
      projectsLoading,
      selectedProjectId,
      selectedProject,
      projectSelectOptions,
      hasProjects,
      projectSubtitle,
      databaseCount,
      lambdaCount,
      logsUrl,
      resourceDescription,
      tabs,
      activeTabIndex,
      activeTab,
      showLogsPanel,
      tree,
      isTreeFetching,
      databasesLoading,
      lambdasLoading,
      showCreateProject,
      newProjectName,
      createProjectError,
      creatingProject,
      selectProject,
      toggleDatabase,
      openCollection,
      openLambda,
      closeTab,
      selectTab,
      goToLogin,
      goToLogout,
      toggleCreateProject,
      handleProjectSubmit,
    };
  },
  template: /* html */ `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-brand">
          <img src="./img/holacloud-logo-transparent.png" alt="hola.cloud" class="app-brand__logo" />
          <div>
            <p class="app-brand__title">hola.cloud</p>
            <p class="app-brand__subtitle">Cloud Console</p>
          </div>
        </div>
        <div class="app-header__controls" v-if="isAuthenticated && hasProjects">
          <HcSelect
            class="app-project-select"
            v-model="selectedProjectId"
            :options="projectSelectOptions"
            placeholder="Selecciona un proyecto"
          />
        </div>
        <div class="app-header__actions">
          <template v-if="userLoading">
            <span class="resource-tree__loading">Validando sesión…</span>
          </template>
          <template v-else-if="isAuthenticated">
            <div class="app-user">
              <img v-if="user.picture" :src="user.picture" alt="Avatar" class="app-user__avatar" />
              <div>
                <p class="app-user__name">{{ user.nick || user.name }}</p>
                <p v-if="user.email" class="app-user__email">{{ user.email }}</p>
              </div>
            </div>
            <HcButton variant="secondary" @click="goToLogout">Cerrar sesión</HcButton>
          </template>
          <template v-else>
            <HcButton @click="goToLogin">Iniciar sesión</HcButton>
          </template>
        </div>
      </header>
      <main class="app-main">
        <section v-if="userLoading" class="loading-state">
          <div class="loader"></div>
          <p class="hc-body">Preparando tu consola…</p>
        </section>

        <template v-else-if="!isAuthenticated">
          <section class="hero">
            <HcCard
              title="Bienvenido a hola.cloud"
              description="Administra tus servicios, bases de datos y lambdas con una experiencia moderna."
            >
              <div class="stack">
                <p class="hc-body">
                  Inicia sesión para conectar tus proyectos, desplegar recursos y monitorear su estado en tiempo real.
                </p>
                <div class="form-actions" style="justify-content: center;">
                  <HcButton @click="goToLogin">Iniciar sesión</HcButton>
                </div>
              </div>
            </HcCard>
          </section>
        </template>

        <template v-else>
          <div v-if="hasProjects" class="app-layout">
            <aside class="app-sidebar">
              <HcCard
                title="Tu sesión activa"
                :description="user.email || 'Gestiona los recursos de tu organización desde aquí.'"
              >
                <div class="stack">
                  <div class="resource-list__meta">Usuario: {{ user.nick || user.name }}</div>
                  <div v-if="selectedProject" class="resource-list__meta">
                    Proyecto activo: {{ selectedProject.name }}
                  </div>
                </div>
              </HcCard>

              <HcCard title="Proyectos" description="Selecciona un proyecto para gestionar sus recursos.">
                <div v-if="projectsLoading" class="resource-tree__loading">Cargando proyectos…</div>
                <div v-else-if="projects.length" class="project-list">
                  <button
                    v-for="projectItem in projects"
                    :key="projectItem.id"
                    type="button"
                    class="project-list__item"
                    :class="{ 'is-active': projectItem.id === selectedProjectId }"
                    @click="selectProject(projectItem.id)"
                  >
                    <div>
                      <div class="project-list__name">{{ projectItem.name }}</div>
                      <div class="project-list__meta">ID · {{ projectItem.id }}</div>
                    </div>
                  </button>
                </div>
                <p v-else class="resource-empty">Aún no hay proyectos creados.</p>
                <template #footer>
                  <div class="project-actions">
                    <HcButton variant="secondary" block @click="toggleCreateProject">
                      {{ showCreateProject ? 'Cerrar' : 'Nuevo proyecto' }}
                    </HcButton>
                  </div>
                </template>
              </HcCard>

              <transition name="fade">
                <HcCard v-if="showCreateProject" title="Crear proyecto">
                  <form class="stack" @submit.prevent="handleProjectSubmit">
                    <HcInput label="Nombre del proyecto" v-model="newProjectName" required />
                    <p v-if="createProjectError" class="form-error">{{ createProjectError }}</p>
                    <div class="form-actions">
                      <HcButton type="submit" :loading="creatingProject" :disabled="!newProjectName">
                        Crear proyecto
                      </HcButton>
                    </div>
                  </form>
                </HcCard>
              </transition>

              <HcCard title="Recursos" :description="resourceDescription">
                <div class="resource-group">
                  <div class="resource-group__header">
                    <h3 class="resource-group__title">Bases de datos</h3>
                    <span class="resource-counter">{{ databaseCount }}</span>
                  </div>
                  <div v-if="databasesLoading" class="resource-tree__loading">Sincronizando bases de datos…</div>
                  <div v-else-if="databaseCount" class="resource-tree">
                    <div
                      v-for="database in tree.databases"
                      :key="database.id"
                      class="resource-tree__database"
                    >
                      <button class="resource-tree__toggle" type="button" @click="toggleDatabase(database)">
                        <span class="resource-tree__chevron" :class="{ 'is-open': database.open }"></span>
                        <img src="img/icon-db.png" alt="" class="resource-tree__icon" />
                        <div class="resource-tree__meta">
                          <span class="resource-tree__name">{{ database.name }}</span>
                          <span class="resource-tree__info">ID · {{ database.id }}</span>
                        </div>
                        <span class="resource-counter" v-if="database.collections.length">
                          {{ database.collections.length }}
                        </span>
                      </button>
                      <div v-if="database.open" class="resource-tree__children">
                        <div v-if="database.loading" class="resource-tree__loading">Cargando colecciones…</div>
                        <button
                          v-for="collection in database.collections"
                          :key="collection.name"
                          type="button"
                          class="resource-tree__child"
                          @click="openCollection(database, collection)"
                        >
                          <img
                            src="https://inceptiondb.hola.cloud/v2/img/icon-collection.svg"
                            alt="Colección"
                          />
                          <span>{{ collection.name }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p v-else class="resource-empty">Todavía no hay bases de datos creadas.</p>
                </div>

                <div class="resource-group">
                  <div class="resource-group__header">
                    <h3 class="resource-group__title">Lambdas</h3>
                    <span class="resource-counter">{{ lambdaCount }}</span>
                  </div>
                  <div v-if="lambdasLoading" class="resource-tree__loading">Sincronizando lambdas…</div>
                  <div v-else-if="lambdaCount" class="resource-list">
                    <button
                      v-for="lambda in tree.lambdas"
                      :key="lambda.id"
                      type="button"
                      class="resource-list__item"
                      @click="openLambda(lambda)"
                    >
                      <img src="img/icon-lambda.png" alt="" width="18" />
                      <div>
                        <div class="resource-list__name">{{ lambda.method }} {{ lambda.path }}</div>
                        <div class="resource-list__meta" v-if="lambda.name">{{ lambda.name }}</div>
                      </div>
                    </button>
                  </div>
                  <p v-else class="resource-empty">Todavía no hay funciones desplegadas.</p>
                </div>
              </HcCard>
            </aside>

            <section class="app-content">
              <HcCard v-if="selectedProject" :title="selectedProject.name" :description="projectSubtitle">
                <div class="project-summary">
                  <div class="project-summary__metric">
                    <span class="project-summary__label">Bases de datos</span>
                    <span class="project-summary__value">
                      {{ databasesLoading ? '···' : databaseCount }}
                    </span>
                  </div>
                  <div class="project-summary__metric">
                    <span class="project-summary__label">Lambdas</span>
                    <span class="project-summary__value">
                      {{ lambdasLoading ? '···' : lambdaCount }}
                    </span>
                  </div>
                  <div class="project-summary__metric">
                    <span class="project-summary__label">ID del proyecto</span>
                    <span class="project-summary__value project-summary__value--muted">
                      {{ selectedProject.id }}
                    </span>
                  </div>
                </div>
              </HcCard>

              <section class="workspace">
                <div class="workspace__tabs">
                  <button
                    v-for="(tab, index) in tabs"
                    :key="tab.key"
                    type="button"
                    class="workspace-tab"
                    :class="{ 'is-active': index === activeTabIndex }"
                    @click="selectTab(index)"
                  >
                    <img :src="tab.icon" alt="" />
                    <span>{{ tab.name }}</span>
                    <span
                      v-if="tab.closable"
                      class="workspace-tab__close"
                      role="button"
                      tabindex="0"
                      @click.stop="closeTab(index)"
                    >
                      ×
                    </span>
                  </button>
                </div>
                <div class="workspace__stage">
                  <div v-if="!activeTab || !activeTab.url" class="workspace-placeholder">
                    <p>Selecciona una pestaña para abrir la herramienta correspondiente.</p>
                  </div>
                  <iframe
                    v-for="(tab, index) in tabs"
                    v-show="index === activeTabIndex && tab.url"
                    :key="tab.key + '-' + index"
                    class="workspace-frame"
                    :src="tab.url"
                    allow="clipboard-read; clipboard-write"
                  ></iframe>
                </div>
                <div class="workspace__footer">
                  <label class="toggle">
                    <input type="checkbox" v-model="showLogsPanel" />
                    <span>Mostrar registros en vivo</span>
                  </label>
                </div>
              </section>

              <transition name="slide-up">
                <section v-if="showLogsPanel && logsUrl" class="logs-panel">
                  <header class="logs-panel__header">
                    <div class="logs-panel__title">
                      <img src="img/icon-logs.png" alt="" />
                      <div>
                        <p class="logs-panel__heading">Logs instantáneos</p>
                        <p class="logs-panel__subtitle">
                          Observa en tiempo real los eventos emitidos por tu proyecto.
                        </p>
                      </div>
                    </div>
                    <HcButton variant="subtle" @click="showLogsPanel = false">Ocultar</HcButton>
                  </header>
                  <iframe :src="logsUrl" class="logs-frame"></iframe>
                </section>
              </transition>
            </section>
          </div>

          <section v-else class="empty-state">
            <HcCard
              title="Crea tu primer proyecto"
              description="Despliega servicios, bases de datos y lambdas en minutos."
            >
              <form class="stack" @submit.prevent="handleProjectSubmit">
                <HcInput label="Nombre del proyecto" v-model="newProjectName" required />
                <p v-if="createProjectError" class="form-error">{{ createProjectError }}</p>
                <div class="form-actions" style="justify-content: center;">
                  <HcButton type="submit" :loading="creatingProject" :disabled="!newProjectName">
                    Crear proyecto
                  </HcButton>
                </div>
              </form>
            </HcCard>
          </section>
        </template>
      </main>
    </div>
  `,
});

createApp(App).mount('#app');
