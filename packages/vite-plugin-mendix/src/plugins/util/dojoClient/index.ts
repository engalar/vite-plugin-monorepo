import type { PluginObj } from '@babel/core'
import { transformAsync } from '@babel/core'
import type Babel from '@babel/core'

// 如何写插件
// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-writing-your-first-babel-plugin

// 可视化语法树，指导写代码
// https://astexplorer.net/#/KJ8AjD6maa

function patchMxui(babel: typeof Babel): PluginObj {
  const t = babel.types

  return {
    name: 'transform-arrow-functions',

    visitor: {
      SequenceExpression(path) {
        // 安全检查：确保我们操作的是在一个 ExpressionStatement 内部的序列
        if (!path.parentPath.isExpressionStatement()) {
          return
        }

        const expressions = path.node.expressions
        // 至少要有2个表达式才符合 A, B 的模式
        if (expressions.length < 2) {
          return
        }

        // 识别特征：第一个表达式是否是 DevTools 检查
        // 我们通过遍历它的子节点来寻找 "__REACT_DEVTOOLS_GLOBAL_HOOK__"
        const firstExprPath = path.get('expressions.0')
        let isDevtoolsCheck = false
        firstExprPath.traverse({
          Identifier(innerPath) {
            if (innerPath.node.name === '__REACT_DEVTOOLS_GLOBAL_HOOK__') {
              isDevtoolsCheck = true
              innerPath.stop() // 找到后立即停止，提高效率
            }
          },
        })

        // 如果确认是目标
        if (isDevtoolsCheck) {
          firstExprPath.remove()
        }
      },
      AssignmentExpression(path) {
        // 检查左侧是否匹配 window.dojoDynamicRequire.cache[e]
        if (
          t.isFunctionExpression(path.node.right) &&
          // e
          t.isMemberExpression(path.node.left) &&
          path.node.left.property.type === 'Identifier' &&
          path.node.left.property.name === 'e' &&
          // cache
          t.isMemberExpression(path.node.left.object) &&
          path.node.left.object.property.type === 'Identifier' &&
          path.node.left.object.property.name === 'cache' &&
          // dojoDynamicRequire
          t.isMemberExpression(path.node.left.object.object) &&
          path.node.left.object.object.property.type === 'Identifier' &&
          path.node.left.object.object.property.name === 'dojoDynamicRequire' &&
          // window
          t.isIdentifier(path.node.left.object.object.object) &&
          path.node.left.object.object.object.name === 'window'

          /* &&
          t.isMemberExpression(path.node.left.object, {
            type: 'MemberExpression',
            property: { type: 'Identifier', name: 'cache' },
            computed: false,
          }) &&
          t.isMemberExpression(path.node.left.object.object, {
            type: 'MemberExpression',
            property: { type: 'Identifier', name: 'dojoDynamicRequire' },
            computed: false,
          }) &&
          t.isIdentifier(path.node.left.object.object.object, {
            type: 'Identifier',
            name: 'window',
          }) */
        ) {
          // 插入 window.__internal = window.__internal || {};
          const internalDeclaration = t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(
                t.identifier('window'),
                t.identifier('__internal'),
              ),
              t.logicalExpression(
                '||',
                t.memberExpression(
                  t.identifier('window'),
                  t.identifier('__internal'),
                ),
                t.objectExpression([]),
              ),
            ),
          )

          // 插入 window.__internal[e] = t;
          const internalAssignment = t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(
                t.memberExpression(
                  t.identifier('window'),
                  t.identifier('__internal'),
                ),
                path.node.left.property,
                true,
              ),
              path.scope.getBindingIdentifier('t'),
            ),
          )

          // 先插入内部变量声明
          path.insertBefore(internalDeclaration)
          path.insertBefore(internalAssignment)
        }
      },
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
      ObjectProperty(path) {
        const { key, value } = path.node
        if (t.isNumericLiteral(key) && t.isArrowFunctionExpression(value)) {
          if (
            value.body.type === 'BlockStatement' &&
            value.body.body.length > 0
          ) {
            const block = value.body.body[0]
            if (
              block.leadingComments &&
              block.leadingComments.length > 0 &&
              block.leadingComments[0].value.includes('@license React')
            ) {
              const [isMatch, moduleName] = match(
                block.leadingComments[0].value,
              )
              if (isMatch) {
                switch (moduleName) {
                  case 'react-jsx-runtime': {
                    const fragment = t.expressionStatement(
                        t.assignmentExpression(
                          '=',
                          t.memberExpression(
                            t.memberExpression(
                              t.identifier('e'),
                              t.identifier('exports'),
                            ),
                            t.identifier('Fragment'),
                          ),
                          t.memberExpression(
                            t.memberExpression(
                              t.identifier('ReactFamily'),
                              t.identifier('RuntimeDev'),
                            ),
                            t.identifier('Fragment'),
                          ),
                        ),
                      ),
                      jsx = t.expressionStatement(
                        t.assignmentExpression(
                          '=',
                          t.memberExpression(
                            t.memberExpression(
                              t.identifier('e'),
                              t.identifier('exports'),
                            ),
                            t.identifier('jsx'),
                          ),
                          t.memberExpression(
                            t.memberExpression(
                              t.identifier('ReactFamily'),
                              t.identifier('RuntimeDev'),
                            ),
                            t.identifier('jsxDEV'),
                          ),
                        ),
                      ),
                      jsxs = t.expressionStatement(
                        t.assignmentExpression(
                          '=',
                          t.memberExpression(
                            t.memberExpression(
                              t.identifier('e'),
                              t.identifier('exports'),
                            ),
                            t.identifier('jsxs'),
                          ),
                          t.memberExpression(
                            t.memberExpression(
                              t.identifier('ReactFamily'),
                              t.identifier('Runtime'),
                            ),
                            t.identifier('jsxs'),
                          ),
                        ),
                      )
                    value.body.body = [fragment, jsx, jsxs]
                    break
                  }
                  case 'scheduler': {
                    const scheduler = t.expressionStatement(
                      t.assignmentExpression(
                        '=',
                        t.memberExpression(
                          t.identifier('e'),
                          t.identifier('exports'),
                        ),
                        t.memberExpression(
                          t.identifier('ReactFamily'),
                          t.identifier('ReactDOMScheduler'),
                        ),
                      ),
                    )
                    value.body.body = [scheduler]
                    break
                  }
                  case 'react': {
                    const react = t.expressionStatement(
                      t.assignmentExpression(
                        '=',
                        t.memberExpression(
                          t.identifier('e'),
                          t.identifier('exports'),
                        ),
                        t.memberExpression(
                          t.identifier('ReactFamily'),
                          t.identifier('React'),
                        ),
                      ),
                    )
                    value.body.body = [react]
                    break
                  }
                  case 'react-dom': {
                    const reactDom = t.expressionStatement(
                      t.assignmentExpression(
                        '=',
                        t.memberExpression(
                          t.identifier('e'),
                          t.identifier('exports'),
                        ),
                        t.memberExpression(
                          t.identifier('ReactFamily'),
                          t.identifier('ReactDOM'),
                        ),
                      ),
                    )
                    value.body.body = [reactDom]
                    break
                  }
                  default:
                    break
                }
              }
            }
          }
        }
      },
    },
  }
}
export function match(comment: string): [boolean, string] {
  // eslint-disable-next-line regexp/no-unused-capturing-group
  const regex = /@license\sReact(\s)*\*(\s)*(\w+(-\w+)*).production.min.js/g
  const match = regex.exec(comment)
  if (match && match[3]) {
    return [true, match[3]]
  } else {
    return [false, '']
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
