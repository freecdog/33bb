/**
 * Created by jaric on 08.07.2016.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {
        //(function(exports) {
        var BBLup = {};

        // global on the server, window in the browser
        var root, previous_BBLup;

        root = this;
        if (root != null) {
            previous_BBLup = root.BBLup;
        }

        function run(params, callback) {
            callback = callback || function(){};

            var BBL = require('../BBL');
            var BBLstart = BBL.BBLstart;
            var BBLcount = BBL.BBLcount;

            var data = (new BBL.Datatone());
            data.status = {};
            data.status.startTime = Date.now();
            data.status.active = true;

            BBLstart.STARTPROC(params, function(){
                BBLcount.COUNTPROC(function(){
                    data.status.active = false;
                    data.status.finishTime = Date.now();
                    data.status.duration = data.status.finishTime - data.status.startTime;

                    console.log(data.status.duration.toString() + " ms to count all data in BBLup.run()");

                    callback();
                });
            });
        }
        BBLup.run = run;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBLup;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBLup;
            });
        }
        // included directly via <script> tag
        else {
            root.BBLup = BBLup;
        }

    }());

});
