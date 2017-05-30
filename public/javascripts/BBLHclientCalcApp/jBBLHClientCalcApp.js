/**
 * Created by jaric on 30.05.2017.
 */

define(["angular"], function(angular){
    "use strict";

    console.log("angular is here:", angular);

    var jBBLHClientCalcApp = angular.module('jBBLHClientCalcApp', [
        "jBBLHClientCalcControllers"
    ]).config([function(){
        // app configuration goes here
    }]);
    console.log("jBBLHClientCalcApp", jBBLHClientCalcApp);

    return jBBLHClientCalcApp;
});
