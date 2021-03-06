/**
 * Created by jaric on 11.11.2014.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {
        //(function(exports) {
        var BBup = {};

        // global on the server, window in the browser
        var root, previous_BBup;

        root = this;
        if (root != null) {
            previous_BBup = root.BBup;
        }

        function run(params, callback) {
            callback = callback || function(){};

            var BB = require('../BB');
            var BBstart = BB.BBstart;
            var BBcount = BB.BBcount;

            var data = (new BB.Datatone());
            data.status = {};
            data.status.startTime = Date.now();
            data.status.active = true;

            BBstart.STARTPROC(params, function(){
                BBcount.COUNTPROC(function(){
                    data.status.active = false;
                    data.status.finishTime = Date.now();
                    data.status.duration = data.status.finishTime - data.status.startTime;

                    console.log(data.status.duration.toString() + " ms to count all data in BBup.run()");

                    callback();
                });
            });
        }
        BBup.run = run;

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

});


/*if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

    (function () {
    //(function(exports){

        var BBup = {};

        // global on the server, window in the browser
        var root, previous_BBup;

        root = this;
        if (root != null) {
            previous_BBup = root.BBup;
        }

        var BB = require('../BB');
        //var BBstart = BB.BBstart;
        //var BBcount = BB.BBcount;

        //var BBstart = require('./BBstart.js');
        //var BBcount = require('./BBcount.js');

        function run(){
            var startTime = Date.now();

            //BBstart.STARTPROC();
            //BBcount.COUNTPROC();

            console.log((Date.now() - startTime) + " ms to count all data in BBup.run()");
        }
        BBup.run = run;
        //exports.run = run;

        BBup.recVar = {num: 0.89};

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

});*/


