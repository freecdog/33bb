/**
 * Created by jaric on 13.11.2014.
 */

(function () {
//(function(exports){

    var Datatone = {};

    // https://github.com/podgorniy/javascript-toolbox/blob/master/singletone.js
    var Singletone = (function () {
        var instance;

        return function Construct_singletone () {
            if (instance) {
                return instance;
            }
            if (this && this.constructor === Construct_singletone) {
                instance = this;
            } else {
                return new Construct_singletone();
            }
        };
    }());

    Datatone.Datatone = Singletone;
    //exports.Datatone = Singletone;

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Datatone;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return Datatone;
        });
    }
    // included directly via <script> tag
    else {
        root.Datatone = Datatone;
    }

}());
//})(typeof exports === 'undefined'? this['Datatone']={} : exports);
