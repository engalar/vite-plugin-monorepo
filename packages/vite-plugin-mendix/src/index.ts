import { Connect, PluginOption, createLogger } from 'vite'
import fs, { FSWatcher } from 'fs'
import react from '@vitejs/plugin-react'
import Inspect from 'vite-plugin-inspect'
import { transformPackage } from '@mendix/pluggable-widgets-tools/dist/typings-generator'
import path, { join } from 'path'
import { fileURLToPath } from 'url'

import type { ServerResponse } from 'http'
import { updateZip } from './updateZip'
import { babelPluginPatchMxui } from './babel-plugin/patch-mxui'

const __filename = fileURLToPath(import.meta.url)
const currentDir = path.dirname(__filename)

interface Options {
  widgetName: string
  testProject: string
  widgetPackage: string
}

const logger = createLogger()

export default function (opts: Options): PluginOption {
  let watcher: FSWatcher | undefined = undefined
  return [
    Inspect(),
    react(),
    // https://vitejs.dev/config/server-options#server-proxy
    // https://webpack.js.org/configuration/dev-server/#devserverproxy
    {
      name: 'vite-plugin-mendix',
      enforce: 'pre',
      config(config) {
        config.server = config.server || {}
        config.server.open = '/test/index.html'
        config.server.proxy = config.server.proxy || {}
        config.server.proxy = {
          ...config.server.proxy,
          ...{
            '/test': {
              target: 'http://localhost:8080',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/test/, ''),
            },
            '/test/mxdevtools/': {
              ws: true,
              target: 'ws://localhost:8080',
              rewrite: (path) => path.replace(/^\/test/, ''),
            },
          },
        }
        return config
      },
      load(id, options) {
        if (id.startsWith('/src/main.js')) {
          return fs
            .readFileSync(currentDir + '/../main.js', {
              encoding: 'utf-8',
            })
            .replace('__WIDGET_NAME__', opts.widgetName)
        }
      },
      async configureServer(server) {
        const response = await fetch(
          'http://localhost:8080/mxclientsystem/mxui/mxui.js',
        )
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const bodyText = await response.text()
        const patchedMxuiString = await babelPluginPatchMxui(bodyText)
        server.middlewares.use(async (req, res, next) => {
          const url = req.url
          if (url?.startsWith('/test/mxclientsystem/mxui/mxui.js')) {
            serveFile(req, res, 'dummy.js')
            return
          }
          if (url?.startsWith('/test/mxui.js')) {
            serveFile(req, res, 'mxui.js')
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
      buildStart() {
        logger.info(
          `[vite-plugin-mendix] please start the test project in ${opts.testProject} and view app in http://localhost:5173/`,
        )
        const sourceDir = path.join(process.cwd(), 'src')
        function throttle(func: () => Promise<void>): () => void {
          let lastScheduledTask: any = null,
            pending = false

          return function () {
            // @ts-ignore
            const context: any = this

            // not start and has todo, then cancel
            if (!pending && lastScheduledTask !== null) {
              clearTimeout(lastScheduledTask)
            }

            lastScheduledTask = setTimeout(async () => {
              pending = true
              lastScheduledTask = null
              await func.apply(context)
              pending = false
            }, 300)
          }
        }
        async function generateTypes() {
          await transformPackage(
            await fs.promises.readFile(path.join(sourceDir, 'package.xml'), {
              encoding: 'utf8',
            }),
            sourceDir,
          )
          logger.info(
            `[vite-plugin-mendix] Typing updated: /typings/${opts.widgetName}Props.d.ts`,
          )
          const xmlName = opts.widgetName + '.xml'
          await updateZip(
            path.join(sourceDir, xmlName),
            path.join(
              opts.testProject,
              'widgets',
              `${opts.widgetPackage}.${opts.widgetName}.mpk`,
            ),
            xmlName,
          )
          // info update what mpk file in where test project has been updated
          logger.info(
            `[vite-plugin-mendix] MPK updated: ${opts.testProject}/widgets/${opts.widgetPackage}.${opts.widgetName}.mpk`,
          )
          logger.warn(
            '[vite-plugin-mendix] Please run f4 to reload the test project in Studio Pro',
          )
        }
        const throttledGenerateTypes = throttle(generateTypes)
        watcher = fs.watch(
          join(sourceDir, opts.widgetName + '.xml'),
          (event: string, _filename) => {
            if (event === 'change') {
              throttledGenerateTypes()
            }
          },
        )
      },
      buildEnd() {
        if (watcher) {
          watcher.close()
        }
      },
    },
  ]
}

function serveFile(
  req: Connect.IncomingMessage,
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
