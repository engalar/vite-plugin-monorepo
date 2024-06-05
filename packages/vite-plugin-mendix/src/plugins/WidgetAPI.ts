/* eslint-disable import/no-nodejs-modules */
import path, { join } from 'path'
import type { FSWatcher } from 'fs'
import fs from 'fs'
import { transformPackage } from '@mendix/pluggable-widgets-tools/dist/typings-generator'
import { type PluginOption, createLogger } from 'vite'
import { updateZip } from './util/updateZip'

let watcher: FSWatcher | undefined = undefined
const logger = createLogger()
export function widgetAPI(
  widgetName: string,
  testProject: string,
  widgetPackage: string,
): PluginOption {
  return {
    name: 'vite-plugin-mendix',
    enforce: 'pre',

    buildStart() {
      logger.info(
        `[vite-plugin-mendix] please start the test project in ${testProject} and view app in http://localhost:5173/`,
      )
      const sourceDir = path.join(process.cwd(), 'src')
      function throttle(func: () => Promise<void>): () => void {
        let lastScheduledTask: any = null,
          pending = false

        return function () {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const context: any = this

          // not start and has todo, then cancel
          if (!pending && lastScheduledTask != null) {
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
          `[vite-plugin-mendix] Typing updated: /typings/${widgetName}Props.d.ts`,
        )
        const xmlName = widgetName + '.xml'
        await updateZip(
          path.join(sourceDir, xmlName),
          path.join(
            testProject,
            'widgets',
            `${widgetPackage}.${widgetName}.mpk`,
          ),
          xmlName,
        )
        // info update what mpk file in where test project has been updated
        logger.info(
          `[vite-plugin-mendix] MPK updated: ${testProject}/widgets/${widgetPackage}.${widgetName}.mpk`,
        )
        logger.warn(
          '[vite-plugin-mendix] Please run f4 to reload the test project in Studio Pro',
        )
      }
      const throttledGenerateTypes = throttle(generateTypes)
      watcher = fs.watch(
        join(sourceDir, widgetName + '.xml'),
        (event: string, _filename: any) => {
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
  }
}
