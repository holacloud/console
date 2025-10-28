import {
  computed,
  createApp,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const LAST_PROJECT_KEY = 'hola.cloud:last-project';

function createHeaders(baseHeaders, extra = {}) {
  const headers = new Headers();
  Object.entries(baseHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  Object.entries(extra).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return headers;
}

function sortByName(items, key = 'name') {
  const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: false });
  return [...items].sort((a, b) => collator.compare(a[key] ?? '', b[key] ?? ''));
}

createApp({
  setup() {
    const user = ref('loading');
    const projects = ref([]);
    const selectedProjectId = ref(null);
    const showNewProjectForm = ref(false);
    const newProjectName = ref('');
    const loading = reactive({
      projects: false,
      createProject: false,
    });

    const tree = reactive({
      databases: [],
      lambdas: [],
    });

    const treeLoading = reactive({
      databases: false,
      lambdas: false,
    });

    const tabs = ref([]);
    const activeTabId = ref(null);
    const workspaceSidebarVisible = ref(true);
    const isCompactLayout = ref(false);

    const endpoints = reactive({
      base: '',
      projects: 'https://projects.hola.cloud',
      inception: 'https://inceptiondb.hola.cloud',
      lambdas: 'https://lambda.hola.cloud',
    });

    const fakeHeaders = reactive({});
    const localdev = window.location.hostname === 'localhost';

    if (localdev) {
      endpoints.base = '/fakeapi/authapi';
      endpoints.projects = '/fakeapi/projectsapi';
      endpoints.inception = '/fakeapi/inceptionapi';
      endpoints.lambdas = '/fakeapi/lambdasapi';
      fakeHeaders['X-Glue-Authentication'] = JSON.stringify({ user: { id: 'user1' } });
    }

    const sortedProjects = computed(() => sortByName(projects.value, 'name'));

    const selectedProject = computed(() =>
      projects.value.find((project) => project.id === selectedProjectId.value) ?? null,
    );

    const projectHost = computed(() => {
      if (!selectedProject.value?.host) return null;
      const host = selectedProject.value.host.startsWith('http')
        ? selectedProject.value.host
        : `https://${selectedProject.value.host}`;
      return host;
    });

    const isLoggedIn = computed(() => user.value && user.value !== 'loading');
    const isLoadingProjects = computed(() => loading.projects);
    const showEmptyState = computed(
      () => isLoggedIn.value && !loading.projects && projects.value.length === 0,
    );

    const activeTab = computed(() => tabs.value.find((tab) => tab.id === activeTabId.value) ?? null);

    const userInitials = computed(() => {
      if (!user.value || user.value === 'loading') return '';
      const source = user.value.nick || user.value.name || user.value.email || '';
      const initials = source
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
      return initials || 'HC';
    });

    const storageAvailable = typeof window !== 'undefined' && 'localStorage' in window;
    let storedProjectId = null;
    if (storageAvailable) {
      try {
        storedProjectId = window.localStorage.getItem(LAST_PROJECT_KEY);
      } catch (error) {
        storedProjectId = null;
      }
    }

    function updateTitle(project) {
      document.title = project ? `${project.name} · hola.cloud Console` : 'hola.cloud Console';
    }

    function applyBaseTabs(projectId) {
      const baseTabs = [
        {
          id: 'database',
          label: 'Base de datos',
          icon: 'img/icon-db.png',
          url: `https://inceptiondb.hola.cloud/?embed&project=${projectId}`,
          closable: false,
        },
        {
          id: 'lambda',
          label: 'Lambdas',
          icon: 'img/icon-lambda.png',
          url: `https://lambda.hola.cloud/?embed&project=${projectId}`,
          closable: false,
        },
        {
          id: 'config',
          label: 'Configuración',
          icon: 'img/icon-config.png',
          url: `https://config.hola.cloud/?embed&project=${projectId}`,
          closable: false,
        },
        {
          id: 'files',
          label: 'Archivos',
          icon: 'img/icon-files.png',
          url: `https://files.hola.cloud/?embed&project=${projectId}`,
          closable: false,
        },
      ];

      tabs.value = baseTabs;
      activeTabId.value = baseTabs[0]?.id ?? null;
    }

    async function fetchUser() {
      try {
        const response = await fetch(`${endpoints.base}/auth/me`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data?.error) {
          user.value = null;
          return;
        }
        user.value = data;
        if (localdev) {
          fakeHeaders['X-Glue-Authentication'] = JSON.stringify({ user: data });
        }
      } catch (error) {
        console.error('Error fetching user', error);
        user.value = null;
      }
    }

    async function fetchProjects() {
      loading.projects = true;
      try {
        const response = await fetch(`${endpoints.projects}/v0/projects`, {
          headers: createHeaders(fakeHeaders),
          credentials: 'include',
        });
        const data = await response.json();
        const ordered = sortByName(data, 'name');
        projects.value = ordered;

        if (!ordered.length) {
          selectedProjectId.value = null;
          return;
        }

        if (selectedProjectId.value && !ordered.some((project) => project.id === selectedProjectId.value)) {
          selectedProjectId.value = null;
        }

        if (!selectedProjectId.value) {
          const fallback = storedProjectId && ordered.some((project) => project.id === storedProjectId)
            ? storedProjectId
            : ordered[0].id;
          selectedProjectId.value = fallback;
        }
      } catch (error) {
        console.error('Error fetching projects', error);
      } finally {
        loading.projects = false;
      }
    }

    async function fetchDatabases(expectedProjectId) {
      treeLoading.databases = true;
      try {
        const response = await fetch(`${endpoints.inception}/v1/databases`, {
          headers: createHeaders(fakeHeaders),
          credentials: 'include',
        });
        const data = await response.json();
        const ordered = sortByName(data, 'name').map((database) => ({
          ...database,
          open: false,
          collections: [],
          collectionsLoading: false,
          collectionsLoaded: false,
        }));
        if (expectedProjectId === selectedProjectId.value) {
          tree.databases = ordered;
        }
      } catch (error) {
        console.error('Error fetching databases', error);
        if (expectedProjectId === selectedProjectId.value) {
          tree.databases = [];
        }
      } finally {
        if (expectedProjectId === selectedProjectId.value) {
          treeLoading.databases = false;
        }
      }
    }

    async function fetchLambdas(expectedProjectId) {
      treeLoading.lambdas = true;
      try {
        const response = await fetch(`${endpoints.lambdas}/api/v0/lambdas`, {
          headers: createHeaders(fakeHeaders),
          credentials: 'include',
        });
        const data = await response.json();
        const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
        const ordered = [...data].sort((a, b) =>
          collator.compare(`${a.path} ${a.method}`, `${b.path} ${b.method}`),
        );
        if (expectedProjectId === selectedProjectId.value) {
          tree.lambdas = ordered;
        }
      } catch (error) {
        console.error('Error fetching lambdas', error);
        if (expectedProjectId === selectedProjectId.value) {
          tree.lambdas = [];
        }
      } finally {
        if (expectedProjectId === selectedProjectId.value) {
          treeLoading.lambdas = false;
        }
      }
    }

    async function expandDatabase(database) {
      database.open = !database.open;
      if (!database.open) {
        return;
      }
      if (database.collectionsLoaded || database.collectionsLoading) {
        return;
      }
      database.collectionsLoading = true;
      try {
        const response = await fetch(
          `${endpoints.inception}/v1/databases/${database.id}/collections`,
          {
            headers: createHeaders(fakeHeaders),
            credentials: 'include',
          },
        );
        const data = await response.json();
        database.collections = sortByName(data, 'name');
        database.collectionsLoaded = true;
      } catch (error) {
        console.error('Error fetching collections', error);
      } finally {
        database.collectionsLoading = false;
      }
    }

    function ensureTab(tab) {
      const existing = tabs.value.find((item) => item.id === tab.id);
      if (existing) {
        activeTabId.value = existing.id;
        return;
      }
      tabs.value = [...tabs.value, tab];
      activeTabId.value = tab.id;
    }

    function openLambda(lambda) {
      if (!selectedProjectId.value) return;
      ensureTab({
        id: `lambda-${lambda.id}`,
        label: `${lambda.method} ${lambda.path}`,
        icon: 'img/icon-lambda.png',
        url: `https://lambda.hola.cloud/?embed&project=${selectedProjectId.value}#/lambdas/${lambda.id}`,
        closable: true,
      });
    }

    function openCollection(database, collection) {
      if (!selectedProjectId.value) return;
      ensureTab({
        id: `collection-${database.id}-${collection.name}`,
        label: collection.name,
        icon: 'img/icon-db.png',
        url: `https://inceptiondb.hola.cloud/?embed&project=${selectedProjectId.value}#/databases/${database.id}/collections/${collection.name}`,
        closable: true,
      });
    }

    function closeTab(tabId) {
      const filtered = tabs.value.filter((tab) => tab.id !== tabId);
      tabs.value = filtered;
      if (activeTabId.value === tabId) {
        activeTabId.value = filtered.length ? filtered[filtered.length - 1].id : null;
      }
    }

    function setActiveTab(tabId) {
      activeTabId.value = tabId;
    }

    function selectProject(projectId) {
      selectedProjectId.value = projectId;
    }

    function toggleNewProjectForm() {
      showNewProjectForm.value = !showNewProjectForm.value;
      if (!showNewProjectForm.value) {
        newProjectName.value = '';
      }
    }

    async function createProject() {
      const name = newProjectName.value.trim();
      if (!name) return;
      loading.createProject = true;
      try {
        const response = await fetch(`${endpoints.projects}/v0/projects`, {
          method: 'POST',
          headers: createHeaders(fakeHeaders, { 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({ name }),
        });
        const project = await response.json();
        const updated = sortByName([...projects.value, project], 'name');
        projects.value = updated;
        selectedProjectId.value = project.id;
        newProjectName.value = '';
        showNewProjectForm.value = false;
      } catch (error) {
        console.error('Error creating project', error);
      } finally {
        loading.createProject = false;
      }
    }

    function handleResize() {
      const compact = window.innerWidth < 960;
      if (compact !== isCompactLayout.value) {
        isCompactLayout.value = compact;
      }
      if (!compact) {
        workspaceSidebarVisible.value = true;
      }
    }

    onMounted(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
      fetchUser();
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });

    watch(
      () => user.value,
      (value) => {
        if (value && value !== 'loading') {
          fetchProjects();
        } else if (value === null) {
          projects.value = [];
          selectedProjectId.value = null;
        }
      },
    );

    watch(
      () => selectedProjectId.value,
      (projectId) => {
        if (storageAvailable) {
          try {
            if (projectId) {
              window.localStorage.setItem(LAST_PROJECT_KEY, projectId);
            } else {
              window.localStorage.removeItem(LAST_PROJECT_KEY);
            }
          } catch (error) {
            // ignore persistence errors
          }
        }

        if (!projectId) {
          delete fakeHeaders['X-Project'];
          tree.databases = [];
          tree.lambdas = [];
          tabs.value = [];
          activeTabId.value = null;
          updateTitle(null);
          storedProjectId = null;
          return;
        }

        tree.databases = [];
        tree.lambdas = [];
        fakeHeaders['X-Project'] = projectId;
        applyBaseTabs(projectId);
        updateTitle(selectedProject.value);
        fetchDatabases(projectId);
        fetchLambdas(projectId);
        storedProjectId = projectId;
      },
    );

    watch(selectedProject, (project) => {
      updateTitle(project);
    });

    watch(
      () => showNewProjectForm.value,
      (visible) => {
        if (visible) {
          workspaceSidebarVisible.value = true;
        }
      },
    );

    return {
      activeTab,
      activeTabId,
      createProject,
      expandDatabase,
      isCompactLayout,
      isLoggedIn,
      isLoadingProjects,
      loading,
      newProjectName,
      openCollection,
      openLambda,
      closeTab,
      projectHost,
      projects,
      selectProject,
      selectedProject,
      selectedProjectId,
      setActiveTab,
      showEmptyState,
      showNewProjectForm,
      sortedProjects,
      tabs,
      toggleNewProjectForm,
      tree,
      treeLoading,
      user,
      userInitials,
      workspaceSidebarVisible,
    };
  },
}).mount('#app');
