/**
 * Created by jaric on 13.07.2016.
 */

define(["angular"], function(angular){
    "use strict";

    console.log("angular is here:", angular);

    var jBBLApp = angular.module('jBBLApp', [
        "jBBLControllers"
    ]).config([function(){
        // app configuration goes here
    }]);
    console.log("jBBLApp", jBBLApp);

    return jBBLApp;
});
