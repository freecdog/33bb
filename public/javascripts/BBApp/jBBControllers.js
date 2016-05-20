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
        var progressBarHolder, progressBar;

        init();

        function init(){
            progressBarHolder = document.getElementById("progressBarHolder");
            progressBar = document.getElementById("progressBar");
        }

        var isLoading = true;
        function getLoading(){
            //console.log("asking loading", isLoading);
            return isLoading;
        }
        this.getLoading = getLoading;

        function setLoading(state, percentLoaded){
            //console.log("change state to:", state);
            isLoading = state;

            if (progressBar) progressBar.style.width = percentLoaded.toString() + "%";

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
        var BB, data;

        var charts;

        init();

        function init(){
            self.visible = false;

            BB = {};
            data = {};

            self.currentTabIndex = 2;
            self.dataNames = $window.dataNames;

            charts = [];
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

            initCharts(data, ctrlPoints);

            $scope.$digest();
        }
        this.setControlPointsData = setControlPointsData;
        $window.setControlPointsData = setControlPointsData;

        function initCharts(data, ctrlPoints){
            console.log("initCharts");

            Chart.defaults.global.defaultFontColor = '#aaaaaa';

            if (ctrlPoints.length > 0) {

                if (charts.length > 0) {
                    //waveShapeChartData.labels = timeSteps;
                    //waveShapeChartData.datasets[0].data = valueSteps;
                    //waveShapeChartObject.update();
                } else {

                    // color.adobe.com Honey Pot
                    var colorsPresets = [
                        "rgba(16,91,99,1)",
                        "rgba(255,250,213,1)",
                        "rgba(255,211,78,1)",
                        "rgba(219,158,54,1)",
                        "rgba(189,73,50,1)"
                    ];

                    var timeLabels = [];
                    for (var ti = 0; ti < ctrlPoints[0][0].length; ti++) {
                        timeLabels.push(getTimeByTimeIndex(ti).toFixed(2));
                    }

                    var datasetTemplate = {
                        label: "datasetName",
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        //data: [Math.random(),Math.random(),Math.random()]
                        data: [Math.random(), Math.random(), Math.random()]
                    };

                    for (var i = 0; i < data.memOut.length; i++) {
                        var shapeDomObject, shapeChartData, shapeChartOptions, shapeChartObject;

                        shapeDomObject = document.getElementById("diagramCP" + i.toString());
                        shapeChartData = {
                            //labels: [1,2,3],
                            labels: timeLabels,
                            datasets: []
                        };

                        for (var j = 0; j < ctrlPoints.length; j++) {
                            var pointDataset = angular.copy(datasetTemplate);

                            pointDataset.label = "P" + j.toString() + " (R: " + data.controlPoints[j].radius.toString() + ", Theta: " + data.controlPoints[j].angle.toString() + ")";
                            var pointColor = colorsPresets[j % colorsPresets.length];
                            pointDataset.backgroundColor = pointColor;
                            pointDataset.borderColor = pointColor;
                            pointDataset.pointBorderColor = pointColor;
                            pointDataset.pointHoverBackgroundColor = pointColor;
                            pointDataset.pointHoverBorderColor = pointColor;

                            pointDataset.data = ctrlPoints[j][i];
                            shapeChartData.datasets.push(pointDataset);
                        }

                        shapeChartOptions = {};
                        shapeChartObject = Chart.Line(shapeDomObject, {
                            data: shapeChartData,
                            options: shapeChartOptions
                        });

                        charts.push({
                            shapeDomObject: shapeDomObject,
                            shapeChartData: shapeChartData,
                            shapeChartOptions: shapeChartOptions,
                            shapeChartObject: shapeChartObject
                        });
                    }

                }
            } else {
                console.log("no charts because of lack of control points:", ctrlPoints);
            }

        }

    }]);

    jBBControllers.controller('jBBDataController', ['$scope', '$window', function($scope, $window) {
        var self = this;

        var BB, data;

        init();

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

    jBBControllers.controller('jBBEpureController', ['$scope', '$window', function($scope, $window) {
        var self = this;

        var BB, data;

        var waveShapeDomObject, waveShapeChartData, waveShapeChartOptions, waveShapeChartObject;

        init();

        function init(){
            self.visible = false;

            BB = {};
            data = {};
        }

        function updateBBData(){
            BB = require('BB');
            data = new BB.Datatone();
            console.log("here is data", data);

            self.data = data;
        }

        function setEpureData(visibility){
            self.visible = visibility;

            updateBBData();

            initWaveShape(data);

            $scope.$digest();
        }
        this.setEpureData = setEpureData;
        $window.setEpureData = setEpureData;

        function initWaveShape(data){

            Chart.defaults.global.defaultFontColor = '#fff';

            var userData = data.inputData;

            var timeSteps = [];
            var valueSteps = [];

            if (userData.EPUR == 0){
                for (var j = -data.XDESTR ; j <= Math.floor(data.TM); j++){
                    timeSteps.push(j);
                    valueSteps.push( j >= 0 ? 1 : 0 );
                }
            } else {
                var dataStep = 1;
                if (userData.EPUR == 2) dataStep = 10;

                for (var i = 0; i < data.waveEpure.length; i = i + dataStep){
                    timeSteps.push(data.waveEpure[i].T);
                    valueSteps.push(data.waveEpure[i].value);
                }
            }

            if (waveShapeDomObject){
                waveShapeChartData.labels = timeSteps;
                waveShapeChartData.datasets[0].data = valueSteps;
                waveShapeChartObject.update();
            } else {
                waveShapeDomObject = document.getElementById("waveShape");
                waveShapeChartData = {
                    labels: timeSteps,
                    datasets: [
                        {
                            label: "Wave diagram S(T)",
                            fill: false,
                            lineTension: 0.1,
                            backgroundColor: "rgba(75,192,192,0.4)",
                            borderColor: "rgba(75,192,192,1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(75,192,192,1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 1,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: "rgba(75,192,192,1)",
                            pointHoverBorderColor: "rgba(220,220,220,1)",
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 10,
                            data: valueSteps
                        }
                    ]
                };
                waveShapeChartOptions = {};
                waveShapeChartObject = Chart.Line(waveShapeDomObject, {
                    data: waveShapeChartData,
                    options: waveShapeChartOptions
                });
            }
        }

    }]);

})(angular, window);