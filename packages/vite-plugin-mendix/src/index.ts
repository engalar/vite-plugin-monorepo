import { Connect, PluginOption } from 'vite'
import fs from 'fs'
import react from '@vitejs/plugin-react'
import Inspect from 'vite-plugin-inspect'
import httpProxy from 'http-proxy'
import path from 'path'
import { fileURLToPath } from 'url'

import type { ServerResponse } from 'http'

const __filename = fileURLToPath(import.meta.url)
const currentDir = path.dirname(__filename)
const proxy = httpProxy.createProxyServer({ secure: false })
const prefixs = [
  '/__inspect',
  '/@vite',
  '/node_modules',
  '/src',
  '/@react-refresh',
]

interface Options {
  widgetName: string
}

export default function (opts: Options): PluginOption {
  return [
    Inspect(),
    react(),
    {
      name: 'vite-plugin-mendix',
      enforce: 'pre',
      load(id, options) {
        if (id.startsWith('/src/main.js')) {
          return fs
            .readFileSync(currentDir + '/../main.js', {
              encoding: 'utf-8',
            })
            .replace('__WIDGET_NAME__', opts.widgetName)
        }
      },
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url!
          for (const prefix of prefixs) {
            if (url.startsWith(prefix)) {
              next()
              return
            }
          }
          if (url.startsWith('/mxclientsystem/mxui/mxui.js')) {
            serveFile(req, res, 'dummy.js')
            return
          }
          if (url.startsWith('/mxui.js')) {
            serveFile(req, res, 'mxui.js')
            return
          }

          proxyRequest(req, res, url)
        })
      },
      buildStart(opts) {
        console.log('buildStart')
      },
      buildEnd() {
        console.log('buildEnd')
      },
    },
  ]
}

function proxyRequest(
  req: Connect.IncomingMessage,
  res: ServerResponse,
  targetUrl: string,
): void {
  req.url = targetUrl
  proxy.web(req, res, {
    changeOrigin: true,
    target: 'http://localhost:8080',
  })
  proxy.on('error', (err) => {
    res.statusCode = 500
    res.end(err.message)
  })
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
