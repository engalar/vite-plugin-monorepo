async function main() {
    const { default: RefreshRuntime } = await import("/@react-refresh");

    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => type => type;
    window.__vite_plugin_react_preamble_installed__ = true;

    await import("/main.js");
}

main();
