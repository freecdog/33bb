/**
 * Created by jaric on 11.11.2014.
 */

(function(exports){

    var BBstart = require('./BBstart.js');
    var BBcount = require('./BBcount.js');

    function run(){
        BBstart.STARTPROC();
        BBcount.COUNTPROC();
    }
    exports.run = run;
})(typeof exports === 'undefined'? this['BBup']={} : exports);
