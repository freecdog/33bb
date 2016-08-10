/**
 * Created by jaric on 13.07.2016.
 */

(function (angular, window){

    "use strict";

    console.log("jBBLControllers", angular);

    var jBBLControllers = angular.module('jBBLControllers', []);

    window.dataNames = ["V_1", "V_2", "S11", "S22", "S12"];
    function mobileAndTabletcheck() {
        // http://stackoverflow.com/a/11381730
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    jBBLControllers.controller('jBBLLoaderController', ['$scope', '$http', function($scope, $http) {
        var self = this;
        init();

        function init(){
            console.log('jBBLLoaderController is here');
            console.warn('there should be a search option, see jade file');

            self.filesLoaded = false;

            $http({
                method: 'GET',
                url: '/BBLfilesList'
            }).then(function successCallback(response) {
                self.allFiles = response.data.allFiles;
                self.allFilesSTR = [];
                for (var i = 0; i < self.allFiles.length; i++) self.allFilesSTR.push(self.allFiles[i].path);
                console.warn(response, self.allFiles, self.allFilesSTR);

                self.filesLoaded = true;
            }, function errorCallback(response) {
                console.error(response);
            });
        }

        self.searchString = "";
        $scope.$watch(function(){
            return self.searchString;
        }, function() {
            console.log(self.searchString);
        });

    }]);

    jBBLControllers.controller('jBBLController', ['$scope', '$window', function($scope, $window) {
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

    jBBLControllers.controller('jBBLControlPointsController', ['$scope', '$window', function($scope, $window) {
        var self = this;
        var BBL, data;

        var charts;

        init();

        function init(){
            self.visible = false;

            BBL = {};
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

        function updateBBLData(){
            BBL = require('BBL');
            data = new BBL.Datatone();
            console.log("here is data", data);

            self.data = data;

            stepsBeforeT0 = Math.round(data.XDESTR * 1.1 / data.STEPX);
            stepsAfterT0 = Math.round(data.TM/data.STEP);
            altTimeStepsCount = stepsBeforeT0 + stepsAfterT0;
        }

        function setControlPointsData(visibility, invert){
            invert = invert || false;

            self.visible = visibility;

            updateBBLData();

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
                        if (invert) value *= -1;
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

                // color.adobe.com Circus III, Honey Pot and others
                var colorsPresets = [
                    "rgba(255,31,61,1)",
                    "rgba(91,227,227,1)",
                    "rgba(83,219,80,1)",
                    "rgba(202,57,149,1)",
                    //"rgba(255,220,0,1)", yellow
                    "rgba(21,16,240,1)"

                    //"rgba(46,9,39,1)",
                    //"rgba(217,0,0,1)",
                    //"rgba(255,45,0,1)",
                    //"rgba(255,140,0,1)",
                    //"rgba(4,117,111,1)"

                    //"rgba(16,91,99,1)",
                    //"rgba(255,250,213,1)",
                    //"rgba(255,211,78,1)",
                    //"rgba(219,158,54,1)",
                    //"rgba(189,73,50,1)"
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

                if (charts.length > 0) {
                    // SOLVED repetition. it would be nice if you manage this repetition code, but it's needed to calc all graphs
                    // TODO It is still be better if you will not destroy graphics but use new values, but even now is much better than it was before.
                    //waveShapeChartData.labels = timeSteps;
                    //waveShapeChartData.datasets[0].data = valueSteps;
                    //waveShapeChartObject.update();

                    // destroying old charts
                    for (var c1 = 0; c1 < charts.length; c1++){
                        charts[c1].shapeChartObject.destroy();
                    }
                    charts.length = 0;
                }

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

                        pointDataset.label = "P" + j.toString() + " (R: " + data.controlPoints[j].radius.toFixed(3) + ", Theta: " + data.controlPoints[j].angle.toFixed(3) + ")";
                        var pointColor = colorsPresets[j % colorsPresets.length];
                        pointDataset.backgroundColor = pointColor;
                        pointDataset.borderColor = pointColor;
                        pointDataset.pointBorderColor = pointColor;
                        pointDataset.pointHoverBackgroundColor = pointColor;
                        pointDataset.pointHoverBorderColor = pointColor;

                        pointDataset.data = ctrlPoints[j][i];
                        shapeChartData.datasets.push(pointDataset);
                    }

                    shapeChartOptions = {
                        responsive: mobileAndTabletcheck(),
                        maintainAspectRatio: true,
                        scales: {
                            xAxes: [{
                                ticks: {
                                    maxTicksLimit: mobileAndTabletcheck() ? 20 : 30 //Math.round( (data.TM + data.XDESTR*1.01) )
                                }
                            }]
                        }
                    };
                    shapeChartObject = Chart.Line(shapeDomObject, {
                        data: shapeChartData,
                        options: shapeChartOptions
                    });
                    //shapeChartObject = new Chart(shapeDomObject).Line(shapeChartData, shapeChartOptions);

                    charts.push({
                        shapeDomObject: shapeDomObject,
                        shapeChartData: shapeChartData,
                        shapeChartOptions: shapeChartOptions,
                        shapeChartObject: shapeChartObject
                    });
                }
                //console.warn(charts);

            } else {
                console.log("no charts because of lack of control points:", ctrlPoints);
            }

        }

    }]);

    jBBLControllers.controller('jBBLDataController', ['$scope', '$window', function($scope, $window) {
        var self = this;

        var BBL, data;

        init();

        function init(){
            self.visible = false;

            BBL = {};
            data = {};

            self.currentTabIndex = 2;
            self.dataNames = $window.dataNames;
        }

        var stepsBeforeT0 = 0;
        var stepsAfterT0 = 0;
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

        function updateBBLData(){
            BBL = require('BBL');
            data = new BBL.Datatone();
            console.log("here is data", data);

            self.data = data;

            stepsBeforeT0 = Math.round(data.XDESTR * 1.1 / data.STEPX);
            stepsAfterT0 = Math.round(data.TM/data.STEP);
            altTimeStepsCount = stepsBeforeT0 + stepsAfterT0;
        }

        function isNumberDecimalEqualTo(number, value){
            return compareWithEps(getDecimal(number), value);
        }
        function compareWithEps(num1, num2, eps){
            eps = eps || 1e-6;
            return (Math.abs(num1 - num2) < eps);
        }
        function getDecimal(num) {
            return Math.abs( num%1); // num > 0 ? (num % 1) : (-num % 1));
        }
        //for (var gdi = -10.5; gdi <= 10.05; gdi=gdi+1.0) console.warn(getDecimal(gdi));
        //for (var gdi =-1; gdi <= 1; gdi=gdi+0.1) console.warn(getDecimal(gdi));

        function setDisplayData(visibility){
            self.visible = visibility;

            updateBBLData();

            // data.memOut[layer][time][radius][angle]
            // for (var c0 = 0, c0len = Math.round(data.XDESTR / data.STEPX); c0 <= c0len; c0=c0+1){
            //     for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){ mem[recTime][c0+1][c1]
            var limitedData = [];
            data.limitedData = limitedData;

            var radiusesAdded = false;
            var radiusValues = [];
            data.radiusValues = radiusValues;
            var timesAdded = false;
            var timeValues = [];
            data.timeValues = timeValues;
            var anglesAdded = false;
            var angleValues = [];
            data.angleValues = angleValues;
            for (var layerIndex = 0; layerIndex < data.memOut.length; layerIndex++){
                var curLayer = [];
                limitedData.push(curLayer);

                for (var timeIndex = 0; timeIndex < data.memOut[layerIndex].length; timeIndex++){
                    var timeValue = getTimeByTimeIndex(timeIndex);

                    if (isNumberDecimalEqualTo(timeValue, 0) || isNumberDecimalEqualTo(timeValue, 0.5) || timeIndex+1 == data.memOut[layerIndex].length) {
                        if (timesAdded == false) timeValues.push({timeIndex: timeIndex, value: timeValue.toFixed(2)});

                        var curTime = [];
                        curLayer.push(curTime);

                        //for (var radiusIndex = 0; radiusIndex < data.memOut[layerIndex][timeIndex].length; radiusIndex++) {
                        for (var radiusIndex = 0, radiusLen = Math.round(data.XDESTR / data.STEPX); radiusIndex < radiusLen; radiusIndex++) {
                            var radiusValue = radiusIndex * data.STEPX;
                            //if (layerIndex == 0 && timeIndex == 4) console.warn(radiusValue.toFixed(2));

                            if (isNumberDecimalEqualTo(radiusValue, 0) || radiusIndex+1 == radiusLen) {
                                if (radiusesAdded == false) radiusValues.push({radiusIndex: radiusIndex, value: radiusValue});

                                var curRadius = [];
                                curTime.push(curRadius);

                                for (var angleIndex = 0; angleIndex < data.memOut[layerIndex][timeIndex][radiusIndex].length; angleIndex++) {

                                    if (angleIndex % 3 == 0 || angleIndex+1 == data.memOut[layerIndex][timeIndex][radiusIndex].length) {
                                        var angleValue = data.angles[angleIndex];
                                        if (anglesAdded == false) angleValues.push({angleIndex: angleIndex, value: angleValue});

                                        curRadius.push(data.memOut[layerIndex][timeIndex][radiusIndex][angleIndex].toFixed(6));
                                    }
                                }
                                anglesAdded = true;

                            }

                        }
                        radiusesAdded = true;

                    }

                }
                timesAdded = true;

            }
            console.log("radiusValues:", radiusValues);
            console.log("timeValues:", timeValues);
            console.log("angleValues:", angleValues);
            console.log("limitedData:", limitedData);

            var timeBeforeDigest = Date.now();
            $scope.$digest();
            console.log(((Date.now() - timeBeforeDigest)/1000).toFixed(2) + "s to $digest()");
        }
        this.setDisplayData = setDisplayData;
        $window.setDisplayData = setDisplayData;

    }]);

    jBBLControllers.controller('jBBLEpureController', ['$scope', '$window', function($scope, $window) {
        var self = this;

        var BBL, data;

        var waveShapeDomObject, waveShapeChartData, waveShapeChartOptions, waveShapeChartObject;

        init();

        function init(){
            self.visible = false;

            BBL = {};
            data = {};
        }

        function updateBBLData(){
            BBL = require('BBL');
            data = new BBL.Datatone();
            console.log("here is data", data);

            self.data = data;
        }

        function setEpureData(visibility){
            self.visible = visibility;

            updateBBLData();

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
                // TODO with X > 12, waveepure draw nothing
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
                waveShapeChartOptions = {
                    responsive: mobileAndTabletcheck(),
                    maintainAspectRatio: true,
                    scales: {
                        xAxes: [{
                            ticks: {
                                maxTicksLimit: 30 //Math.round( (data.TM + data.XDESTR*1.01) )
                            }
                        }]
                    }
                };
                waveShapeChartObject = Chart.Line(waveShapeDomObject, {
                    data: waveShapeChartData,
                    options: waveShapeChartOptions
                });
            }
        }

    }]);

})(angular, window);