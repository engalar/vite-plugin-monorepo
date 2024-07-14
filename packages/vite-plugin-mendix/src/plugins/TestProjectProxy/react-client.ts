// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import path, { join } from 'path'
import type * as http from 'node:http'
import type { Connect } from 'vite'
import { babelPluginPatchPageChunk } from '../util/reactClient'
import { serveFile } from './serveFile'
import { patchRemoteFile } from './util'

export async function getReactMiddleware(
  pluginRoot: string,
  widgetName: string,
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
        babelPluginPatchPageChunk(code, [widgetName])
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
