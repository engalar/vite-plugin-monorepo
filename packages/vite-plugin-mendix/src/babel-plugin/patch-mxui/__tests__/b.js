// patched by vite-plugin-mendix
/* @preserve
Copyright (c) 2005-2024, Mendix BV. All rights reserved.
See mxclientsystem/licenses.txt for third party licenses that apply.
*/

require(['dojo/sniff', 'dojo/_base/lang'], (e, t) => (() => {
  var A,
    P,
    D = {
      4448: (e, t, n) => {
        e.exports = ReactFamily.ReactDOM;
      },
      5251: (e, t, n) => {
        e.exports.Fragment = ReactFamily.RuntimeDev.Fragment;
        e.exports.jsx = ReactFamily.RuntimeDev.jsxDEV;
        e.exports.jsxs = ReactFamily.Runtime.jsxs;
      },
      2408: (e, t) => {
        e.exports = ReactFamily.React;
      },
      53: (e, t) => {
        e.exports = ReactFamily.ReactDOMScheduler;
      },
      7112: e => {
        e.exports = w;
      }
    },
    I = {};
  return 1;
})());
