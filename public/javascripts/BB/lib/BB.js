/**
 * Created by jaric on 01.12.2014.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require, exports, module) {

var BB = exports;

// Expose methods
    BB.FUNC2 = require('./BB/FUNC2');
    BB.MatMult = require('./BB/MatMult');
    BB.Datatone = require('./BB/Datatone');
    BB.BBstart = require('./BB/BBstart');
    BB.BBcount = require('./BB/BBcount');
    BB.BBup = require('./BB/BBup');

});
