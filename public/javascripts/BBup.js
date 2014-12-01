/**
 * Created by jaric on 11.11.2014.
 */

var clientSide = typeof exports === 'undefined';

(function () {
//(function(exports){

    var BBup = {};

    //var BBstart = require('./BBstart.js');
    //var BBcount = require('./BBcount.js');
    var BBstart;
    var BBcount;
    if (!clientSide){
        BBstart = require('./BBstart.js');
        BBcount = require('./BBcount.js');
    }

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
