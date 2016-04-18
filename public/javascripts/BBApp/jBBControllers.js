/**
 * Created by jaric on 17.04.2016.
 */

(function (angular, window){

    "use strict";

    console.log("jBBControllers", angular);

    var jBBControllers = angular.module('jBBControllers', []);

    jBBControllers.controller('jBBController', ['$scope', '$window', function($scope, $window) {

        var self = this;
        init();

        function init(){

        }

        var isLoading = true;
        function getLoading(){
            //console.log("asking loading", isLoading);
            return isLoading;
        }
        this.getLoading = getLoading;

        function setLoading(state){
            //console.log("change state to:", state);
            isLoading = state;
            $scope.$digest();
        }
        this.setLoading = setLoading;
        $window.setLoading = setLoading;

        function getDrawning(){
            return $window.startDrawing;
        }
        this.getDrawning = getDrawning;
    }]);

})(angular, window);