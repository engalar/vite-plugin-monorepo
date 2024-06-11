import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index', 'src/ReactFamily'],
  externals: ['vite'],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
})
