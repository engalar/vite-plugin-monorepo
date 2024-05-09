import { transform } from '@babel/core'

export function babelPluginPatchMxui(): void {
  transform('code();', {}, function (err, result) {
    console.log(result)
  })
}
