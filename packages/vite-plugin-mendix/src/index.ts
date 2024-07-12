import { PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import Inspect from 'vite-plugin-inspect'

import { LibInClientRuntime } from './plugins/LibInClientRuntime'
import { testProjectProxy } from './plugins/TestProjectProxy'
import { widgetAPI } from './plugins/WidgetAPI'

interface Options {
  widgetName: string
  testProject: string
  widgetPackage: string
  isReactClient: boolean
}

export default function (opts: Options): PluginOption {
  return [
    Inspect(),
    react(),
    LibInClientRuntime,
    widgetAPI(opts.widgetName, opts.testProject, opts.widgetPackage),
    testProjectProxy(opts.widgetName, opts.widgetPackage, opts.isReactClient),
  ]
}
