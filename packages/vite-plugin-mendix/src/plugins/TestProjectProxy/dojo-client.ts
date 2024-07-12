// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import path, { join } from 'path'
import type * as http from 'node:http'
import type { Connect, PluginOption } from 'vite'
import { babelPluginPatchMxui } from '../util/dojoClient'
import { serveFile } from './serveFile'

export function loadDojoMain(
  pluginRoot: string,
  widgetName: string,
  widgetPackage: string,
): string {
  return fs
    .readFileSync(join(pluginRoot, 'main.js'), {
      encoding: 'utf-8',
    })
    .replace('__WIDGET_NAME__', widgetName)
    .replace('__PACKAGE_PATH__', widgetPackage)
}

export async function getDojoMiddleware(
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
