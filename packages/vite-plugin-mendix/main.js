import {ReactFamily} from "@engalar/vite-plugin-mendix/ReactFamily";

window.ReactFamily = ReactFamily;

let originalMx;

Object.defineProperty(window, "mx", {
    get() {
        return originalMx;
    },
    set(newValue) {
        newValue._startup = newValue.startup;
        newValue.startup = async () => {
            /* await new Promise((resolve, reject) => {
                require(["dojo/aspect"], Aspect => {
                    window.Aspect = Aspect;
                    resolve();
                });
            }); */
        };
        originalMx = newValue;
    },
    configurable: true
});

let originalRequire;
Object.defineProperty(window, "dojoDynamicRequire", {
    get() {
        return originalRequire;
    },
    set(newValue) {
      originalRequire = function() {
        const e = arguments[0];
        // e is a string array
        if(e.length === 1 &&typeof e[0] == 'string'){
          const c = window.__internal[e[0]];
          if(c){
            arguments[1](c);
            return;
          }
        }
        newValue.apply(window,arguments);
      };
      originalRequire.baseUrl = newValue.baseUrl;
      originalRequire.on = newValue.on;
      originalRequire.cache = newValue.cache;
    },
    configurable: true
});

async function main() {
    await loadScript("mxui.js");
    await loadWidget("__PACKAGE_PATH__","__WIDGET_NAME__");
    mx._startup();
}
main();

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

async function loadWidget(packagePath,widgetName) {
    const modulePath = `http://localhost:5173/src/${widgetName}.__WIDGET_EXT__`;
    const widget = await import(/* @vite-ignore */ modulePath);
    const path = `widgets/${packagePath.replaceAll('.','/')}/${widgetName.toLowerCase()}/${widgetName}`;
    mendix.lang.registerInDojo(path, widget);
    // const path = `${packagePath}.${widgetName.toLowerCase()}.${widgetName}`;
    // mxui.widget[path]=widget.default||widget;
}
