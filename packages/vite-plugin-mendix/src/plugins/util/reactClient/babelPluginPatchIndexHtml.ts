export async function babelPluginPatchIndexHtml(
  code: string,
): Promise<string | null | undefined> {
  if (code.includes('src="dist/index.js"')) {
    // insert the following code after the opening <head> tag
    code = code.replace(
      /<head>/i,
      `<head><script type="module">
      import RefreshRuntime from 'http://localhost:5173/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <script type="module" src="http://localhost:5173/@vite/client"></script>`,
    )
  }
  return code
}
