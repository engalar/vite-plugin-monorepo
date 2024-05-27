import type { PluginObj } from '@babel/core'
import { transformAsync } from '@babel/core'
import type Babel from '@babel/core'

// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-writing-your-first-babel-plugin

// https://astexplorer.net/#/KJ8AjD6maa
function patchMxui(babel: typeof Babel): PluginObj {
  const t = babel.types

  return {
    name: 'transform-arrow-functions',

    visitor: {
      AssignmentExpression(path) {
        if (
          t.isMemberExpression(path.node.left) &&
          t.isIdentifier(path.node.left.property, { name: 'registerInDojo' }) &&
          t.isFunctionExpression(path.node.right)
        ) {
          // Create the new statements
          const internalInitStatement = t.expressionStatement(
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

          const internalAssignmentStatement = t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(
                t.memberExpression(
                  t.identifier('window'),
                  t.identifier('__internal'),
                ),
                t.identifier('e'),
                true,
              ),
              t.identifier('t'),
            ),
          )
          path.node.right.body.body.splice(
            0,
            0,
            internalInitStatement,
            internalAssignmentStatement,
          )
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
