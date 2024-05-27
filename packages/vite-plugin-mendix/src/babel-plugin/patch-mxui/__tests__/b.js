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
      },
      4296: (e, t, n) => {
        Object.defineProperty(t, "__esModule", {
          value: !0
        }), t.arrayFromObject = function (e) {
          return Object.keys(e).map(function (t) {
            return [t, e[t]];
          });
        }, t.objectIsEmpty = function (e) {
          for (var t in e) return !1;
          return !0;
        }, t.registerInDojo = function (e, t) {
          window.__internal = window.__internal || {};
          window.__internal[e] = t;
          window.dojoDynamicRequire.cache[e] = function () {
            window.define([], function () {
              return t;
            });
          };
        }, t.sequence = function (e, t, n) {
          if (t && "object" == typeof t && (n = t, t = null), !(e instanceof Array)) throw new Error("mendix/lang.sequence: sequence is not an array");
          var r,
            i,
            o,
            a = 0,
            s = function () {
              r = !0, i && o();
            };
          (o = function () {
            for (; a < e.length;) {
              r = !1, i = !1;
              var o = e[a++];
              if ("function" == typeof o) o.call(n, s);else {
                if (!n || "function" != typeof n[o]) throw new Error("mendix/lang.sequence: #" + a + " is not a function");
                n[o](s);
              }
              if (!r) return void (i = !0);
            }
            t && t.call(n);
          })();
        };
      }
    },
    I = {};
  return 1;
})());
