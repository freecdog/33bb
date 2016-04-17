/**
 * Created by jaric on 17.04.2016.
 */

(function (angular){

    "use strict";

    console.log("angular is here:", angular);

    var jBBApp = angular.module('jBBApp', [
        'jBBControllers'
    ]);
    console.log("jBBApp", jBBApp);

})(angular);