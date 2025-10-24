# Hola Cloud Design System (HC-DS)

## Objetivos
- Unificar la experiencia visual de todas las consolas de administración de hola.cloud.
- Facilitar la adopción en proyectos existentes basados en Vue 3 + Tailwind CSS.
- Proporcionar tokens de diseño, componentes base y guías de implementación.

## Fundamentos de diseño

### Principios
1. **Claridad primero**: cada vista debe priorizar la comprensión inmediata de estados y acciones.
2. **Consistencia modular**: reutilizar patrones y componentes evita decisiones ad-hoc.
3. **Accesibilidad**: contrastes AA, estados visibles, mensajes comprensibles.
4. **Escalabilidad**: los tokens y componentes son fácilmente extensibles.

### Identidad visual
- Marca: hola.cloud
- Tonalidad: fresca, tecnológica y humana.
- Logo: ver [`logo-hola-cloud.svg`](./logo-hola-cloud.svg). El isotipo representa una nube estilizada con un símbolo de saludo.

## Tokens de diseño

### Paleta de colores
Los colores principales se definen como variables CSS y en la configuración de Tailwind. Las variantes `-50` a `-900` permiten graduar estados.

| Token | Uso | Hex |
| --- | --- | --- |
| `--color-brand` | Color principal | `#5666F5` |
| `--color-brand-600` | Hover/Active | `#3A4BE6` |
| `--color-brand-100` | Fondos suaves | `#E6E9FF` |
| `--color-accent` | Destacados | `#FF7A59` |
| `--color-success` | Estados correctos | `#16A34A` |
| `--color-warning` | Advertencias | `#F59E0B` |
| `--color-danger` | Errores | `#DC2626` |
| `--color-neutral-900` | Texto principal | `#0F172A` |
| `--color-neutral-600` | Texto secundario | `#475569` |
| `--color-neutral-100` | Fondo base | `#F8FAFC` |

### Tipografía
- Fuente primaria: `"Inter", "Segoe UI", system-ui, sans-serif`.
- Jerarquía:
  - Títulos (`.hc-heading-1`, `.hc-heading-2`, `.hc-heading-3`).
  - Texto base (`.hc-body`).
  - Texto mono (`.hc-mono`): `"JetBrains Mono", monospace`.

### Espaciado y layout
- Escala de espaciado basada en múltiplos de 4 (`4px` -> `1rem = 16px`).
- Grid responsivo con columnas de 12 y gutters de `1rem`.
- Radios de borde: `0.75rem` en contenedores, `0.5rem` en inputs y botones.

### Elevación y sombras
- `--shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.08)`
- `--shadow-md`: `0 8px 16px rgba(15, 23, 42, 0.12)`
- `--shadow-lg`: `0 16px 32px rgba(15, 23, 42, 0.16)`

## Recursos incluidos
- [`styles.css`](./styles.css): define variables CSS, clases utilitarias básicas y tokens reactivos a modo claro/oscuro.
- [`tailwind.preset.js`](./tailwind.preset.js): preset para extender Tailwind en proyectos Vue 3.
- Componentes Vue reutilizables en formato módulo JavaScript (carpeta [`components`](./components)).
- Vista de referencia [`sample.html`](./sample.html) para validar el aspecto de los componentes en un layout completo.

## Componentes base
Cada componente está implementado en Vue 3 (API Composition) y exportado como módulo JavaScript (`*.js`), con clases compatibles con Tailwind y estilos base propios.

| Componente | Propósitos |
| --- | --- |
| `HcButton` | Acciones primarias/secundarias con variantes, iconos y estados de carga. |
| `HcCard` | Agrupar contenido en paneles con encabezado opcional. |
| `HcInput` | Campos de formulario con etiqueta, ayuda y mensajes de error. |
| `HcSelect` | Dropdown accesible con soporte para descripciones, iconos y modo claro/oscuro. |

### Convenciones de uso
- Prefijo `hc-` en clases personalizadas.
- Las variantes (primaria, secundaria, sutil, peligro) se exponen vía prop `variant`.
- Inputs emiten `update:modelValue` para integrarse con `v-model`.
- `HcSelect` acepta `options` con la forma `{ value, label, description?, meta? }` y expone `update:modelValue`.

#### HcSelect
- Reemplaza el `<select>` nativo para evitar inconsistencias de modo claro/oscuro en navegadores desktop y móviles.
- Permite añadir una segunda línea descriptiva y metadatos (iconos o etiquetas) alineados a la derecha de cada opción.
- Gestiona navegación por teclado (flechas, Home/End, Enter/Espacio, Escape) y cierre automático al hacer clic fuera.

## Integración en proyectos existentes

### 1. Instalar dependencias recomendadas
Asegúrate de contar con `tailwindcss@^3`, `@tailwindcss/forms` y `@tailwindcss/typography`.

### 2. Añadir preset de Tailwind
```js
// tailwind.config.cjs
module.exports = {
  presets: [require('./ds/tailwind.preset.js')],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
};
```

### 3. Importar estilos base
```css
/* main.css */
@import "./ds/styles.css";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Registrar componentes globales (opcional)
```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import HcButton from '../ds/components/HcButton.js';
import HcCard from '../ds/components/HcCard.js';
import HcInput from '../ds/components/HcInput.js';
import HcSelect from '../ds/components/HcSelect.js';

const app = createApp(App);
app.component('HcButton', HcButton);
app.component('HcCard', HcCard);
app.component('HcInput', HcInput);
app.component('HcSelect', HcSelect);
app.mount('#app');
```

### 5. Uso en vistas
```vue
<template>
  <HcCard title="Nuevo clúster">
    <form class="space-y-4">
      <HcSelect
        v-model="form.cluster"
        :options="clusterOptions"
        placeholder="Selecciona un clúster"
      />
      <HcInput label="Nombre" v-model="form.name" required />
      <HcInput label="Descripción" variant="textarea" v-model="form.description" />
      <div class="flex justify-end gap-3">
        <HcButton variant="secondary" type="button">Cancelar</HcButton>
        <HcButton type="submit">Crear</HcButton>
      </div>
    </form>
  </HcCard>
</template>
```

Definición de opciones para el dropdown personalizado:

```js
const clusterOptions = [
  {
    value: 'prod',
    label: 'Producción',
    description: 'Cluster activo en la región EU-West-1',
    meta: '🟢 99.9%',
  },
  {
    value: 'staging',
    label: 'Staging',
    description: 'Validación previa a producción con datos sintéticos',
    meta: '🟡 QA',
  },
  {
    value: 'create',
    label: 'Crear base de datos…',
    description: 'Lanza un nuevo recurso gestionado en la organización',
    meta: '➕',
  },
];
```

La última opción del array debe corresponder a la acción "crear el recurso" para mantener la consistencia entre proyectos.

## Accesibilidad
- Estados de foco visibles (outline de 2px con color marca).
- Mensajes de error con icono y texto descriptivo.
- Contraste mínimo AA (revísalo con herramientas como Lighthouse o axe).
- Soporte automático de modo claro/oscuro mediante `prefers-color-scheme` y actualización de tokens.

## Roadmap sugerido
1. Documentación viva con Storybook / VitePress.
2. Librería de íconos personalizados.
3. Documentación interactiva de componentes complejos (tablas, gráficos).
4. Tests visuales con Chromatic.

## Actualización y mantenimiento
- Cambios en tokens deben versionarse (semver).
- Cada nueva característica debe incluir ejemplos en las consolas activas.
- Realizar auditorías trimestrales para garantizar consistencia.

