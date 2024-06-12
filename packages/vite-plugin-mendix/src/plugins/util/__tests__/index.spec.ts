// eslint-disable-next-line import/no-nodejs-modules
import path from 'path'
// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs/promises'
import { describe, expect, test } from 'vitest'
import { babelPluginPatchMxui, match } from '../babel'

describe('babelPluginPatchMxui', () => {
  test('mxui lite.js', async () => {
    // read file content from file system ./lite.js
    const a = await fs.readFile(
        path.resolve(__dirname, './asset/a.js'),
        'utf-8',
      ),
      b = await fs.readFile(path.resolve(__dirname, './asset/b.js'), 'utf-8')

    expect((await babelPluginPatchMxui(a)) + '\n').toEqual(b)
  })

  test('signal to patch comment', () => {
    const code = `'*
           * @license React
           * react-dom.production.min.js
           *
           * Copyright (c) Facebook, Inc. and its affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           '`
    const [isMatch, matched] = match(code)
    expect(isMatch).toBe(true)
    expect(matched).toBe('react-dom')
  })

  test('signal to patch comment', () => {
    const code = `'*
           *@license React
           *   react.production.min.js
           *
           * Copyright (c) Facebook, Inc. and its affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           '`
    const [isMatch, matched] = match(code)
    expect(isMatch).toBe(true)
    expect(matched).toBe('react')
  })
})
