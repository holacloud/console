import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

let selectIdCounter = 0;

export default defineComponent({
  name: 'HcSelect',
  props: {
    id: {
      type: String,
      default: null,
    },
    modelValue: {
      type: [String, Number, Boolean, Object],
      default: null,
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: 'Selecciona una opción',
    },
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const triggerRef = ref(null);
    const listRef = ref(null);
    const activeIndex = ref(-1);

    const componentId = ref(props.id ?? `hc-select-${++selectIdCounter}`);
    watch(
      () => props.id,
      (value) => {
        if (value) {
          componentId.value = value;
        }
      },
    );

    const listboxId = computed(() => `${componentId.value}-listbox`);
    const optionId = (index) => `${componentId.value}-option-${index}`;

    const selectedOption = computed(
      () => props.options.find((option) => option.value === props.modelValue) ?? null,
    );

    const setActiveIndex = (index) => {
      activeIndex.value = index;
      nextTick(() => {
        if (index < 0) return;
        const listEl = listRef.value;
        if (!listEl) return;
        const optionEl = listEl.children?.[index];
        if (optionEl && optionEl.scrollIntoView) {
          optionEl.scrollIntoView({ block: 'nearest' });
        }
      });
    };

    const setActiveByValue = (value) => {
      if (value === null || value === undefined) {
        setActiveIndex(-1);
        return;
      }
      const idx = props.options.findIndex((option) => option.value === value);
      setActiveIndex(idx);
    };

    watch(
      () => props.modelValue,
      (value) => {
        setActiveByValue(value);
      },
    );

    const openDropdown = () => {
      if (props.disabled || !props.options.length) return;
      if (isOpen.value) return;
      isOpen.value = true;
      nextTick(() => {
        if (selectedOption.value) {
          setActiveByValue(selectedOption.value.value);
        } else {
          setActiveIndex(0);
        }
        listRef.value?.focus({ preventScroll: true });
      });
    };

    const closeDropdown = (restoreFocus = true) => {
      if (!isOpen.value) return;
      isOpen.value = false;
      setActiveIndex(-1);
      if (restoreFocus) {
        nextTick(() => {
          triggerRef.value?.focus({ preventScroll: true });
        });
      }
    };

    const toggleDropdown = () => {
      if (isOpen.value) {
        closeDropdown();
      } else {
        openDropdown();
      }
    };

    const selectOption = (option) => {
      if (!option) return;
      emit('update:modelValue', option.value);
      emit('change', option.value);
      closeDropdown();
    };

    const moveActive = (direction) => {
      if (!props.options.length) return;
      const count = props.options.length;
      let nextIndex = activeIndex.value;
      if (nextIndex === -1) {
        nextIndex = direction > 0 ? 0 : count - 1;
      } else {
        nextIndex = (nextIndex + direction + count) % count;
      }
      setActiveIndex(nextIndex);
    };

    const handleTriggerKeydown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen.value) {
            openDropdown();
          } else {
            moveActive(1);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen.value) {
            openDropdown();
            moveActive(-1);
          } else {
            moveActive(-1);
          }
          break;
        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (!isOpen.value) {
            openDropdown();
          } else if (activeIndex.value >= 0) {
            selectOption(props.options[activeIndex.value]);
          }
          break;
        }
        case 'Escape':
          if (isOpen.value) {
            event.preventDefault();
            closeDropdown(false);
          }
          break;
        default:
      }
    };

    const handleListKeydown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          moveActive(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveActive(-1);
          break;
        case 'Home':
          event.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setActiveIndex(props.options.length - 1);
          break;
        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (activeIndex.value >= 0) {
            selectOption(props.options[activeIndex.value]);
          }
          break;
        }
        case 'Escape':
          event.preventDefault();
          closeDropdown();
          break;
        case 'Tab':
          closeDropdown(false);
          break;
        default:
      }
    };

    const handleClickOutside = (event) => {
      if (!isOpen.value) return;
      const target = event.target;
      const triggerEl = triggerRef.value;
      const listEl = listRef.value;
      if (triggerEl && triggerEl.contains(target)) return;
      if (listEl && listEl.contains(target)) return;
      closeDropdown(false);
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return () => {
      const rootClasses = ['hc-select'];
      if (isOpen.value) rootClasses.push('is-open');
      if (props.disabled) rootClasses.push('is-disabled');

      const triggerChildren = [];
      if (selectedOption.value) {
        triggerChildren.push(
          h('div', { class: 'hc-select__value' }, [
            h('span', { class: 'hc-select__label' }, selectedOption.value.label),
            selectedOption.value.description
              ? h('span', { class: 'hc-select__description' }, selectedOption.value.description)
              : null,
          ]),
        );
      } else {
        triggerChildren.push(
          h('div', { class: 'hc-select__value' }, [
            h('span', { class: 'hc-select__placeholder' }, props.placeholder),
          ]),
        );
      }

      triggerChildren.push(
        h(
          'span',
          { class: 'hc-select__icon', 'aria-hidden': 'true' },
          [
            h(
              'svg',
              {
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 20 20',
                fill: 'none',
                width: 18,
                height: 18,
                stroke: 'currentColor',
                'stroke-width': 1.5,
              },
              [
                h('path', {
                  d: 'M6 8l4 4 4-4',
                  stroke: 'currentColor',
                  'stroke-width': 1.8,
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                }),
              ],
            ),
          ],
        ),
      );

      const dropdown =
        isOpen.value && props.options.length
          ? h(
              'ul',
              {
                ref: listRef,
                id: listboxId.value,
                class: 'hc-select__dropdown',
                role: 'listbox',
                tabindex: -1,
                'aria-activedescendant': activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
                onKeydown: handleListKeydown,
              },
              props.options.map((option, index) =>
                h(
                  'li',
                  {
                    id: optionId(index),
                    key: option.value ?? index,
                    role: 'option',
                    class: [
                      'hc-select__option',
                      index === activeIndex.value ? 'is-active' : null,
                      selectedOption.value && option.value === selectedOption.value.value ? 'is-selected' : null,
                    ],
                    'aria-selected': selectedOption.value
                      ? String(option.value === selectedOption.value.value)
                      : 'false',
                    onClick: () => selectOption(option),
                    onMouseenter: () => setActiveIndex(index),
                  },
                  [
                    h('div', { class: 'hc-select__option-content' }, [
                      h('div', { class: 'hc-select__option-text' }, [
                        h('span', { class: 'hc-select__option-label' }, option.label),
                        option.description
                          ? h('span', { class: 'hc-select__option-description' }, option.description)
                          : null,
                      ]),
                      option.meta
                        ? h('span', { class: 'hc-select__option-meta' }, option.meta)
                        : null,
                    ]),
                  ],
                ),
              ),
            )
          : null;

      return h('div', { class: rootClasses.join(' ') }, [
        h(
          'button',
          {
            ref: triggerRef,
            id: componentId.value,
            type: 'button',
            class: 'hc-select__trigger',
            disabled: props.disabled,
            'aria-haspopup': 'listbox',
            'aria-expanded': String(isOpen.value),
            'aria-controls': listboxId.value,
            onClick: toggleDropdown,
            onKeydown: handleTriggerKeydown,
          },
          triggerChildren,
        ),
        dropdown,
      ]);
    };
  },
});
