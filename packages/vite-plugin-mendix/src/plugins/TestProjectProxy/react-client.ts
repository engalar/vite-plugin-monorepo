// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import path, { join } from 'path'
import type * as http from 'node:http'
import type { Connect, PluginOption } from 'vite'
import { parse } from '@babel/parser'
import generate from '@babel/generator'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import { babelPluginPatchPageChunk } from '../util/reactClient'
import { patchRemoteFile } from './util'
import { serveFile } from './serveFile'

export async function getReactMiddleware(
  pluginRoot: string,
  widgetName: string,
  isTs: boolean = true
): Promise<Connect.NextHandleFunction> {
  return function (
    req: Connect.IncomingMessage,
    res: http.ServerResponse,
    next: Connect.NextFunction,
  ): void {
    const url = req.url
    if (url?.startsWith('/test/dist/commons.js')) {
      serveFile(req, res, join(pluginRoot, 'commons.js'))
      return
    }
    // dist/pages/*.js
    if (url?.startsWith('/test/dist/pages/') && url.includes('.Page.js')) {
      const patchFn = (code: string) =>
        babelPluginPatchPageChunk(code, [widgetName], isTs)
      patchRemoteFile(
        url.replace(/^\/test/, 'http://localhost:8080'),
        patchFn,
      ).then((patchedCode) => {
        res.writeHead(200, { 'Content-Type': 'text/javascript' })
        res.end(patchedCode)
      })
      return
    }
    // url not end with .html, redirect to /test/index.html
    if (
      !url?.endsWith('.html') &&
      url?.startsWith('/test') &&
      req.headers.accept?.includes('text/html')
    ) {
      // redirect to /test/index.html
      res.writeHead(302, {
        Location: '/test/index.html',
      })
      res.end()
      return
    }
    next()
  }
}

// https://astexplorer.net/#/KJ8AjD6maa
// https://babeljs.io/repl
// https://www.typescriptlang.org/play
export function rewriteReactImports(): PluginOption {
  let severUrl: string
  return {
    name: 'rewrite-react-imports',
    // enforce: "pre",
    transform(code: string, id: string) {
      if (
        id.endsWith('.js') ||
        id.endsWith('.jsx') ||
        id.endsWith('.ts') ||
        id.endsWith('.tsx')
      ) {
        // 使用 Babel 解析器解析代码
        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        })

        // 遍历 AST 并修改导入语句
        traverse(ast, {
          ImportDeclaration(path: any) {
            if (path.node.source.value === 'big.js') {
              path.replaceWith(
                t.importDeclaration(
                  [t.importSpecifier(t.identifier('Big'), t.identifier('Big'))],
                  t.stringLiteral(`${severUrl}/test/dist/commons.js`),
                ),
              )
            } else if (path.node.source.value === 'mendix') {
              if (
                path.node.specifiers.length === 1 &&
                t.isImportSpecifier(path.node.specifiers[0])
              ) {
                path.replaceWith(
                  t.variableDeclaration('const', [
                    t.variableDeclarator(
                      t.identifier('ValueStatus'),
                      t.objectExpression([
                        t.objectProperty(
                          t.identifier('Available'),
                          t.stringLiteral('available'),
                        ),
                        t.objectProperty(
                          t.identifier('Unavailable'),
                          t.stringLiteral('unavailable'),
                        ),
                        t.objectProperty(
                          t.identifier('Loading'),
                          t.stringLiteral('loading'),
                        ),
                      ]),
                    ),
                  ]),
                )
              }
            } else {
              // append severUrl to other imports
              // path.node.source.value = `${severUrl}/${path.node.source.value}`;
            }
          },
        })

        // 使用 Babel 生成器生成新的代码
        const output = generate(ast, { retainLines: true })
        return {
          code: output.code,
          map: output.map,
        }
      }
      return null
    },
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address: any = server.httpServer?.address()
        severUrl = `http://localhost:${address.port}`
      })
    },
  }
}
