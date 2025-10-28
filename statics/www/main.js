import { computed, createApp, reactive, ref } from './lib/vue.esm-browser.js';

const App = {
  setup() {
    const state = reactive({
      filters: {
        search: '',
        region: 'all',
      },
      metrics: [
        {
          id: 'clusters',
          label: 'Clusters activos',
          value: '12',
          trend: '▲ 2',
          direction: 'up',
          context: 'en las últimas 24 h',
        },
        {
          id: 'deploys',
          label: 'Deploys completados',
          value: '38',
          trend: '▲ 11%',
          direction: 'up',
          context: 'vs. semana anterior',
        },
        {
          id: 'alerts',
          label: 'Alertas resueltas',
          value: '92%',
          trend: '▼ 4%',
          direction: 'down',
          context: 'SLA en producción',
        },
        {
          id: 'costs',
          label: 'Optimización de costos',
          value: '€4.2K',
          trend: '▲ 8%',
          direction: 'up',
          context: 'ahorrados este mes',
        },
      ],
      regionOptions: [
        { value: 'all', label: 'Todas las regiones' },
        { value: 'eu-west-1', label: 'EU-West-1 · Madrid' },
        { value: 'us-east-1', label: 'US-East-1 · Virginia' },
        { value: 'sa-east-1', label: 'SA-East-1 · São Paulo' },
      ],
      projects: [
        {
          name: 'Orion API Gateway',
          description: 'Punto de entrada global para microservicios críticos.',
          owner: 'Plataforma',
          region: 'eu-west-1',
          uptime: '99.98%',
          status: 'Operativo',
          statusVariant: 'ok',
          tags: ['Zero-downtime', 'TLS mTLS'],
          lastActivity: 'Deploy automático · hace 2 h',
        },
        {
          name: 'Nebula ML Inference',
          description: 'Modelos de recomendación en tiempo real para tiendas.',
          owner: 'IA & Datos',
          region: 'us-east-1',
          uptime: '99.1%',
          status: 'Capacidad alta',
          statusVariant: 'warn',
          tags: ['GPU A100', 'Auto-scaling'],
          lastActivity: 'Nuevo modelo aprobado · hace 45 min',
        },
        {
          name: 'Astra Commerce',
          description: 'Checkout transaccional para comercios omnicanal.',
          owner: 'Retail Core',
          region: 'eu-west-1',
          uptime: '99.995%',
          status: 'Operativo',
          statusVariant: 'ok',
          tags: ['PCI DSS', 'Multi-región'],
          lastActivity: 'Auditoría completada · hace 1 día',
        },
        {
          name: 'Pulse Observability',
          description: 'Stack unificado de monitoreo, trazas y métricas.',
          owner: 'SRE',
          region: 'sa-east-1',
          uptime: '99.6%',
          status: 'Mantenimiento planificado',
          statusVariant: 'warn',
          tags: ['Grafana', 'OpenTelemetry'],
          lastActivity: 'Ventana el 14/05 · 02:00 BRT',
        },
      ],
      quickActions: [
        {
          id: 'cluster',
          title: 'Nuevo clúster Kubernetes',
          description: 'Crea un clúster optimizado con políticas seguras y monitoreo.',
          eta: '5 min',
        },
        {
          id: 'workspace',
          title: 'Workspace de datos',
          description: 'Provisiona un entorno colaborativo para analítica avanzada.',
          eta: '8 min',
        },
        {
          id: 'access',
          title: 'Revisión de accesos',
          description: 'Genera un informe de permisos activos y anomalías.',
          eta: '2 min',
        },
      ],
      timeline: [
        {
          title: 'Deploy Canary finalizado',
          detail: 'Servicio `billing-core` actualizado al release 2.14.3.',
          time: '08:42 · hoy',
        },
        {
          title: 'Nuevo workspace de IA',
          detail: 'Creado para el equipo DataLab en región EU-West-1.',
          time: '07:15 · hoy',
        },
        {
          title: 'Incidente resuelto',
          detail: 'Latencia elevada en `nebula-ml` mitigada tras ajuste de autoscaling.',
          time: 'Ayer · 21:03',
        },
      ],
      announcements: [
        {
          title: 'Programa de sostenibilidad',
          description: 'Reduce emisiones con workloads en modo eco inteligente.',
        },
        {
          title: 'Blueprints certificados',
          description: 'Plantillas listas para sectores financiero y salud.',
        },
      ],
    });

    const toastMessage = ref('');
    const showToast = ref(false);

    const filteredProjects = computed(() => {
      const search = state.filters.search.trim().toLowerCase();
      return state.projects.filter((project) => {
        const matchesRegion = state.filters.region === 'all' || project.region === state.filters.region;
        const matchesSearch =
          !search ||
          project.name.toLowerCase().includes(search) ||
          project.description.toLowerCase().includes(search) ||
          project.owner.toLowerCase().includes(search);
        return matchesRegion && matchesSearch;
      });
    });

    const regionLabel = computed(() => {
      const current = state.regionOptions.find((option) => option.value === state.filters.region);
      return current ? current.label : 'Región';
    });

    const handlePrimaryAction = () => triggerToast('Iniciando asistente para infraestructura inteligente…');
    const handleSecondaryAction = () => triggerToast('Mostrando rutas de adopción y guías recomendadas.');

    const triggerToast = (message) => {
      toastMessage.value = message;
      showToast.value = true;
      window.clearTimeout(triggerToast.timeoutId);
      triggerToast.timeoutId = window.setTimeout(() => {
        showToast.value = false;
      }, 3600);
    };

    const launchQuickAction = (action) => {
      triggerToast(`Acción rápida «${action.title}» programada (${action.eta}).`);
    };

    return {
      state,
      filteredProjects,
      regionLabel,
      handlePrimaryAction,
      handleSecondaryAction,
      launchQuickAction,
      toastMessage,
      showToast,
    };
  },
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-header__inner">
          <div class="brand">
            <img src="./img/logo-hola-cloud.svg" alt="hola.cloud" />
            <div>
              <div class="brand__title">hola.cloud</div>
              <div class="hc-helper-text">Consola unificada de operaciones</div>
            </div>
          </div>
          <nav class="app-nav">
            <a class="app-nav__item is-active" href="#">Resumen</a>
            <a class="app-nav__item" href="#">Infraestructura</a>
            <a class="app-nav__item" href="#">Datos</a>
            <a class="app-nav__item" href="#">Seguridad</a>
            <a class="app-nav__item" href="#">FinOps</a>
          </nav>
        </div>
      </header>

      <main class="app-content">
        <div class="app-content__inner">
          <section class="hero">
            <span class="hero__badge">Nuevo panel inteligente disponible</span>
            <h1 class="hero__title">Gestiona toda tu nube con decisiones guiadas por datos</h1>
            <p class="hero__subtitle">
              Observa el estado de tus plataformas, despliega workloads certificados y anticipa incidentes
              gracias a la analítica predictiva de hola.cloud.
            </p>
            <div class="hero__actions">
              <button class="hc-button hc-btn-primary" @click="handlePrimaryAction">Crear blueprint inteligente</button>
              <button class="hc-button hc-btn-secondary" @click="handleSecondaryAction">Explorar guías de adopción</button>
            </div>
          </section>

          <section class="metrics-grid">
            <article v-for="metric in state.metrics" :key="metric.id" class="metric-card">
              <span class="metric-card__label">{{ metric.label }}</span>
              <span class="metric-card__value">{{ metric.value }}</span>
              <span :class="['metric-card__trend', metric.direction === 'up' ? 'is-up' : 'is-down']">
                {{ metric.trend }}
              </span>
              <span class="hc-helper-text">{{ metric.context }}</span>
            </article>
          </section>

          <section class="dashboard-grid">
            <div class="panel">
              <div class="hc-card">
                <div class="hc-card__header">
                  <div>
                    <h2 class="hc-card__title">Proyectos estratégicos</h2>
                    <p class="hc-card__subtitle">{{ regionLabel }}</p>
                  </div>
                </div>
                <div class="hc-card__body">
                  <div class="search-bar">
                    <label>
                      Búsqueda
                      <input v-model="state.filters.search" type="search" placeholder="Filtrar por nombre, equipo o descripción" />
                    </label>
                    <label>
                      Región
                      <select v-model="state.filters.region">
                        <option v-for="option in state.regionOptions" :value="option.value" :key="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </label>
                  </div>

                  <div v-if="filteredProjects.length" class="card-list">
                    <article v-for="project in filteredProjects" :key="project.name" class="card-list__item">
                      <div class="card-list__title">{{ project.name }}</div>
                      <div class="hc-helper-text">{{ project.description }}</div>
                      <div class="card-list__meta">
                        <span class="tag">{{ project.owner }}</span>
                        <span class="tag">{{ project.region }}</span>
                        <span class="status-pill" :class="project.statusVariant === 'ok' ? 'is-ok' : 'is-warn'">{{ project.status }}</span>
                        <span>{{ project.uptime }} disponibilidad</span>
                      </div>
                      <div class="hc-helper-text">{{ project.lastActivity }}</div>
                    </article>
                  </div>
                  <div v-else class="empty-state">
                    No hay proyectos que coincidan con tu búsqueda en esta región.
                  </div>
                </div>
              </div>

              <div class="hc-card">
                <div class="hc-card__header">
                  <div>
                    <h2 class="hc-card__title">Actividades recientes</h2>
                    <p class="hc-card__subtitle">Sincronizado en tiempo real</p>
                  </div>
                </div>
                <div class="hc-card__body timeline">
                  <div v-for="item in state.timeline" :key="item.title" class="timeline__item">
                    <span class="timeline__time">{{ item.time }}</span>
                    <strong>{{ item.title }}</strong>
                    <span class="hc-helper-text">{{ item.detail }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="hc-card">
                <div class="hc-card__header">
                  <div>
                    <h2 class="hc-card__title">Acciones rápidas</h2>
                    <p class="hc-card__subtitle">Ahorra tiempo con automatizaciones guiadas</p>
                  </div>
                </div>
                <div class="hc-card__body quick-actions">
                  <button
                    v-for="action in state.quickActions"
                    :key="action.id"
                    class="quick-action"
                    type="button"
                    @click="launchQuickAction(action)"
                  >
                    <div>
                      <div class="card-list__title">{{ action.title }}</div>
                      <div class="quick-action__meta">{{ action.description }}</div>
                    </div>
                    <span class="status-pill is-ok">{{ action.eta }}</span>
                  </button>
                </div>
              </div>

              <div class="hc-card help-card">
                <div class="hc-card__header">
                  <div>
                    <h2 class="hc-card__title">Asistencia personalizada</h2>
                    <p class="hc-card__subtitle">SRE de guardia y especialistas FinOps</p>
                  </div>
                </div>
                <div class="hc-card__body help-card">
                  <p>
                    ¿Necesitas soporte inmediato? Agenda una sesión con nuestro equipo para optimizar tus despliegues
                    o resolver incidentes críticos.
                  </p>
                  <div class="help-card__actions">
                    <a class="support-link" href="#">Hablar con SRE ahora →</a>
                    <a class="support-link" href="#">Programar revisión FinOps →</a>
                  </div>
                  <div>
                    <h3 class="hc-heading-3" style="margin: 0 0 0.5rem 0; font-size: 1rem;">Novedades</h3>
                    <ul class="card-list" style="gap: 0.75rem;">
                      <li v-for="announcement in state.announcements" :key="announcement.title" style="list-style: none;">
                        <strong>{{ announcement.title }}</strong>
                        <div class="hc-helper-text">{{ announcement.description }}</div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer class="footer-note">© {{ new Date().getFullYear() }} hola.cloud · Diseño impulsado por HC-DS</footer>

      <transition name="fade">
        <div v-if="showToast" class="toast" role="status">{{ toastMessage }}</div>
      </transition>
    </div>
  `,
};

createApp(App).mount('#app');
