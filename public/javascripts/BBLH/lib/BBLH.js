/**
 * Created by jaric on 30.05.2017.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {

        //var BBLH = exports;

        var BBLH = {};

        // global on the server, window in the browser
        var root, previous_BBLH;

        root = this;
        if (root != null) {
            previous_BBLH = root.BBLH;
        }

        // Expose methods
        BBLH.Datatone = require('./BBLH/Datatone');
        BBLH.BBLHup = require('./BBLH/BBLHup');
        BBLH.FUNC2 = require('./BBLH/FUNC2');
        BBLH.MatMult = require('./BBLH/MatMult');
        BBLH.BBLHstart = require('./BBLH/BBLHstart');
        BBLH.BBLHcount = require('./BBLH/BBLHcount');
        BBLH.BBLHstatic = require('./BBLH/BBLHstatic');

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBLH;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBLH;
            });
        }
        // included directly via <script> tag
        else {
            root.BBLH = BBLH;
        }

    }());

});
