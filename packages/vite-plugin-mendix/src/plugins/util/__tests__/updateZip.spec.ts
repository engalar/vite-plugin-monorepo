// eslint-disable-next-line import/no-nodejs-modules
import fs from 'fs'
// eslint-disable-next-line import/no-nodejs-modules
import path from 'path'
import { describe, expect, test } from 'vitest'
import { updateZip } from '../updateZip'

describe('updateZip', () => {
  test('updateZip', async () => {
    // prepare myDummy.zip from myZip.zip

    const sourceFilePath = path.resolve(__dirname, './asset/myZip.zip')
    const targetFilePath = path.resolve(__dirname, './asset/myDummy.zip')
    const xmlFilePath = path.resolve(__dirname, './asset/myXml.xml')

    fs.writeFileSync(targetFilePath, fs.readFileSync(sourceFilePath))
    await updateZip(xmlFilePath, targetFilePath, 'myXml.xml')
    //clean up
    fs.rmSync(targetFilePath)
  })
})
