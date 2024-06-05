import type { PluginOption } from 'vite'

export const LibInClientRuntime: PluginOption = {
  name: 'LibInClientRuntime',
  enforce: 'pre',
  resolveId(id) {
    if (
      [
        'mendix/components/web/Icon',
        'mendix/filters/builders',
        'mendix',
        'big.js',
      ].includes(id)
    ) {
      return '/__internal-mendix/' + id
    }
  },
  load(id) {
    if (id === '/__internal-mendix/big.js') {
      return `export const Big = window.__internal['big.js'].Big;
                    export default window.__internal['big.js'];`
    }
    if (id === '/__internal-mendix/mendix') {
      return `
          export {}
          export const ValueStatus={
    Available : "available",
    Unavailable : "unavailable",
    Loading : "loading"
}
          `
    }
    if (id === '/__internal-mendix/mendix/filters/builders') {
      return `const dep=window.__internal['${id.slice(19)}'];
        export const  and=dep.and;
export const association=dep.association;
export const attribute=dep.attribute;
export const contains=dep.contains;
export const dayEquals=dep.dayEquals;
export const dayGreaterThan=dep.dayGreaterThan;
export const dayGreaterThanOrEqual=dep.dayGreaterThanOrEqual;
export const dayLessThan=dep.dayLessThan;
export const dayLessThanOrEqual=dep.dayLessThanOrEqual;
export const dayNotEqual=dep.dayNotEqual;
export const empty=dep.empty;
export const endsWith=dep.endsWith;
export const equals=dep.equals;
export const greaterThan=dep.greaterThan;
export const greaterThanOrEqual=dep.greaterThanOrEqual;
export const lessThan=dep.lessThan;
export const lessThanOrEqual=dep.lessThanOrEqual;
export const literal=dep.literal;
export const not=dep.not;
export const notEqual=dep.notEqual;
export const or=dep.or;
export const startsWith=dep.startsWith;
`
    }
    if (id.startsWith('/__internal-mendix/')) {
      return `const dep=window.__internal['${id.slice(19)}'];
          export default dep;`
    }
  },
}
