import { computed, defineComponent, h, useSlots } from 'vue';

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
    const bodyClass = computed(() => ['hc-card__body', props.padding]);

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
              class: 'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
            },
            [
              h('div', { class: 'min-w-0 space-y-1' }, headerChildren),
              slots.actions ? h('div', { class: 'flex items-center gap-3' }, slots.actions()) : null,
            ],
          )
        : null;

      const body = h('div', { class: bodyClass.value }, slots.default ? slots.default() : []);
      const footer = slots.footer
        ? h('footer', { class: 'hc-card__footer border-t pt-4' }, slots.footer())
        : null;

      return h('section', { class: 'hc-card' }, [header, body, footer]);
    };
  },
});
