/**
 * Created by jaric on 13.07.2016.
 */

define(["angular"], function(angular){
    "use strict";

    console.log("angular is here:", angular);

    var jBBLClientCalcApp = angular.module('jBBLClientCalcApp', [
        "jBBLClientCalcControllers"
    ]).config([function(){
        // app configuration goes here
    }]);
    console.log("jBBLClientCalcApp", jBBLClientCalcApp);

    return jBBLClientCalcApp;
});
