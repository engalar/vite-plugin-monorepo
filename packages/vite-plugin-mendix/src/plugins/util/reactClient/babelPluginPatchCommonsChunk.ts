import { transformAsync } from '@babel/core'
import type { PluginObj } from '@babel/core'
import type Babel from '@babel/core'

// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-writing-your-first-babel-plugin

// https://astexplorer.net/#/KJ8AjD6maa
export function patchCommons(babel: typeof Babel): PluginObj {
  const t = babel.types

  return {
    name: 'transform-arrow-functions',
    visitor: {},
  }
}

export async function babelPluginPatchCommonsChunk(
  code: string,
): Promise<string | null | undefined> {
  const result = await transformAsync(code, {
    plugins: [patchCommons],
  })
  return result?.code
}
