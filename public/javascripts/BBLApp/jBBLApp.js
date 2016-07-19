/**
 * Created by jaric on 13.07.2016.
 */

(function (angular){

    "use strict";

    console.log("angular is here:", angular);

    var jBBLApp = angular.module('jBBLApp', [
        'jBBLControllers'
    ]);
    console.log("jBBLApp", jBBLApp);

})(angular);