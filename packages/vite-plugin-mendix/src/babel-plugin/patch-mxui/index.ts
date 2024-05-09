import type { PluginObj } from '@babel/core'
import type Babel from '@babel/core'
import { transformAsync } from '@babel/core'

// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-writing-your-first-babel-plugin

// https://astexplorer.net/#/KJ8AjD6maa
function patchMxui(babel: typeof Babel): PluginObj {
  const t = babel.types,
    noNewArrows = true

  return {
    name: 'transform-arrow-functions',

    visitor: {
      Program(path) {
        const comments =
          path.node.body && path.node.body.length > 0
            ? path.node.body[0].leadingComments
            : null

        if (
          comments &&
          comments.length > 0 &&
          comments[0].value.startsWith(' @preserve')
        ) {
          t.addComment(
            path.node,
            'leading',
            ' patched by vite-plugin-mendix',
            true,
          )
        }
      },
      CallExpression(path) {
        const { callee } = path.node

        // 只处理 Identifier 类型的 callee
        if (t.isIdentifier(callee)) {
          const functionName = callee.name

          // 创建 console.log 语句
          const logStatement = t.expressionStatement(
            t.callExpression(
              t.memberExpression(t.identifier('console'), t.identifier('log')),
              [t.stringLiteral(`Calling ${functionName}`)],
            ),
          )

          // 在当前函数调用前插入日志打印语句
          path.replaceWith(logStatement)
        }
      },
      ArrowFunctionExpression(path) {
        // In some conversion cases, it may have already been converted to a function while this callback
        // was queued up.
        if (!path.isArrowFunctionExpression()) return

        if (process.env.BABEL_8_BREAKING) {
          path.arrowFunctionToExpression({
            // While other utils may be fine inserting other arrows to make more transforms possible,
            // the arrow transform itself absolutely cannot insert new arrow functions.
            allowInsertArrow: false,
            noNewArrows,
          })
        } else {
          path.arrowFunctionToExpression({
            allowInsertArrow: false,
            noNewArrows,

            // This is only needed for backward compat with @babel/traverse <7.13.0
            // @ts-ignore(Babel 7 vs Babel 8) Removed in Babel 8
            specCompliant: !noNewArrows,
          })
        }
      },
    },
  }
}
export async function babelPluginPatchMxui(
  code: string,
): Promise<string | null | undefined> {
  const result = await transformAsync(code, {
    plugins: [patchMxui],
  })
  return result?.code
}
