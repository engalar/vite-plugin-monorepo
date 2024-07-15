// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import path, { join } from 'path'
// eslint-disable-next-line import/no-nodejs-modules
import { fileURLToPath } from 'url'
// eslint-disable-next-line import/no-nodejs-modules
import type { ServerResponse } from 'http'
import type { Connect, PluginOption } from 'vite'
import { createLogger } from 'vite'
import { red } from 'ansi-colors'
import { babelPluginPatchMxui } from '../util/dojoClient'
import { serveFile } from './serveFile'
import { getDojoMiddleware, loadDojoMain } from './dojo-client'
import { getReactMiddleware, rewriteReactImports } from './react-client'

const __filename = fileURLToPath(import.meta.url)
const pluginRoot = path.dirname(join(__filename, '..'))

const logger = createLogger()
// https://vitejs.dev/config/server-options#server-proxy
// https://webpack.js.org/configuration/dev-server/#devserverproxy
export function testProjectProxy(
  widgetName: string,
  widgetPackage: string,
  isReactClient: boolean = false,
): PluginOption {
  let severUrl
  const plugin: PluginOption = {
    name: 'TestProjectProxy',
    enforce: 'pre',
    config(config) {
      config.server = config.server || {}
      config.server.open = '/test/index.html'
      config.server.proxy = config.server.proxy || {}
      config.server.proxy = {
        ...config.server.proxy,
        ...{
          '/test': {
            target: 'http://127.0.0.1:8080',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/test/, ''),
          },
          '/test/mxdevtools/': {
            ws: true,
            target: 'ws://127.0.0.1:8080',
            rewrite: (path) => path.replace(/^\/test/, ''),
          },
          '/test/file?guid=': {
            target: 'http://127.0.0.1:8080',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/test/, ''),
          },
        },
      }
      return config
    },
    load(id, _options) {
      if (!isReactClient) {
        if (id.startsWith('/src/main.js')) {
          return loadDojoMain(pluginRoot, widgetName, widgetPackage)
        }
      }
    },
    async configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address: any = server.httpServer?.address()
        severUrl = `http://${address.family === 'IPv6' ? `[${address.address}]` : address.address}:${
          address.port
        }`
      })
      if (isReactClient) {
        const reactMiddleware = await getReactMiddleware(pluginRoot, widgetName)
        server.middlewares.use(reactMiddleware)
      } else {
        const dojoMiddleware = await getDojoMiddleware(pluginRoot)
        server.middlewares.use(dojoMiddleware)
      }
    },
  }
  return [plugin, rewriteReactImports()]
}
