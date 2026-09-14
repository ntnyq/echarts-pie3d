import {
  defineConfig,
  presetWind4,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({ preflights: { reset: false } }),
    presetIcons({
      autoInstall: true,
      extraProperties: {},
      scale: 1.2,
    }),
  ],

  shortcuts: {
    'playground-button':
      'playground-focus cursor-pointer rounded-md border border-button bg-transparent px-3.5 py-2.25 text-13px text-inherit hover:bg-hover aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-white',
    'playground-focus':
      'focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-3',
  },

  theme: {
    colors: {
      brand: '#285b4d',
      button: '#d4d6ca',
      chart: '#38786a',
      control: '#626c63',
      divider: '#dddcd2',
      eyebrow: '#6a7c72',
      hover: '#e9eadd',
      ink: '#242c29',
      muted: '#74776e',
      page: '#f5f3ed',
    },
    font: {
      sans: 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif',
    },
  },

  transformers: [transformerDirectives(), transformerVariantGroup()],
})
