/**
 * Created by jaric on 25.02.2016.
 */

(function (angular){

    "use strict";

    console.log("jClientCalcControllers", angular);

    var jClientCalcControllers = angular.module('jClientCalcControllers', []);


    jClientCalcControllers.controller('jTrainingsController', ['$scope', function($scope) {

        init();

        function init(){
            console.log("controller init");
        }

    }]);

})(angular);