/**
 * Created by jaric on 25.02.2016.
 */

(function (angular, window){

    "use strict";

    console.log("jClientCalcControllers", angular);

    var jClientCalcControllers = angular.module('jClientCalcControllers', []);

    var calcCtrl = null;
    window.connectToApp = function(param){
        calcCtrl.drawMe(param);
    };

    jClientCalcControllers.controller('jClientCalcController', ['$scope', function($scope) {

        var self = this;
        init();

        function init(){
            calcCtrl = self;
            console.log("controller init");
        }

        function drawMe(param){
            console.log("hey, I see you've started to do something and we have a param here:", param);

            self.data = param;

            $scope.$apply();
            //$scope.$digest();
        }
        this.drawMe = drawMe;

    }]);

})(angular, window);