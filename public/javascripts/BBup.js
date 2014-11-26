/**
 * Created by jaric on 11.11.2014.
 */

var clientSide = typeof exports === 'undefined' ? true : false;

(function(exports){

    var BBstart = require('./BBstart.js');
    var BBcount = require('./BBcount.js');

    function run(){
        var startTime = Date.now();

        BBstart.STARTPROC();
        BBcount.COUNTPROC();

        console.log((Date.now() - startTime) + " ms to count all data in BBup.run()");
    }
    exports.run = run;
})(typeof exports === 'undefined'? this['BBup']={} : exports);
