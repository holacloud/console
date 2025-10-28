import { computed, defineComponent, h, useSlots } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

export default defineComponent({
  name: 'HcCard',
  props: {
    title: String,
    description: String,
    padding: {
      type: String,
      default: 'hc-card__body--padded',
    },
  },
  setup(props) {
    const slots = useSlots();
    const hasHeader = computed(() => Boolean(props.title || props.description || slots.title || slots.actions));
    const bodyClass = computed(() => ['hc-card__body', props.padding].filter(Boolean));

    return () => {
      const headerChildren = [];
      if (slots.title) {
        headerChildren.push(slots.title());
      } else if (props.title) {
        headerChildren.push(
          h(
            'h2',
            {
              class: 'hc-card__title',
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
              class: 'hc-card__description',
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
              h('div', { class: 'hc-card__headline' }, headerChildren),
              slots.actions ? h('div', { class: 'hc-card__actions' }, slots.actions()) : null,
            ],
          )
        : null;

      const body = h('div', { class: bodyClass.value.join(' ') }, slots.default ? slots.default() : []);
      const footer = slots.footer ? h('footer', { class: 'hc-card__footer' }, slots.footer()) : null;

      return h('section', { class: 'hc-card' }, [header, body, footer]);
    };
  },
});
