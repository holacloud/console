import { computed, defineComponent, h } from '../../lib/vue.esm-browser.prod.js';

export default defineComponent({
  name: 'HcInput',
  props: {
    modelValue: [String, Number],
    label: String,
    id: String,
    variant: {
      type: String,
      default: 'text',
    },
    type: {
      type: String,
      default: 'text',
    },
    required: Boolean,
    help: String,
    error: String,
    placeholder: String,
    rows: {
      type: Number,
      default: 4,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const isTextarea = computed(() => props.variant === 'textarea');
    const generatedId = `hc-input-${Math.random().toString(36).slice(2, 9)}`;
    const inputId = computed(() => props.id || generatedId);
    const helperId = computed(() => (props.help && !props.error ? `${inputId.value}-help` : undefined));
    const errorId = computed(() => (props.error ? `${inputId.value}-error` : undefined));

    const inputAttrs = computed(() => ({
      type: isTextarea.value ? undefined : props.type,
      value: props.modelValue,
      rows: isTextarea.value ? props.rows : undefined,
      id: inputId.value,
      placeholder: props.placeholder,
      'aria-invalid': Boolean(props.error),
      'aria-errormessage': errorId.value,
      'aria-describedby': errorId.value || helperId.value,
      'aria-labelledby': props.label ? `${inputId.value}-label` : undefined,
      required: props.required,
      class: ['hc-input', props.error ? 'hc-input-error' : null],
      onInput: (event) => emit('update:modelValue', event.target.value),
    }));

    const render = () => {
      const children = [];

      if (props.label) {
        children.push(
          h(
            'span',
            {
              class: 'hc-form-label',
              id: `${inputId.value}-label`,
            },
            [props.label, props.required ? h('span', { class: 'hc-required-indicator', 'aria-hidden': 'true' }, '*') : null],
          ),
        );
      }

      const controlTag = isTextarea.value ? 'textarea' : 'input';
      children.push(h(controlTag, inputAttrs.value));

      if (props.help && !props.error) {
        children.push(h('p', { id: helperId.value, class: 'hc-helper-text' }, props.help));
      }

      if (props.error) {
        children.push(
          h(
            'p',
            { id: errorId.value, class: 'hc-error-text' },
            [h('span', { 'aria-hidden': 'true' }, '⚠️'), h('span', null, props.error)],
          ),
        );
      }

      if (slots.default) {
        children.push(slots.default());
      }

      return h('label', { class: 'hc-input-wrapper', for: inputId.value }, children);
    };

    return {
      inputId,
      helperId,
      errorId,
      render,
    };
  },
});
