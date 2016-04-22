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

    jBBControllers.controller('jBBControlPointsController', ['$scope', '$window', function($scope, $window) {

        var self = this;
        init();

        var BB, data;

        function init(){
            self.visible = false;

            BB = {};
            data = {};

            self.currentTabIndex = 2;
            self.dataNames = ["V_1", "V_2", "S11", "S22", "S12"];
        }

        var stepsBeforeT0 = Math.round(data.XDESTR * 1.1 / data.STEPX);
        var stepsAfterT0 = Math.round(data.TM/data.STEP);
        var altTimeStepsCount = stepsBeforeT0 + stepsAfterT0;
        function getTimeByTimeIndex(timeIndex){
            var realTime = 0;

            if (timeIndex < stepsBeforeT0){
                realTime = timeIndex * data.STEPX - data.XDESTR*1.1;
            } else {
                realTime = ((timeIndex - stepsBeforeT0) * data.STEP);
            }
            return realTime;
        }
        this.getTimeByTimeIndex = getTimeByTimeIndex;

        function isSet(index){
            return index === self.currentTabIndex;
        }
        this.isSet = isSet;

        function setTab(index){
            self.currentTabIndex = index;
        }
        this.setTab = setTab;

        function updateBBData(){
            BB = require('BB');
            data = new BB.Datatone();
            console.log("here is data", data);

            self.data = data;

            stepsBeforeT0 = Math.round(data.XDESTR * 1.1 / data.STEPX);
            stepsAfterT0 = Math.round(data.TM/data.STEP);
            altTimeStepsCount = stepsBeforeT0 + stepsAfterT0;
        }

        function setControlPointsData(visibility){
            self.visible = visibility;

            updateBBData();

            var ctrlPoints = [];    // ctrlPoints[index][layer][time] -> value
            self.ctrlPoints = ctrlPoints;

            for (var ctrlPointIndex = 0; ctrlPointIndex < data.controlPoints.length; ctrlPointIndex++) {
                var ctrlPointData = [];
                ctrlPoints[ctrlPointIndex] = ctrlPointData;

                var nearestPoint = data.nearestPoints[ctrlPointIndex][0];   // [0..3]
                //var nearestValue = data.memOut[][cT][nearestPoint.radiusStepIndex][nearestPoint.angleStepIndex];

                for (var dataLayerIndex = 0; dataLayerIndex < data.memOut.length; dataLayerIndex++) {
                    var ctrlLayer = [];
                    ctrlPointData[dataLayerIndex] = ctrlLayer;

                    for (var cT = 0; cT < data.memOut[dataLayerIndex].length; cT++) {
                        // TODO interpolate value
                        var value = data.memOut[dataLayerIndex][cT][nearestPoint.radiusStepIndex][nearestPoint.angleStepIndex];
                        ctrlLayer[cT] = value;
                    }
                }
            }

            $scope.$digest();
        }
        this.setControlPointsData = setControlPointsData;
        $window.setControlPointsData = setControlPointsData;

    }]);

})(angular, window);