/* @preserve
Copyright (c) 2005-2024, Mendix BV. All rights reserved.
See mxclientsystem/licenses.txt for third party licenses that apply.
*/

require(['dojo/sniff', 'dojo/_base/lang'], (e, t) =>
  (() => {
    var A,
      P,
      D = {
        4448: (e, t, n) => {
          /**
           * @license React
           * react-dom.production.min.js
           *
           * Copyright (c) Facebook, Inc. and its affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           */
          var r = n(7294),
            i = n(3840)
        },
        5251: (e, t, n) => {
          /**
           * @license React
           * react-jsx-runtime.production.min.js
           *
           * Copyright (c) Facebook, Inc. and its affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           */
          var r = n(7294),
            i = Symbol.for('react.element'),
            o = Symbol.for('react.fragment')
        },
        2408: (e, t) => {
          /**
           * @license React
           * react.production.min.js
           *
           * Copyright (c) Facebook, Inc. and its affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           */
          var n = Symbol.for('react.element')
        },
        53: (e, t) => {
          /**
           * @license React
           * scheduler.production.min.js
           *
           * Copyright (c) Facebook, Inc. and its affiliates.
           *
           * This source code is licensed under the MIT license found in the
           * LICENSE file in the root directory of this source tree.
           */
          var n = n || {}
        },
        7112: (e) => {
          e.exports = w
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
      },
      4296: (e,t,n)=>{
            n.r(t),
            n.d(t, {
                arrayFromObject: ()=>v,
                capitalize: ()=>E,
                clone: ()=>w,
                collect: ()=>d,
                curry: ()=>s,
                curryN: ()=>c,
                find: ()=>f,
                findIndex: ()=>p,
                findLast: ()=>h,
                firstKey: ()=>S,
                flatten: ()=>g,
                forEach: ()=>a,
                getFileError: ()=>j,
                getUniqueId: ()=>O,
                groupBy: ()=>b,
                mapObject: ()=>o,
                objectFromArray: ()=>y,
                objectIsEmpty: ()=>_,
                registerInDojo: ()=>k,
                sequence: ()=>u,
                toArray: ()=>m,
                unique: ()=>C,
                waitUntilPredicateHolds: ()=>x
            });
            var r = n(8157)
              , i = 0;
            function o(e, t) {
                let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
                return Object.keys(e).reduce((function(r, i) {
                    return r[i] = t.call(n, e[i], i),
                    r
                }
                ), {})
            }
            function k(e, t) {
                window.dojoDynamicRequire.cache[e] = function() {
                    window.define([], (function() {
                        return t
                    }
                    ))
                }
            }
        }
    },
    I = {};
  return 1;
})());
