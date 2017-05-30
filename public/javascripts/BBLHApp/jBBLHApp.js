/**
 * Created by jaric on 30.05.2017.
 */

define(["angular"], function(angular){
    "use strict";

    console.log("angular is here:", angular);

    var jBBLHApp = angular.module('jBBLHApp', [
        "jBBLHControllers", "ui.bootstrap"
    ]).config([function(){
        // app configuration goes here
    }]);
    console.log("jBBLHApp", jBBLHApp);

    return jBBLHApp;
});
