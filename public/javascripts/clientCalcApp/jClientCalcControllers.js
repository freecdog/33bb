/**
 * Created by jaric on 25.02.2016.
 */

(function (angular, window){

    "use strict";

    console.log("jClientCalcControllers", angular);

    var jClientCalcControllers = angular.module('jClientCalcControllers', []);

    var calcCtrl = null;
    // method that is called by clientCalc.js after calculations have finished
    window.connectToApp = function(param){
        calcCtrl.drawMe(param);
    };

    jClientCalcControllers.controller('jClientCalcController', ['$scope', function($scope) {

        var self = this;
        init();

        function init(){
            calcCtrl = self;

            //self.dataNames = ['V1', 'V2', 'S11', 'S12', 'S22', 'V01', 'V02', 'S011', 'S012', 'S022'];
            self.dataNames = ['V1', 'V2', 'S11', 'S12', 'S22'];

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

    jClientCalcControllers.controller('TabController', function(){
        this.curTab = 2;

        this.setTab = function(tabIndex){
            this.curTab = tabIndex;
        };
        this.isSet = function(tabIndex){
            return this.curTab === tabIndex;
        };
    });

    jClientCalcControllers.filter('numberFilter', ['$filter', function ($filter) {
        return function (input) {
            var inputStr = input.toExponential().toString();
            if (input === 0) {
                return input;
            }else{
                var eIndex = inputStr.indexOf("e");
                var ans = inputStr;
                if (eIndex){
                    ans = inputStr.substr(0, 6) + inputStr.substr(eIndex, inputStr.length - eIndex);
                }
                return ans;
            }
        };
    }]);

})(angular, window);