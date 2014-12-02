/**
 * Created by jaric on 01.12.2014.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {

        //var BB = exports;

        var BB = {};

        // global on the server, window in the browser
        var root, previous_BB;

        root = this;
        if (root != null) {
            previous_BB = root.BB;
        }

        // Expose methods
        BB.BBup = require('./BB/BBup');
        BB.FUNC2 = require('./BB/FUNC2');
        BB.MatMult = require('./BB/MatMult');
        BB.Datatone = require('./BB/Datatone');
        BB.BBstart = require('./BB/BBstart');
        BB.BBcount = require('./BB/BBcount');

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BB;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BB;
            });
        }
        // included directly via <script> tag
        else {
            root.BB = BB;
        }

    }());

});
