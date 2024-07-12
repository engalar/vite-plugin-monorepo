// eslint-disable-next-line import/no-nodejs-modules
import path from 'path'
// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs/promises'
import { describe, expect, test } from 'vitest'
import {
  babelPluginPatchCommonsChunk,
  babelPluginPatchIndexHtml,
  babelPluginPatchPageChunk,
} from '../reactClient'

describe('react-client', () => {
  test('page chunk', async () => {
    // read file content from file system ./lite.js
    const a = await fs.readFile(
        path.resolve(__dirname, './asset/react-client/a.Page.js'),
        'utf-8',
      ),
      b = await fs.readFile(
        path.resolve(__dirname, './asset/react-client/b.Page.js'),
        'utf-8',
      )

    expect(
      (await babelPluginPatchPageChunk(a, ['WengaoFileUpload'])) + '\n',
    ).toEqual(b)
  })
})
