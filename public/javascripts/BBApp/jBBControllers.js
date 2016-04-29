/**
 * Created by jaric on 17.04.2016.
 */

(function (angular, window){

    "use strict";

    console.log("jBBControllers", angular);

    var jBBControllers = angular.module('jBBControllers', []);

    window.dataNames = ["V_1", "V_2", "S11", "S22", "S12"];

    jBBControllers.controller('jBBLoaderController', ['$scope', '$http', '$window', function($scope, $http, $window) {
        var self = this;
        init();

        var url = $window.location.href;
        var addressArr = url.split("/");

        function init(){
            console.log('jBBLoaderController is here');
            console.warn('there should be a search option, see jade file');

            $http({
                method: 'GET',
                //url: addressArr[0] + "//" + addressArr[2] + '/filesList'
                url: '/filesList'
            }).then(function successCallback(response) {
                self.allFiles = response.data.allFiles;
                console.warn(response, self.allFiles);
            }, function errorCallback(response) {
                console.error(response);
            });
        }
    }]);

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
            self.dataNames = $window.dataNames;
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

    jBBControllers.controller('jBBDataController', ['$scope', '$window', function($scope, $window) {
        var self = this;
        init();

        var BB, data;

        function init(){
            self.visible = false;

            BB = {};
            data = {};

            self.currentTabIndex = 2;
            self.dataNames = $window.dataNames;
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

        function getDecimal(num) {
            return num > 0 ? (num % 1) : (-num % 1);
        }
        function setDisplayData(visibility){
            self.visible = visibility;

            updateBBData();

            // data.memOut[layer][time][radius][angle]
            var limitedData = [];
            data.limitedData = limitedData;

            var radiusValues = [];
            data.radiusValues = radiusValues;
            var timeValues = [];
            data.timeValues = timeValues;
            for (var layer in data.memOut){
                var curLayer = [];
                limitedData.push(curLayer);

                for (var time in data.memOut[layer]){
                    var timeValue = getTimeByTimeIndex(time);//time * data.STEP;
                    if (getDecimal(timeValue) !== 0) continue;
                    timeValues.push(timeValue.toFixed(2));

                    var curTime = [];
                    curLayer.push(curTime);

                    for (var radius in data.memOut[layer][time]){
                        var radiusValue = radius * data.STEPX;
                        if (getDecimal(radiusValue) !== 0) continue;
                        radiusValues.push(radiusValue);

                        var curRadius = [];
                        curTime.push(curRadius);

                        for (var angle in data.memOut[layer][time][radius]){
                            curRadius.push(data.memOut[layer][time][radius][angle].toFixed(6));
                        }
                    }
                }
            }
            console.log("limitedData:", limitedData);

            var timeBeforeDigest = Date.now();
            $scope.$digest();
            console.log(((Date.now() - timeBeforeDigest)/1000).toFixed(2) + "s to $digest()");
        }
        this.setDisplayData = setDisplayData;
        $window.setDisplayData = setDisplayData;

    }]);

})(angular, window);