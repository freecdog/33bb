/**
 * Created by jaric on 13.11.2014.
 */

(function(exports){

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

    exports.Datatone = Singletone;
})(typeof exports === 'undefined'? this['Datatone']={} : exports);
