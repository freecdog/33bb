/**
 * Created by jaric on 11.11.2014.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    var BB1 = require('BB');
    var fk = 123123;

    (function () {
    //(function(exports){

        var BBup = {};

        var BB = require('../BB');
        var BBstart = BB.BBstart;
        var BBcount = BB.BBcount;
        //var BBstart = require('./BBstart.js');
        //var BBcount = require('./BBcount.js');

        function run(){
            var startTime = Date.now();

            BBstart.STARTPROC();
            BBcount.COUNTPROC();

            console.log((Date.now() - startTime) + " ms to count all data in BBup.run()");
        }
        BBup.run = run;
        //exports.run = run;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBup;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBup;
            });
        }
        // included directly via <script> tag
        else {
            root.BBup = BBup;
        }

    }());
    //})(typeof exports === 'undefined'? this['BBup']={} : exports);

});
