// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import path, { join } from 'path'
import type * as http from 'node:http'
import type { Connect, PluginOption } from 'vite'
import { babelPluginPatchMxui } from '../util/dojoClient'
import { serveFile } from './serveFile'

export async function getReactMiddleware(
  pluginRoot: string,
): Promise<Connect.NextHandleFunction> {
  let patchedMxuiString: string

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await fetch(
        'http://127.0.0.1:8080/mxclientsystem/mxui/mxui.js',
      )
      if (!response.ok) {
        throw new Error('Failed to fetch mxui.js')
      }
      const bodyText = await response.text()
      const patchString = await babelPluginPatchMxui(bodyText)
      patchedMxuiString = patchString!
      break
    } catch (e) {
      console.error(e)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return function (
    req: Connect.IncomingMessage,
    res: http.ServerResponse,
    next: Connect.NextFunction,
  ): void {
    const url = req.url
    if (url?.startsWith('/test/dist/commons.js')) {
      serveFile(
        req,
        res,
        join(
          pluginRoot,
          'src/plugins/util/__tests__/asset/react-client/b.commons.js',
        ),
      )
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
