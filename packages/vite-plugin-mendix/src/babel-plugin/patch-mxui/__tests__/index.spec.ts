import { describe, expect, test } from 'vitest'
import { babelPluginPatchMxui } from '..'

describe('babelPluginPatchMxui', () => {
  test('adds 1 + 2 to equal 5', () => {
    expect(babelPluginPatchMxui()).toBeUndefined()
  })
})
