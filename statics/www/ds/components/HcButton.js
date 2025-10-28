import { computed, defineComponent, h, resolveDynamicComponent } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const variantClasses = {
  primary: 'hc-btn-primary',
  secondary: 'hc-btn-secondary',
  subtle: 'hc-btn-subtle',
  danger: 'hc-btn-danger',
};

export default defineComponent({
  name: 'HcButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
    },
    type: {
      type: String,
      default: 'button',
    },
    disabled: Boolean,
    loading: Boolean,
    icon: [Object, Function, String],
    block: Boolean,
  },
  setup(props, { slots }) {
    const computedClasses = computed(() => variantClasses[props.variant] ?? variantClasses.primary);

    return () => {
      const children = [];

      if (props.loading) {
        children.push(
          h('span', {
            class: 'hc-button__spinner',
            'aria-hidden': 'true',
          }),
        );
      }

      if (!props.loading && (props.icon || slots.icon)) {
        const iconContent = slots.icon ? slots.icon() : [h(resolveDynamicComponent(props.icon))];
        children.push(
          h(
            'span',
            {
              class: 'hc-button__icon',
              'aria-hidden': 'true',
            },
            iconContent,
          ),
        );
      }

      if (slots.default) {
        children.push(h('span', { class: 'hc-button__label' }, slots.default()));
      }

      const classList = ['hc-button', computedClasses.value];
      if (props.block) classList.push('hc-button--block');
      if (props.loading) classList.push('is-loading');

      return h(
        'button',
        {
          type: props.type,
          class: classList,
          disabled: props.disabled || props.loading,
        },
        children,
      );
    };
  },
});
