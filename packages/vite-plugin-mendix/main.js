import React from "react";
import ReactDOM from "react-dom";
import ReactDOMClient from "react-dom/client";
import ReactDOMScheduler from "scheduler";
import RuntimeDev from "react/jsx-dev-runtime";
import Runtime from "react/jsx-runtime";

window.ReactFamily = { React, ReactDOM, Runtime, RuntimeDev, ReactDOMClient, ReactDOMScheduler };

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

async function main() {
    await loadScript("mxui.js");
    await loadWidget("AddressFinder");
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

async function loadWidget(widgetName) {
    const modulePath = `http://localhost:5173/src/${widgetName}.tsx`;
    const widget = await import(/* @vite-ignore */ modulePath);
    const path = `widgets/wengao/${widgetName.toLowerCase()}/${widgetName}`;
    mendix.lang.registerInDojo(path, widget[widgetName]);
}
