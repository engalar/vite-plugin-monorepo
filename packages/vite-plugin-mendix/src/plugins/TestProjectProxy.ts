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
import { babelPluginPatchMxui } from './util/babel'

const __filename = fileURLToPath(import.meta.url)
const currentDir = path.dirname(join(__filename, '..'))

const logger = createLogger()
// https://vitejs.dev/config/server-options#server-proxy
// https://webpack.js.org/configuration/dev-server/#devserverproxy
export function testProjectProxy(
  widgetName: string,
  widgetPackage: string,
): PluginOption {
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
        },
      }
      return config
    },
    load(id, _options) {
      if (id.startsWith('/src/main.js')) {
        return fs
          .readFileSync(currentDir + '/../main.js', {
            encoding: 'utf-8',
          })
          .replace('__WIDGET_NAME__', widgetName)
          .replace('__PACKAGE_PATH__', widgetPackage)
      }
    },
    async configureServer(server) {
      let patchedMxuiString: string | null | undefined = null,
        isOffline = false
      server.middlewares.use(async (req, res, next) => {
        if (!patchedMxuiString) {
          const response = await fetch(
            'http://127.0.0.1:8080/mxclientsystem/mxui/mxui.js',
          ).catch((e) => {
            console.error(e)
            return null
          })
          if (!response || !response.ok) {
            if (!isOffline) {
              logger.error(red('Please start the test project in Studio Pro'))
              logger.error(red('请在 Studio Pro 中启动测试项目'))
              isOffline = true
            }
            res.statusCode = 500
            res.end('Failed to fetch mxui.js')
            return
          }
          isOffline = false
          const bodyText = await response.text()
          patchedMxuiString = await babelPluginPatchMxui(bodyText)
        }
        const url = req.url
        if (url?.startsWith('/test/mxclientsystem/mxui/mxui.js')) {
          serveFile(req, res, 'dummy.js')
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
      })
    },
  }
  return plugin
}

function serveFile(
  _req: Connect.IncomingMessage,
  res: ServerResponse,
  filePath: string,
): void {
  filePath = currentDir + '/../' + filePath
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // 发生错误时返回错误响应
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
      return
    }
    // 返回文件内容作为响应
    res.writeHead(200, { 'Content-Type': 'text/javascript' })
    res.end(data)
  })
}
