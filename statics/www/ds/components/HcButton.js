import { computed, defineComponent, h, resolveDynamicComponent } from '../../lib/vue.esm-browser.prod.js';

const baseClasses = 'hc-button hc-button--layout';

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
  },
  setup(props, { slots }) {
    const computedClasses = computed(() => variantClasses[props.variant] ?? variantClasses.primary);

    return () => {
      const children = [];

      if (props.loading) {
        children.push(
          h('span', {
            class: 'inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
          }),
        );
      }

      if (!props.loading && (props.icon || slots.icon)) {
        const iconContent = slots.icon ? slots.icon() : [h(resolveDynamicComponent(props.icon))];
        children.push(
          h(
            'span',
            {
              class: 'text-lg leading-none',
              'aria-hidden': 'true',
            },
            iconContent,
          ),
        );
      }

      if (slots.default) {
        children.push(h('span', { class: 'font-medium' }, slots.default()));
      }

      return h(
        'button',
        {
          type: props.type,
          class: [baseClasses, computedClasses.value],
          disabled: props.disabled || props.loading,
        },
        children,
      );
    };
  },
});
