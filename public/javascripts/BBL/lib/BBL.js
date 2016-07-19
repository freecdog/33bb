/**
 * Created by jaric on 08.07.2016.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {

        //var BBL = exports;

        var BBL = {};

        // global on the server, window in the browser
        var root, previous_BBL;

        root = this;
        if (root != null) {
            previous_BBL = root.BBL;
        }

        // Expose methods
        BBL.Datatone = require('./BBL/Datatone');
        BBL.BBLup = require('./BBL/BBLup');
        BBL.FUNC2 = require('./BBL/FUNC2');
        BBL.MatMult = require('./BBL/MatMult');
        BBL.BBLstart = require('./BBL/BBLstart');
        BBL.BBLcount = require('./BBL/BBLcount');

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBL;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBL;
            });
        }
        // included directly via <script> tag
        else {
            root.BBL = BBL;
        }

    }());

});
