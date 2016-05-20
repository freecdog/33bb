/**
 * Created by jaric on 25.02.2016.
 */

//(function (angular){
//
//    "use strict";
//
//    console.log("angular is here:", angular);
//
//    var jClientCalcApp = angular.module('jClientCalcApp', [
//        'jClientCalcControllers'
//    ]);
//    console.log("jClientCalcApp", jClientCalcApp);
//
//
//})(angular);

define(["angular"], function(angular){
    "use strict";

    console.log("angular is here:", angular);

    var jClientCalcApp = angular.module('jClientCalcApp', [
        "jClientCalcControllers"
    ]).config([function(){
        // app configuration goes here
    }]);
    console.log("jClientCalcApp", jClientCalcApp);

    return jClientCalcApp;
});
