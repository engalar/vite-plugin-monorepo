// eslint-disable-next-line import/no-nodejs-modules
import path from 'path'
// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs/promises'
import { describe, expect, test } from 'vitest'
import { babelPluginPatchMxui } from '..'

describe('babelPluginPatchMxui', () => {
  test('adds 1 + 2 to equal 5', async () => {
    expect(await babelPluginPatchMxui('var a = () => {};')).toBe(
      'var a = function () {};',
    )
  })

  test('mxui lite.js', async () => {
    // read file content from file system ./lite.js
    const a = await fs.readFile(path.resolve(__dirname, './a.js'), 'utf-8'),
      b = await fs.readFile(path.resolve(__dirname, './b.js'), 'utf-8')

    expect(await babelPluginPatchMxui(a)).toBe(b)
  })
})
