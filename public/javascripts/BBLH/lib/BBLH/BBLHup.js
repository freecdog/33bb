/**
 * Created by jaric on 30.05.2017.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {
        //(function(exports) {
        var BBLHup = {};

        // global on the server, window in the browser
        var root, previous_BBLHup;

        root = this;
        if (root != null) {
            previous_BBLHup = root.BBLHup;
        }

        function run(params, callback) {
            callback = callback || function(){};

            var BBLH = require('../BBLH');
            var BBLHstart = BBLH.BBLHstart;
            var BBLHcount = BBLH.BBLHcount;
            var BBLHstatic = BBLH.BBLHstatic;

            var data = (new BBLH.Datatone());
            data.status = {};
            data.status.startTime = Date.now();
            data.status.active = true;

            data.status.isSTARTPROC = true;
            BBLHstart.STARTPROC(params, function(){
                data.status.isSTARTPROC = false;
                data.status.isCalcStatic = true;

                BBLHstatic.CalcStatic(function(){
                    data.status.isCalcStatic = false;
                    data.status.isCOUNTPROC = true;

                    BBLHcount.COUNTPROC(function(){
                        data.status.isCOUNTPROC = false;

                        data.status.active = false;
                        data.status.finishTime = Date.now();
                        data.status.duration = data.status.finishTime - data.status.startTime;

                        console.log(data.status.duration.toString() + " ms to count all data in BBLHup.run()");

                        callback();
                    });
                });
            });

        }
        BBLHup.run = run;

        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = BBLHup;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return BBLHup;
            });
        }
        // included directly via <script> tag
        else {
            root.BBLHup = BBLHup;
        }

    }());

});
