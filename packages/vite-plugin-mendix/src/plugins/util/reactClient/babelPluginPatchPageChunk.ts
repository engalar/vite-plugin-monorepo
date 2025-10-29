import { transformAsync } from '@babel/core'
import type { PluginObj } from '@babel/core'
import type Babel from '@babel/core'

// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-writing-your-first-babel-plugin

// https://astexplorer.net/#/KJ8AjD6maa
function patch(
  babel: typeof Babel,
  options: { widgetNames: string[], isTs: boolean },
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
            const newCode = `import { ${widgetName} as ${widgetName}$1 } from 'http://localhost:5173/src/${widgetName}.${options.isTs ? 'tsx' : 'jsx'}';
var ${widgetName}WidgetModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ${widgetName}: ${widgetName}$1
});`
            const result = babel.parseSync(newCode, { sourceType: 'module' })
            path.replaceWithMultiple(result!.program.body)
          }
        })
      },
      VariableDeclaration(path) {
        if (
          path.node.declarations[0].id.type === 'Identifier' &&
          options.widgetNames.includes(path.node.declarations[0].id.name)
        ) {
          const widgetName = path.node.declarations[0].id.name
          // insert new code at the top of the file
          const newCode = `import { ${widgetName} } from 'http://localhost:5173/src/${widgetName}.${options.isTs ? 'tsx' : 'jsx'}';`
          const result = babel.parseSync(newCode, { sourceType: 'module' })
          const programPath = path.findParent((e) => {
            return e.node.type === 'Program'
          })
          if (programPath?.isProgram()) {
            programPath.node.body.unshift(result!.program.body[0])
          }
          /* programPath!.insertAfter(
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(widgetName))],
              t.stringLiteral(`http://localhost:5173/src/${widgetName}.tsx`),
            ),
          ) */
          path.remove()
        }
      },
    },
  }
}

export async function babelPluginPatchPageChunk(
  code: string,
  widgetNames: string[],
  isTs: boolean = true
): Promise<string | null | undefined> {
  const result = await transformAsync(code, {
    plugins: [[patch, { widgetNames, isTs }]],
  })
  return result?.code
}
