// eslint-disable-next-line import/no-nodejs-modules
import { error } from 'console'
// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import type { ServerResponse } from 'http'
import type { Connect } from 'vite'

export function serveFile(
  _req: Connect.IncomingMessage,
  res: ServerResponse,
  filePath: string,
): void {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // 发生错误时返回错误响应
      error(err)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
      return
    }
    // 返回文件内容作为响应
    res.writeHead(200, { 'Content-Type': 'text/javascript' })
    res.end(data)
  })
}
