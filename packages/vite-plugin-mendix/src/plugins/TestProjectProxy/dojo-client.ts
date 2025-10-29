// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import path, { join } from 'path'
import type * as http from 'node:http'
import type { Connect } from 'vite'
import { babelPluginPatchMxui } from '../util/dojoClient'
import { serveFile } from './serveFile'
import { patchRemoteFile } from './util'

export function loadDojoMain(
  pluginRoot: string,
  widgetName: string,
  widgetPackage: string,
  isTs: boolean = true,
): string {
  return fs
    .readFileSync(join(pluginRoot, 'main.js'), {
      encoding: 'utf-8',
    })
    .replace('__WIDGET_NAME__', widgetName)
    .replace('__WIDGET_EXT__', isTs ? 'tsx' : 'jsx')
    .replace('__PACKAGE_PATH__', widgetPackage)
}

export async function getDojoMiddleware(
  pluginRoot: string,
): Promise<Connect.NextHandleFunction> {
  let patchedMxuiString: string

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const patchString = await patchRemoteFile(
        'http://127.0.0.1:8080/mxclientsystem/mxui/mxui.js',
        babelPluginPatchMxui,
      )
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
    if (url?.startsWith('/test/mxclientsystem/mxui/mxui.js')) {
      serveFile(req, res, join(pluginRoot, 'dummy.js'))
      return
    }
    if (url?.startsWith('/test/mxui.js')) {
      res.setHeader('Content-Type', 'text/javascript')
      res.statusCode = 200
      res.end(patchedMxuiString)
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
