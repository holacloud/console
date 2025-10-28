import { computed, defineComponent, h, useSlots } from '../../lib/vue.esm-browser.prod.js';

export default defineComponent({
  name: 'HcCard',
  props: {
    title: String,
    description: String,
    padding: {
      type: String,
      default: 'p-4',
    },
  },
  setup(props) {
    const slots = useSlots();
    const hasHeader = computed(() => Boolean(props.title || props.description || slots.title || slots.actions));
    const bodyClass = computed(() => ['hc-card__body']);

    return () => {
      const headerChildren = [];
      if (slots.title) {
        headerChildren.push(slots.title());
      } else if (props.title) {
        headerChildren.push(
          h(
            'h2',
            {
              class: 'truncate text-lg font-semibold',
              style: { color: 'var(--color-text-strong)' },
            },
            props.title,
          ),
        );
      }

      if (props.description) {
        headerChildren.push(
          h(
            'p',
            {
              class: 'text-sm',
              style: { color: 'var(--color-text-muted)' },
            },
            props.description,
          ),
        );
      }

      const header = hasHeader.value
        ? h(
            'header',
            {
              class: 'hc-card__header',
            },
            [
              h('div', { class: 'hc-card__title-group' }, headerChildren),
              slots.actions ? h('div', { class: 'hc-card__actions' }, slots.actions()) : null,
            ],
          )
        : null;

      const body = h('div', { class: bodyClass.value }, slots.default ? slots.default() : []);
      const footer = slots.footer
        ? h('footer', { class: 'hc-card__footer' }, slots.footer())
        : null;

      return h('section', { class: 'hc-card' }, [header, body, footer]);
    };
  },
});
