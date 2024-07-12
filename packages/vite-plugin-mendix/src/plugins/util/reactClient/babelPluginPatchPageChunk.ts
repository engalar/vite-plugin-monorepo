import { transformAsync } from '@babel/core'
import type { PluginObj } from '@babel/core'
import type Babel from '@babel/core'

// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-writing-your-first-babel-plugin

// https://astexplorer.net/#/KJ8AjD6maa
function patch(
  babel: typeof Babel,
  options: { widgetNames: string[] },
): PluginObj {
  const t = babel.types

  return {
    name: 'transform-arrow-functions',
    visitor: {
      ImportDeclaration(path) {
        // import { wengaofileuploadwidgetmodule } from '../WengaoFileUpload.js';
        const { node } = path
        const sourceValue = node.source.value
        options.widgetNames.forEach((widgetName) => {
          if (sourceValue.includes(`../${widgetName}.js`)) {
            const newCode = `import { ${widgetName} as ${widgetName}$1 } from 'http://localhost:5173/src/${widgetName}.tsx';
var ${widgetName}WidgetModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ${widgetName}: ${widgetName}$1
});`
            const result = babel.parseSync(newCode, { sourceType: 'module' })
            path.replaceWithMultiple(result!.program.body)
          }
        })
      },
    },
  }
}

export async function babelPluginPatchPageChunk(
  code: string,
  widgetNames: string[],
): Promise<string | null | undefined> {
  const result = await transformAsync(code, {
    plugins: [[patch, { widgetNames }]],
  })
  return result?.code
}
