/**
 * Created by jaric on 30.05.2017.
 */

(function (angular, window){

    "use strict";

    console.log("jBBLHControllers", angular);

    var jBBLHControllers = angular.module('jBBLHControllers', []);

    window.dataNames = ["V_1", "V_2", "S11", "S22", "S12", "e11", "e22", "e12"];
    function mobileAndTabletcheck() {
        // http://stackoverflow.com/a/11381730
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }
    function noop(){}

    jBBLHControllers.controller('jBBLHloadingController', ['$rootScope', function($rootScope) {
        var self = this;

        init();

        function init(){
            console.log('jBBLHloadingController is here');

            self.visible = false;
        }

        $rootScope.$on('loadingChanged', function(event, params){
            self.visible = params.visible;
        });
    }]);

    jBBLHControllers.controller('jBBLHfileListController', ['$rootScope','$scope', '$http', 'BBLHdataFiles', 'BBLH', function($rootScope, $scope, $http, BBLHdataFiles, BBLH) {
        var self = this;

        var data;

        init();

        function init(){
            console.log('jBBLHfileListController is here');

            self.visible = true;

            self.searchString = "";

            self.allFiles = BBLHdataFiles.dataFiles;

            data = new BBLH.Datatone();
        }

        function loadDataFile(fileObject){
            //console.warn(fileObject);

            self.visible = false;
            $rootScope.$broadcast('loadingChanged', {visible: true});

            // TODO loading bar (0... in progress... 100%)
            $http({
                method: 'GET',
                url: '/memout' + fileObject.path
            }).then(function successCallback(response) {
                console.warn("response", response);
                //var sceneInputData = response.data.inputData;
                //
                //var sceneInput = {
                //    userInput: true,
                //    userData: sceneInputData
                //};
                //var BBLHstart = BBLH.BBLHstart;
                //BBLHstart.STARTPROC(sceneInput, function(){
                //    data.G = response.data.G;
                    angular.extend(data, response.data);

                    console.warn("Datatone", data);

                    $rootScope.$broadcast('dataHaveBeenLoaded');
                    $rootScope.$broadcast('loadingChanged', {visible: false});

                //});
            }, function errorCallback(response) {
                self.visible = true;
                $rootScope.$broadcast('loadingChanged', {visible: false});

                console.error(response);
            });


        }
        self.loadDataFile = loadDataFile;

    }]);

    jBBLHControllers.controller('jBBLHscrollController', ['$rootScope','$scope', 'BBLH', function($rootScope, $scope, BBLH){
        var self = this;

        var data;
        var scrollDiv = document.getElementById("timeScroll");
        var mainCanvasCoverDiv = document.getElementById("mainCanvasHolderCover");
        var scrollInner = document.getElementById("timeInner");

        init();

        function init(){
            data = new BBLH.Datatone();

            self.visible = false;
            self.scrollPos = 0;

            window.addEventListener("resize", changeScrollInnerWidth);

            scrollDiv.addEventListener("scroll", scrollAction);
            scrollDiv.addEventListener("wheel", wheelAction);
            scrollDiv.style.left = "0px";
            scrollDiv.style.top = "0px";
            scrollDiv.style.width = "100%";
            scrollDiv.style.height = "100%";

            mainCanvasCoverDiv.addEventListener("wheel", wheelAction);
        }

        function changeScrollInnerWidth(){
            scrollInner.style.width = Math.round(window.innerWidth + 120*data.TM/data.STEP).toString() + "px";
        }

        function getScrollData(){
            if (data === undefined) {
                console.warn("data are not loaded", data);
                return null;
            }

            // http://stackoverflow.com/a/5704386
            var scrollMax = scrollDiv.scrollWidth - scrollDiv.clientWidth;
            var scrollData = {
                scrollPos: scrollDiv.scrollLeft,
                scrollMax: scrollMax,
                scrollStep: Math.round(data.TM / data.STEP * (scrollDiv.scrollLeft / scrollMax))
            };
            return scrollData;
        }
        function scrollAction(){
            //console.log("scroll");
            //if (data === undefined) data = new BBLH.Datatone();

            if (data === undefined) {
                // still not loaded
                console.warn("data are not loaded", data);
            } else {
                var params = { scrollData: getScrollData() };
                $rootScope.$broadcast('scrollEvent', params);

                //self.scrollPos = (params.scrollData.scrollStep * data.DT).toFixed(2) + " s";
                self.scrollPos = (params.scrollData.scrollStep * data.DT * data.LC * 1e3).toFixed(2) + " ms";
                $scope.$digest();
            }
        }
        function wheelAction(event){
            //console.log("wheel");
            var delta = event.wheelDelta;
            // actually, this and scrollDiv are equal
            scrollDiv.scrollLeft -= (delta);
        }

        //$rootScope.$broadcast('dataHaveBeenLoaded');
        $rootScope.$on('dataHaveBeenLoaded', function(event){
            changeScrollInnerWidth();

            self.visible = true;
        });

        $rootScope.$on('getScrollData', function(event, params){
            //console.warn("$rootScope.$on getScrollData");

            var scrollData = getScrollData();
            params.callback(scrollData);
        });

    }]);

    jBBLHControllers.controller('jBBLHcanvasController', ['$rootScope', '$scope', 'BBLH', function($rootScope, $scope, BBLH){
        var self = this;
        var data;

        init();

        function init(){
            self.visible = false;

            data = new BBLH.Datatone();
            self.data = data;

            self.dataNames = window.dataNames;

            self.data.settings.isShown = false;
        }

        $rootScope.$on('dataHaveBeenLoaded', function(event){
            self.visible = true;
        });

        function changeSchemeIndex(schemeIndex){
            //console.warn(schemeIndex);
            $rootScope.$broadcast('changeSchemeIndex', {schemeIndex: schemeIndex});
        }
        this.changeSchemeIndex = changeSchemeIndex;

        function changeVisualisationSchemeIndex(visualisationSchemeIndex){
            //console.warn(visualisationSchemeIndex);
            $rootScope.$broadcast('changeVisualisationSchemeIndex', {visualisationSchemeIndex: visualisationSchemeIndex});
        }
        this.changeVisualisationSchemeIndex = changeVisualisationSchemeIndex;

        // filter settings
        this.filterPartsValues = new Array(data.settings.filter.parts+1);
        for (var fi = 0; fi < this.filterPartsValues.length; fi++) this.filterPartsValues[fi] = fi;
        function toggleFilterState(){
            //console.warn("toggleFilterState");
            data.settings.filter.enabled = !data.settings.filter.enabled;
        }
        this.toggleFilterState = toggleFilterState;
        function changeFilterLeftBorder(leftBorderIndex){
            //console.warn("toggleFilterState");
            data.settings.filter.leftBorder = leftBorderIndex;
        }
        this.changeFilterLeftBorder = changeFilterLeftBorder;
        function changeFilterRightBorder(rightBorderIndex){
            //console.warn("toggleFilterState");
            data.settings.filter.rightBorder = rightBorderIndex;
        }
        this.changeFilterRightBorder = changeFilterRightBorder;

        this.amplifyValues = [1,1.3,1.5,1.7,2,3];
        function toggleAmplifyState(){
            data.settings.amplifyColors = !data.settings.amplifyColors;
        }
        this.toggleAmplifyState = toggleAmplifyState;
        function changeAmplifyValue(index){
            data.settings.amplifyCoef = self.amplifyValues[index];
        }
        this.changeAmplifyValue = changeAmplifyValue;

        function hideStats(){
            console.log("hideStats");
            var statsHolderDiv = document.getElementById("statsHolder");
            statsHolderDiv.style.visibility = "hidden";

            var buttonHideStatsDiv = document.getElementById("buttonHideStats");
            buttonHideStatsDiv.style.visibility = "hidden";
        }
        this.hideStats = hideStats;

        function changeCminCmax(param){
            if (param){
                if (param.cmin) data.cmin = param.cmin;
                if (param.cmax) data.cmax = param.cmax;
            }

            $rootScope.$broadcast('changeCminCmaxEvent');
            //$rootScope.$on('changeCminCmaxEvent', function(event,params){
            //    initColorVertices(lastCurrentTime);
            //});

        }
        this.changeCminCmax = changeCminCmax;

    }]);

    jBBLHControllers.controller('jBBLHmemoutController', ['$rootScope', '$scope', 'BBLH', function($rootScope, $scope, BBLH){
        var self = this;
        var data;

        init();

        function init(){
            self.visible = false;
        }

        function lateInit(){
            data = new BBLH.Datatone();
            self.data = data;

            self.showData = data.settings.showMemoutTable;

            self.currentTabIndex = 2;

            self.dataNames = window.dataNames;

            $scope.settings = data.settings;
        }

        $rootScope.$on('dataHaveBeenLoaded', function(event){
            lateInit();

            formLimitedData();
            formDescartData();

            self.visible = true;
        });

        function toggleDataTable(){
            self.showData = !self.showData;
        }
        this.toggleDataTable = toggleDataTable;

        function isSet(index){
            return index === self.currentTabIndex;
        }
        this.isSet = isSet;

        function setTab(index){
            self.currentTabIndex = index;
        }
        this.setTab = setTab;

        function formLimitedData(){
            var limitedData = [];
            data.limitedData = limitedData;

            var totalAmount = data.memout.length * data.memout[0].length * data.memout[0][0].length * data.memout[0][0][0].length;

            self.timeIndicies = [];
            self.timeValues = [];
            for (var i = 0; i < data.memout[0].length; i++) {
                var timeValue = i * data.STEP;

                //if (isNumberDecimalEqualTo(timeValue, 0) || isNumberDecimalEqualTo(timeValue, 0.5) || i+1 == data.memout[0].length) {
                //if ((timeValue * 10) % 10 == 0 || i+1 == data.memout[0].length) {
                if ((timeValue * 10) % data.settings.memoutStep == 0 || i+1 == data.memout[0].length) {
                    self.timeIndicies.push(i);
                    self.timeValues.push(timeValue);
                }
            }

            self.radiusIndicies = [];
            self.radiusValues = [];
            for (var j = 0; j < data.memout[0][0].length; j++) {
                self.radiusIndicies.push(j);
                self.radiusValues.push(j * data.STEPX * data.geomprocR);
            }

            self.angleIndicies = [];
            self.angleValues = [];
            for (var k = 0; k < data.angles.length; k++) {
                if (data.angles[k] % 15 == 0){
                    self.angleIndicies.push(k);
                    self.angleValues.push(data.angles[k]);
                }
            }

            var limitedAmount = data.memout.length * self.timeIndicies.length * self.radiusIndicies.length * self.angleIndicies.length;

            //-console.warn("totalAmount", totalAmount, "limitedAmount", limitedAmount, self.timeValues, self.radiusValues, self.angleValues);
        }

        function formDescartData(){
            // Coordinate system of René Descartes or Cartesian coordinate system
            console.warn("formDescartData. I do nothing");
            console.log("n/d n/d n/d  1   1  n/d n/d n/d");
            console.log("n/d n/d  1   1   1   1  n/d n/d");
            console.log("n/d  1   1  n/d n/d  1   1  n/d");
            console.log(" 0   0  n/d n/d n/d n/d  0   0 ");
            console.log(" 0   0  n/d n/d n/d n/d  0   0 ");
            console.log("n/d  0   0  n/d n/d  0   0  n/d");
            console.log("n/d n/d  0   0   0   0  n/d n/d");
            console.log("n/d n/d n/d  0   0  n/d n/d n/d");
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

        function getLayerNumberByCoordinate(X){
            var L, ans;   // integer
            ans=0;
            for (L = data.NL-1; L > 0; L--){
                // TODO this shouldn't be true, but it is (getLayerNumberByCoordinate, probably comparision problems in Fortran)
                // only here "*data.geomprocR" to show correctly layer number
                if (X < data.HI[L]*data.DX*data.geomprocR + 1e-6){
                    ans = L;
                    return ans;
                }
            }
            return ans;
        }
        this.getLayerNumberByCoordinate = getLayerNumberByCoordinate;

        $scope.$watch('settings.showMemoutTable', function(newValue, oldValue) {
            if (data === undefined || data.memout === undefined || oldValue === undefined) return;

            if (newValue == true) formLimitedData();

            console.log("settings.showMemoutTable changed to", newValue, "; from", oldValue);
            toggleDataTable();
        });
    }]);

    jBBLHControllers.controller('jBBLHepureController', ['$rootScope', '$scope', 'BBLH', function($rootScope, $scope, BBLH){
        var self = this;
        var data;
        var waveShapeDomObject, waveShapeChartData, waveShapeChartOptions, waveShapeChartObject;

        init();

        function init(){
            self.visible = false;
        }

        function lateInit(){
            data = new BBLH.Datatone();
            self.data = data;

            self.showEpure = data.settings.showEpure;

            $scope.settings = data.settings;
        }

        $rootScope.$on('dataHaveBeenLoaded', function(event){
            lateInit();

            initWaveShape(data);

            self.visible = true;
        });

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
                    //timeSteps.push(data.waveEpure[i].T);
                    timeSteps.push((data.waveEpure[i].T * data.LC * 1e3).toFixed(2)); // LC = R / C0;
                    //valueSteps.push(data.waveEpure[i].value);
                    valueSteps.push(data.waveEpure[i].value * 1e-6);
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
                                maxTicksLimit: 30
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

        function toggleEpure(){
            self.showEpure = !self.showEpure;
        }

        $scope.$watch('settings.showEpure', function(newValue, oldValue) {
            if (data === undefined || data.memout === undefined || oldValue === undefined) return;

            console.log("settings.showEpure changed to", newValue, "; from", oldValue);
            toggleEpure();
        });
    }]);

    jBBLHControllers.controller('jBBLHControlPointsController', ['$rootScope', '$scope', 'BBLH', function($rootScope, $scope, BBLH){
        var self = this;
        var data;
        var charts;

        init();

        function init(){
            console.log("jBBLHControlPointsController is here");

            self.dataNames = window.dataNames;
            //self.dataNames = [];

            self.visible = false;
        }

        function lateInit(){
            data = new BBLH.Datatone();
            self.data = data;

            self.currentTabIndex = 2;

            charts = [];

            $scope.settings = data.settings;

            self.showCtrlPoints = data.settings.showControlPointsData;
            self.visible = true;
        }

        $rootScope.$on('dataHaveBeenLoaded', function(event){
            lateInit();

            setControlPointsData(false);
        });

        function getTimeByTimeIndex(timeIndex){
            var realTime = timeIndex * data.STEP;
            return realTime;
        }
        this.getTimeByTimeIndex = getTimeByTimeIndex;

        function setControlPointsData(invert){
            invert = invert || false;

            var ctrlPoints = [];    // ctrlPoints[index][layer][time] -> value
            self.ctrlPoints = ctrlPoints;

            for (var ctrlPointIndex = 0; ctrlPointIndex < data.controlPoints.length; ctrlPointIndex++) {
                var ctrlPointData = [];
                ctrlPoints[ctrlPointIndex] = ctrlPointData;

                var nearestPoint = data.nearestPoints[ctrlPointIndex][0];   // [0..3]
                //var nearestValue = data.memout[][cT][nearestPoint.radiusStepIndex][nearestPoint.angleStepIndex];

                for (var dataLayerIndex = 0; dataLayerIndex < data.memout.length; dataLayerIndex++) {
                    var ctrlLayer = [];
                    ctrlPointData[dataLayerIndex] = ctrlLayer;

                    for (var cT = 0; cT < data.memout[dataLayerIndex].length; cT++) {
                        // TODO interpolate value
                        var value = data.memout[dataLayerIndex][cT][nearestPoint.radiusStepIndex][nearestPoint.angleStepIndex];
                        if (invert) value *= -1;
                        ctrlLayer[cT] = value;
                    }
                }
            }

            initCharts(data, ctrlPoints);

            //$scope.$digest();
        }

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
                    //timeLabels.push(getTimeByTimeIndex(ti).toFixed(2));
                    timeLabels.push((getTimeByTimeIndex(ti) * data.LC * 1e3).toFixed(2));   // conversion to ms
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

                for (var i = 0; i < data.memout.length; i++) {
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
                                    maxTicksLimit: mobileAndTabletcheck() ? 20 : 30
                                }
                            }],
                            yAxes: [{
                                ticks: {
                                    callback: function(value, index, values){
                                        if (index == 0) console.warn(value, index, values);
                                        return value.toExponential(2);
                                    }
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

        $rootScope.$on('updateControlPointsDiagram', function(event){
            setControlPointsData(false);
            $scope.$digest();
        });

        function toggleControlPointsData(){
            self.showCtrlPoints = !self.showCtrlPoints;
        }

        function isSet(index){
            return index === self.currentTabIndex;
        }
        this.isSet = isSet;

        function setTab(index){
            self.currentTabIndex = index;
        }
        this.setTab = setTab;

        $scope.$watch('settings.showControlPointsData', function(newValue, oldValue) {
            if (data === undefined || data.memout === undefined || oldValue === undefined) return;

            console.log("settings.showControlPointsData (diagrams and table) changed to", newValue, "; from", oldValue);
            toggleControlPointsData();
        });
    }]);

    jBBLHControllers.controller('jBBLHcanvasHolderController', ['$rootScope', '$scope', 'BBLH', function($rootScope, $scope, BBLH){
        var self = this;

        var THREE, dat, data, RTET, MatMult;
        //var Stats, stats;
        var scene, camera, renderer, canvasHolder, canvasHolderCover, axisHelper, geometry, material, mesh;
        var rendererSize;
        var mem, angles, radiuses,
            axisX, axisY, axisX2, axisY2, defZ,
            vertexPositions, vertexColors,
            cmin, cmax,
            timeStepsCount,
            controlPoints,
            nearestPoints,
            totalRadius,
            totalRadiusOffset;
        var zeroDegreeText, ninetyDegreeText;
        var geometryControlPoints;
        var colorsPresets;
        var memout;
        var settings;
        var lastCurrentTime = 0;

        init();

        // core functions

        function init(){
            console.log('jBBLHcanvasHolderController is here');

            self.visible = false;

            data = new BBLH.Datatone();
            RTET = BBLH.FUNC2.RTET;

            MatMult = BBLH.MatMult;

            settings = {};
            data.settings = settings;
            initSettings();

            initParams();

            initThree();
            //stats = initStats();
            //initDat();
            scene = initScene();
            camera = initCamera();
            canvasHolderCover = document.getElementById("mainCanvasHolderCover");
            renderer = initRenderer();
            canvasHolder = initCanvasHolder();
            canvasHolder.appendChild( renderer.domElement );

            axisHelper = initAxisHelper();
            scene.add( axisHelper );

            geometry = initGeometry();
        }
        function createText(text, left, top, width, height){
            // TODO using angular and still document.createElement()?
            left = left || 0;
            top = top || 0;
            width = width || 23;
            height = height || 17;
            var generatedText = document.createElement('div');
            generatedText.style.position = 'absolute';
            //generatedText.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
            generatedText.style.width = width + 'px';
            generatedText.style.height = height + 'px';
            //generatedText.style.backgroundColor = "blue";
            generatedText.innerHTML = text;
            generatedText.style.left = left + 'px';
            generatedText.style.top = top + 'px';

            return generatedText;
        }

        function initThree(){
            THREE = require('THREE');

            if (!THREE) {
                console.error('there is no three.js: ', THREE);
            }
        }

        function initStats(){
            Stats = require('Stats');

            var stats = createStats();
            return stats;
        }
        function createStats() {
            var statsHolder = document.getElementById('statsHolder');
            var stats = new Stats(statsHolder);
            stats.setMode(1); // 0: fps, 1: ms

            //stats.domElement.style.position = 'absolute';
            //stats.domElement.style.left = '0px';
            //stats.domElement.style.top = '0px';
            statsHolder.appendChild(stats.domElement);
            //document.body.appendChild(stats.domElement);

            return stats;
        }

        function initDat(){
            dat = require('dat');   // dat.GUI
        }

        function initSettings() {
            $scope.settings = settings;

            settings.initTime = 0;

            // load from Datatone. Mem[time from 0 to 5 (data.TM), with 0.1 (data.DT) step][coord from 0 to 1 (data.XDESTR) with 0.1 (data.STEPX) step][angle from 0 to 90 (data.printPoints) with 15 step]
            settings.schemeIndex = 2;

            settings.visualisationSchemeIndex = 3;   // 0 == rainbow, 1 == HSV, 2 == blue-white-red, 3 == rainbow with zero

            settings.amplifyColors = false;
            settings.amplifyCoef = 1.3;

            settings.showControlPoints = false;

            settings.filter = {
                enabled: false,
                parts: 10,
                leftBorder: 0,
                rightBorder: 10
            };

            settings.showMemoutTable = false;
            settings.memoutStep = 10;

            settings.showEpure = false;

            settings.showControlPointsData = false;

            settings.showCentralObject = false;

            settings.showBorderLines = true;
        }
        function initParams(){
            //axisX = 2;
            //axisY = 2;   // length of axises
            //axisX2 = axisX / 2;
            //axisY2 = axisY / 2;
            defZ = 1.0;

            axisX = axisY = 1;
            axisX2 = axisY2 = 0;

            vertexPositions = [];
            vertexColors = [];

            // colors
            // color.adobe.com Circus III
            colorsPresets = [
                [1, 0.12109375, 0.23828125],
                [0.35546875, 0.88671875, 0.88671875],
                [0.32421875, 0.85546875, 0.3125],
                //[1, 0.859375, 0], yellow
                [0.7890625, 0.22265625, 0.58203125],
                [0.08203125, 0.0625, 0.9375]
                //[0.1796875, 0.03515625, 0.15234375],
                //[0.84765625, 0, 0],
                //[1, 0.17578125, 0],
                //[1, 0.546875, 0],
                //[0.015625, 0.45703125, 0.43359375]
                //"rgba(46,9,39,1)",
                //"rgba(217,0,0,1)",
                //"rgba(255,45,0,1)",
                //"rgba(255,140,0,1)",
                //"rgba(4,117,111,1)"
                // Honey Pot
                //[0.0625, 0.35546875, 0.38671875],
                //[1, 0.9765625, 0.83203125],
                //[1, 0.82421875, 0.3046875],
                //[0.85546875, 0.6171875, 0.2109375],
                //[0.73828125, 0.28515625, 0.1953125]
                //"rgba(16,91,99,1)",
                //"rgba(255,250,213,1)",
                //"rgba(255,211,78,1)",
                //"rgba(219,158,54,1)",
                //"rgba(189,73,50,1)"
            ];
        }
        function initParamsWithData(){
            // "with Data" means that BBLH.Datatone is available with memout
            console.time("jBBLHcanvasHolderController.init");

            reorderMemout();
            //mem = memout[settings.schemeIndex];
            mem = [];
            mem.length = 0;
            angular.extend(mem, data.memout[settings.schemeIndex]);
            countMinMax();
            //filterMinMax();

            // converting TP to correct array of angles (indexed from 0)
            angles = [];
            for (var cang in data.TP) {
                if (data.TP.hasOwnProperty(cang)) {
                    if (data.TP[cang] != null) angles.push(data.TP[cang]);
                }
            }
            data.angles = angles;
            //console.log("angles:", angles);
            // TODO radiuses not in use
            radiuses = getAllRadiusesForAngles(angles);

            timeStepsCount = Math.round(data.TM / data.STEP) + 1;
            console.log("timeStepsCount:", timeStepsCount);

            controlPoints = [
                { radius: data.CHECK + data.rtetA / data.geomprocR, angle: 0 },
                { radius: data.CHECK + data.rtetB / data.geomprocR, angle: 90 },
                { radius: 5 / data.geomprocR, angle: 30 }
            ];
            nearestPoints = [];
            findNearestPoints();
            data.controlPoints = controlPoints;
            data.nearestPoints = nearestPoints;
            console.log("controlPoints", controlPoints, "nearestPoints", nearestPoints);

            totalRadius = 1.0;    // "1.0" is default value
            totalRadiusOffset = 1.05;

            initVertices();

            material = new THREE.MeshBasicMaterial( {
                //color: 0xffffff, // also if set color to 0xbbbbbb brightness will be less than normal
                vertexColors: THREE.VertexColors,
                side: THREE.DoubleSide  // if there is only front side it may be rotated with backside (and become invisible)
            } );
            // Almost triangle only view (for real, every second triangle is colored
            //material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } );

            mesh = new THREE.Mesh( geometry, material );
            scene.add(mesh);

            addHUDLayersBorders(angles);
            addHUDControlPoints();

            zeroDegreeText = createText("0°", renderer.domElement.offsetLeft + rendererSize.width/2, renderer.domElement.offsetTop);
            canvasHolder.appendChild(zeroDegreeText);
            ninetyDegreeText = createText("90°", renderer.domElement.offsetLeft + rendererSize.width, renderer.domElement.offsetTop + rendererSize.height/2);
            canvasHolder.appendChild(ninetyDegreeText);
            // TODO using setTimeout for UI... *facepalm*
            setTimeout(changeDegreesPositions, 200);
            setTimeout(changeMainCanvasCoverPosition, 200);

            window.addEventListener("resize", changeDegreesPositions);
            window.addEventListener("resize", changeMainCanvasCoverPosition);

            console.timeEnd("jBBLHcanvasHolderController.init");
        }
        function changeDegreesPositions(){
            zeroDegreeText.style.left = (renderer.domElement.offsetLeft + rendererSize.width/2).toString() + 'px';
            zeroDegreeText.style.top = renderer.domElement.offsetTop.toString() + 'px';

            ninetyDegreeText.style.left = (renderer.domElement.offsetLeft + rendererSize.width).toString() + 'px';
            ninetyDegreeText.style.top = (renderer.domElement.offsetTop + rendererSize.height/2).toString() + 'px';
        }
        function changeMainCanvasCoverPosition(){
            canvasHolderCover.style.left = renderer.domElement.offsetLeft.toString() + 'px';
            canvasHolderCover.style.top = renderer.domElement.offsetTop.toString() + 'px';
            canvasHolderCover.style.width = renderer.domElement.offsetWidth.toString() + 'px';
            canvasHolderCover.style.height = renderer.domElement.offsetHeight.toString() + 'px';
        }
        function getAllRadiusesForAngles(angles){
            var radiuses = [];
            for (var i = 0, ilen = angles.length; i < ilen; i++){
                var angle = angles[i] * Math.PI / 180;
                radiuses[i] = RTET(angle) / data.geomprocR;
            }
            return radiuses;
        }
        function addHUDLayersBorders(angles){
            // border lines

            totalRadius = calcTotalRadius();

            //var lineMaterial = new THREE.LineBasicMaterial({
            var lineMaterial = new THREE.LineDashedMaterial({
                color: 0x00ff00,
                dashSize: 0.025,
                gapSize: 0.025
            });
            var lineGeometries = [];
            var borderLines = [];
            //var radiusInc = 0;
            //var invertLineOrder = true;
            var radiusInc = data.CHECK;

            self.borderLines = borderLines;

            for (var i = 0; i < data.inputData.NL-1; i++){
                //if (invertLineOrder)
                //radiusInc += data.inputData.layers[i].H / data.geomprocR;
                radiusInc -= data.inputData.layers[i].H / data.geomprocR;

                var lineGeometry = new THREE.Geometry();
                for (var j = 0; j < angles.length; j++){
                    //var polarPoint = fromMisesToPolar(angles[j], 0);  // object
                    //var polarPoint = fromMisesToPolar(angles[j], data.CHECK);  // overall
                    var polarPoint = fromMisesToPolar(angles[j], radiusInc);
                    //polarPoint.radius += data.inputData.layers[i].H / data.geomprocR;
                    //polarPoint.radius += radiusInc;
                    polarPoint.radius /= totalRadius;
                    var px = polarPoint.radius * Math.sin( deg2rad(polarPoint.phi) ) * axisX - axisX2;
                    var py = polarPoint.radius * Math.cos( deg2rad(polarPoint.phi) ) * axisY - axisY2;
                    lineGeometry.vertices.push(new THREE.Vector3(px, py, defZ));
                }
                lineGeometry.computeLineDistances();
                lineGeometries.push(lineGeometry);

                var line = new THREE.Line(lineGeometry, lineMaterial);
                borderLines.push(line);

                scene.add(line);

                line.visible = settings.showBorderLines;
            }
        }
        function toggleBorderLines(){
            for (var i = 0; i < self.borderLines.length; i++){
                self.borderLines[i].visible = !self.borderLines[i].visible;
            }
        }
        function addHUDControlPoints(){
            var geometryNearestPoints = new THREE.Geometry();
            for (var nearestIndex in nearestPoints){
                for (var nearestPointIndex in nearestPoints[nearestIndex]){
                    var nearestPoint = nearestPoints[nearestIndex][nearestPointIndex];
                    var nearestPointX = nearestPoint.radius/totalRadius * Math.sin(deg2rad(nearestPoint.angle)) * axisX - axisX2;
                    var nearestPointY = nearestPoint.radius/totalRadius * Math.cos(deg2rad(nearestPoint.angle)) * axisY - axisY2;
                    geometryNearestPoints.vertices.push(new THREE.Vector3(nearestPointX, nearestPointY, defZ));
                }
            }
            var nearestPointMaterial = new THREE.PointsMaterial( { color: 0x00ff00, size: 5, sizeAttenuation: false } );
            var nearestPointsDots = new THREE.Points( geometryNearestPoints, nearestPointMaterial );
            // uncomment to see nearestPoints
            //scene.add( nearestPointsDots );
            nearestPointsDots.visible = settings.showControlPointsData;
            self.nearestPointsDots = nearestPointsDots;

            geometryControlPoints = new THREE.BufferGeometry();
            geometryControlPoints.addAttribute( 'position',  new THREE.BufferAttribute( [], 3 ) );
            geometryControlPoints.addAttribute( 'color',  new THREE.BufferAttribute( [], 3 ) );
            // coords
            var verticesCPPositions = [];
            for (var pointIndex = 0; pointIndex < controlPoints.length; pointIndex++){
                var controlPoint = controlPoints[pointIndex];
                var controlPointX = controlPoint.radius/totalRadius * Math.sin(deg2rad(controlPoint.angle)) * axisX - axisX2;
                var controlPointY = controlPoint.radius/totalRadius * Math.cos(deg2rad(controlPoint.angle)) * axisY - axisY2;
                verticesCPPositions.push([controlPointX, controlPointY, defZ]);
            }
            var verticesCP = new Float32Array( verticesCPPositions.length * 3 ); // three components per vertex
            for ( var vi = 0, len = verticesCPPositions.length; vi < len; vi++ ) {
                for (var vj = 0; vj < 3; vj++) verticesCP[ vi*3 + vj ] = verticesCPPositions[vi][vj];
            }
            geometryControlPoints.attributes.position = new THREE.BufferAttribute( verticesCP, 3 );
            geometryControlPoints.computeBoundingSphere();

            var vertexCPColors = [];
            for (var vci = 0; vci < controlPoints.length; vci++){
                vertexCPColors.push( colorsPresets[vci%5] );
            }
            var colorsCP = new Float32Array( vertexCPColors.length * 3 );
            for ( var ci = 0, clen = vertexCPColors.length; ci < clen; ci++ ) {
                for (var ck = 0; ck < 3; ck++) colorsCP[ ci*3 + ck ] = vertexCPColors[ci][ck];
            }
            geometryControlPoints.attributes.color = new THREE.BufferAttribute( colorsCP, 3 );
            var controlPointMaterial = new THREE.PointsMaterial( {
                //color: 0xff0000,
                size: 10,
                sizeAttenuation: false,
                //size: 1/rendererSize.width*100 * 1.75,
                //transparent: true,
                //opacity: 1,
                vertexColors: THREE.VertexColors
            } );
            var controlPointsDots = new THREE.Points( geometryControlPoints, controlPointMaterial );
            scene.add( controlPointsDots );
            controlPointsDots.visible = settings.showControlPointsData;

            self.controlPointsDots = controlPointsDots;
        }
        function toggleControlPoints(){
            self.nearestPointsDots.visible = !self.nearestPointsDots.visible;
            self.controlPointsDots.visible = !self.controlPointsDots.visible;
        }
        // converts Num from diap (ds to df) to diap (dmin to dmax)
        function ctd(num, ds, df, dmin, dmax, invert){
            // after filter adding there is a new case that "num" might be less than "ds" or more than "df"
            if (num < ds) num = ds;
            if (num > df) num = df;

            var diap = Math.abs(df - ds);
            var delta = Math.abs(dmax - dmin);
            var ans = (delta / diap) * (num-ds) + dmin;
            if (invert === true) ans = dmax - ans;
            return ans;
        }
        //console.warn( 'value:', ctd(-1e-7,cmin, cmax, 0,1),'min:', cmin, 'max:', cmax);
        // converts Num from diap (ds to df) to diap (dmin to center value, center value to dmax). 3 colored diap
        function ctd3(num, ds, dc, df, dmin, dcenter, dmax){
            if (!(ds < dc) || !(dc < df)) {
                //console.warn("something wrong:", ds, " < ", dc, " < ", df);
                //return 0;
                //ans = ctd(num, ds, dc, dmin, dcenter, false);
                if ( ((dc < df) == false) && num >= dc) return dcenter;
            }
            if (!(dmin < dcenter) || !(dcenter < dmax)) {
                //console.warn("something wrong:", dmin, "<", centerValue, "<", dmax);
                //return 0;
                //ans = ctd(num, ds, dc, dmin, dcenter, false);
            }
            var ans;
            if (num < dc){
                ans = ctd(num, ds, dc, dmin, dcenter, false);
            } else {
                ans = ctd(num, dc, df, dcenter, dmax, false);
            }
            return ans;
        }
        //console.warn( 'value:', ctd3(0.1, cmin, 0, cmax, -1, 0, 1),'min:', cmin, 'max:', cmax);
        function calcDistance(point1, point2){
            var r1 = point1.radius;
            var phi1 = point1.angle;
            var r2 = point2.radius;
            var phi2 = point2.angle;

            var dist = Math.sqrt( r1*r1 + r2*r2 - 2*r1*r2*Math.cos( deg2rad(phi2-phi1) ) );

            return dist;
        }
        // TODO recalculate to Polar from Mizes
        // TODO ask Harry, if you enter control points in Mizes (by click on screen), is it correct use calcDistance() method?
        function findNearestFourPointsToPoint(point){
            point = point || {radius: 0, angle: 0}; // angle in degree
            var nearestPoints = [
                {radiusStepIndex: -1, angleStepIndex: -1, distance: Number.MAX_VALUE},
                {radiusStepIndex: -1, angleStepIndex: -1, distance: Number.MAX_VALUE},
                {radiusStepIndex: -1, angleStepIndex: -1, distance: Number.MAX_VALUE},
                {radiusStepIndex: -1, angleStepIndex: -1, distance: Number.MAX_VALUE}
            ];
            for (var c0 = 0; c0 < nearestPoints.length; c0++) {
                for (var c1 = 0, c0len = Math.round(data.CHECK / data.STEPX); c1 <= c0len; c1++) {
                    for (var c2 = 0, c1len = angles.length; c2 < c1len; c2++) {
                        //mem[time][radius][angle]
                        var skipThis = false;
                        for (var c3 = 0; c3 < c0; c3++){
                            if (nearestPoints[c3].radiusStepIndex == c1 && nearestPoints[c3].angleStepIndex == c2) {
                                skipThis = true;
                                break;
                            }
                        }
                        //if (!data.cavform[angles[c2]]) skipThis = true;
                        if (skipThis) continue;

                        var objectRadius1 = RTET( deg2rad(point.angle) ) / data.geomprocR;
                        var r1 = objectRadius1 + c1 * data.STEPX;
                        var currentPoint = {radius: r1, angle: angles[c2]};

                        var distance = calcDistance(point, currentPoint);
                        if (nearestPoints[c0].distance > distance){
                            nearestPoints[c0].distance = distance;
                            nearestPoints[c0].radius = currentPoint.radius;
                            nearestPoints[c0].angle = currentPoint.angle;
                            nearestPoints[c0].radiusStepIndex = c1;
                            nearestPoints[c0].angleStepIndex = c2;
                        }
                    }
                }
            }
            return nearestPoints;
        }
        function findNearestPoints(){
            nearestPoints.length = 0;
            for (var currentControlPoint in controlPoints){
                nearestPoints.push(findNearestFourPointsToPoint(controlPoints[currentControlPoint]));
            }
        }
        function deg2rad(angle){ return angle / 180 * Math.PI; }
        // TODO it could be movedto FUNC2 with name SinGamma
        function derivativeR0(T){
            // from FUNC2.RCURB()
            var DR1, R0, R1, DT = 0.0001;
            R1 = RTET(T + DT) / data.geomprocR;
            R0 = RTET(T - DT) / data.geomprocR;
            DR1 = (R1 - R0) / (2 * DT);
            return DR1;
        }
        function fromMisesToPolar(Th, X){
            var ans = { phi: 0, radius: 0 };
            //return {phi: Th, radius: X};

            var theta = Th * Math.PI / 180;

            //X = X / data.geomprocR;

            var R0 = RTET(theta) / data.geomprocR;
            var DR1 = derivativeR0(theta);
            var sinGamma = DR1 / (Math.sqrt( R0*R0 + DR1*DR1 ));
            var cosGamma = R0 / (Math.sqrt( R0*R0 + DR1*DR1 ));
            //ans.sinGamma = sinGamma;

            ans.radius = Math.sqrt( R0*R0 + X*X + 2*R0*X*cosGamma );

            var betta = Math.asin(X / ans.radius * sinGamma);
            ans.phi = theta - betta;
            ans.phi = ans.phi * 180 / Math.PI;
            ans.betta = betta * 180 / Math.PI;

            return ans;
        }
        //for (var mi = 0; mi <= 5; mi = mi + 0.5){
        //    var mians = fromMisesToPolar(80, mi);
        //    console.log(mi, mians);
        //}
        //for (var mi = 0; mi <= 360; mi = mi + 5){
        //    var mians = fromMisesToPolar(mi, data.XDESTR);
        //    console.log(mi, mians);
        //}
        function calcTotalRadius(){
            // SOLVED we are using special radius that had been moved from FUNC2.js (RTET) to configuration, actually there can be not only circle
            var maxIndex = 0;
            var maxRadius = data.cavform[maxIndex].radius;
            for (var c2 = 1, cfLength = data.cavform.length; c2 < cfLength; c2++){
                if (data.cavform[c2].radius > maxRadius){
                    maxRadius = data.cavform[c2].radius;
                    maxIndex = c2;
                }
                //maxRadius = Math.max(maxRadius, data.cavform[c2].radius);
            }
            //console.log("maxRadius", maxRadius, maxIndex);

            // CHECK = HTOTAL + XDESTR;
            var ans = fromMisesToPolar(data.cavform[maxIndex].TETA, data.CHECK).radius;
            //return (maxRadius + data.CHECK) * totalRadiusOffset; // *1.05 to show axis
            return ans * totalRadiusOffset; // *1.05 to show axis
        }
        function initVertices(){
            initPositionVertices();
            initColorVertices(settings.initTime);
        }
        function initPositionVertices(){
            vertexPositions = [];

            var r1, r2, r3, r4;
            var p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y;
            var objectRadius1, objectRadius2;
            totalRadius = calcTotalRadius();

            // add Extra angle, to finish full circle
            for (var c0 = 0, c0len = Math.round(data.CHECK / data.STEPX); c0 < c0len; c0=c0+1){
                for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){

                    // Theta
                    var currentAngle = angles[c1];
                    var nextAngle = angles[c1+1];

                    // transfer from Mizes to Polar
                    var mp1 = fromMisesToPolar(currentAngle, c0 * data.STEPX);
                    var mp2 = fromMisesToPolar(currentAngle, (c0+1) * data.STEPX);
                    var mp3 = fromMisesToPolar(nextAngle, c0 * data.STEPX);
                    var mp4 = fromMisesToPolar(nextAngle, (c0+1) * data.STEPX);

                    currentAngle = mp1.phi;
                    var currentAngle2 = mp2.phi;
                    nextAngle = mp3.phi;
                    var nextAngle2 = mp4.phi;
                    r1 = mp1.radius;
                    r2 = mp2.radius;
                    r3 = mp3.radius;
                    r4 = mp4.radius;

                    // normalization of radiuses
                    r1 = r1 / totalRadius;
                    r2 = r2 / totalRadius;
                    r3 = r3 / totalRadius;
                    r4 = r4 / totalRadius;

                    // zero degree angle is on the top
                    p1x = r2 * Math.sin( deg2rad(currentAngle2) ) * axisX - axisX2;
                    p1y = r2 * Math.cos( deg2rad(currentAngle2) ) * axisY - axisY2;
                    p2x = r1 * Math.sin( deg2rad(currentAngle) ) * axisX - axisX2;
                    p2y = r1 * Math.cos( deg2rad(currentAngle) ) * axisY - axisY2;
                    p3x = r4 * Math.sin( deg2rad(nextAngle2) ) * axisX - axisX2;
                    p3y = r4 * Math.cos( deg2rad(nextAngle2) ) * axisY - axisY2;
                    p4x = r3 * Math.sin( deg2rad(nextAngle) ) * axisX - axisX2;
                    p4y = r3 * Math.cos( deg2rad(nextAngle) ) * axisY - axisY2;

                    // 1st triangle
                    vertexPositions.push( [p1x, p1y, defZ] );
                    vertexPositions.push( [p2x, p2y, defZ] );
                    vertexPositions.push( [p3x, p3y, defZ] );

                    // 2nd triangle
                    vertexPositions.push( [p2x, p2y, defZ] );
                    vertexPositions.push( [p3x, p3y, defZ] );
                    vertexPositions.push( [p4x, p4y, defZ] );
                }
            }

            // central object
            if (settings.showCentralObject){
                for (var c2 = 0, c2len = angles.length - 1; c2 < c2len; c2++) {
                    currentAngle = angles[c2];
                    nextAngle = angles[c2 + 1];

                    // transfer from Mizes to Polar
                    var cmp2 = fromMisesToPolar(currentAngle, 0);
                    var cmp4 = fromMisesToPolar(nextAngle, 0);

                    var ccurrentAngle2 = cmp2.phi;
                    var cnextAngle2 = cmp4.phi;
                    r2 = cmp2.radius;
                    r4 = cmp4.radius;

                    // normalization of radiuses
                    r2 = r2 / totalRadius;
                    r4 = r4 / totalRadius;

                    // zero degree angle is on the top
                    p1x = r2 * Math.sin(deg2rad(ccurrentAngle2)) * axisX - axisX2;
                    p1y = r2 * Math.cos(deg2rad(ccurrentAngle2)) * axisY - axisY2;
                    p3x = r4 * Math.sin(deg2rad(cnextAngle2)) * axisX - axisX2;
                    p3y = r4 * Math.cos(deg2rad(cnextAngle2)) * axisY - axisY2;

                    // 1st triangle
                    vertexPositions.push([p1x, p1y, defZ]);
                    vertexPositions.push([0, 0, defZ]);
                    vertexPositions.push([p3x, p3y, defZ]);
                }
            }

            var N = 3;  // number of components per vertex
            var vertices = new Float32Array( vertexPositions.length * N ); // three components per vertex

            for ( var i = 0, len = vertexPositions.length; i < len; i++ ) {
                for (var j = 0; j < N; j++) vertices[ i*N + j ] = vertexPositions[i][j];
            }

            geometry.attributes.position = new THREE.BufferAttribute( vertices, N );

            geometry.computeBoundingSphere();
        }
        function initColorVertices(currentTime){
            vertexColors = [];

            // it was c0 <= c0len, but in 90degree case it led to an error
            for (var c0 = 0, c0len = Math.round(data.CHECK / data.STEPX); c0 < c0len; c0++){
                for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){
                    var isInvert = false;

                    var recTime = currentTime;

                    if (settings.visualisationSchemeIndex == 2 || settings.visualisationSchemeIndex == 3) {
                        // Blue White Red or Rainbow With Zero in Green
                        // 1st triangle
                        vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0 + 1][c1], cmin, 0, cmax, -1, 0, 1)));
                        vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0][c1], cmin, 0, cmax, -1, 0, 1)));
                        vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0 + 1][c1 + 1], cmin, 0, cmax, -1, 0, 1)));

                        // 2nd triangle
                        vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0][c1], cmin, 0, cmax, -1, 0, 1)));
                        vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0 + 1][c1 + 1], cmin, 0, cmax, -1, 0, 1)));
                        vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0][c1 + 1], cmin, 0, cmax, -1, 0, 1)));
                    } else {
                        // Rainbow color and others single colors schemes
                        var intervalMax = 1;
                        // HSV
                        if (settings.visualisationSchemeIndex == 1) intervalMax = 0.94117647;   // 240 / 255 = 0.94117647, because we don't need red color for both min and max values

                        // 1st triangle
                        vertexColors.push(getColorFromValue(ctd(mem[recTime][c0 + 1][c1], cmin, cmax, 0, intervalMax, isInvert)));
                        vertexColors.push(getColorFromValue(ctd(mem[recTime][c0][c1], cmin, cmax, 0, intervalMax, isInvert)));
                        vertexColors.push(getColorFromValue(ctd(mem[recTime][c0 + 1][c1 + 1], cmin, cmax, 0, intervalMax, isInvert)));

                        // 2nd triangle
                        vertexColors.push(getColorFromValue(ctd(mem[recTime][c0][c1], cmin, cmax, 0, intervalMax, isInvert)));
                        vertexColors.push(getColorFromValue(ctd(mem[recTime][c0 + 1][c1 + 1], cmin, cmax, 0, intervalMax, isInvert)));
                        vertexColors.push(getColorFromValue(ctd(mem[recTime][c0][c1 + 1], cmin, cmax, 0, intervalMax, isInvert)));
                    }

                }
            }

            // central object
            if (settings.showCentralObject) {
                for (var c2 = 0, c2len = angles.length - 1; c2 < c1len; c2++) {
                    var fixR = 0.5;
                    var fixG = 0.5;
                    var fixB = 0.5;
                    vertexColors.push([fixR, fixG, fixB]);
                    vertexColors.push([fixR, fixG, fixB]);
                    vertexColors.push([fixR, fixG, fixB]);
                    //vertexColors.push( [0.5, 1, 0.5] );
                    //vertexColors.push( [Math.random(), Math.random(), Math.random()] );
                    //vertexColors.push( [0.5, 1, 0.5] );
                }
            }

            var N = 3;  // number of components per vertex
            var colors = new Float32Array( vertexColors.length * N );

            for ( var i = 0, len = vertexColors.length; i < len; i++ ) {
                for (var k = 0; k < N; k++) colors[ i*N + k ] = vertexColors[i][k];
            }

            geometry.attributes.color = new THREE.BufferAttribute( colors, N );

            lastCurrentTime = currentTime;
        }
        function reorderMemout(){
            // [time][param][coordinate][angle] to [param][time][coordinate][angle]
            var tstart = Date.now();
            memout = data.memout;
            var lenTime  = memout.length;
            var lenParam = memout[0].length;
            var lenCoord = memout[0][0].length;
            var lenAngle = memout[0][0][0].length;
            var newMemout = MatMult.createArray(lenParam, lenTime, lenCoord, lenAngle);
            for (var i = 0; i < lenTime; i++){
                for (var j = 0; j < lenParam; j++){
                    for (var k = 0; k < lenCoord; k++){
                        newMemout[j][i][k] = memout[i][j][k].slice(0);
                        //for (var m = 0; m < lenAngle; m++){
                        //    newMemout[j][i][k][m] = memout[i][j][k][m];
                        //}
                    }
                }
            }
            memout.length = 0;   // clear array
            angular.extend(memout, newMemout);
            //memout = newMemout;
            console.log("reorder memout:", (Date.now() - tstart), "ms", "; Total elements:", lenTime * lenParam * lenCoord * lenAngle);
        }

        function initScene(){
            var scene = new THREE.Scene();
            return scene;
        }
        function initCamera(){
            var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000); //PerspectiveCamera( 75, 400.0 / 300.0, 0.1, 1000 );
            camera.position.z = 10;
            return camera;
        }

        function initRenderer(){

            var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
            renderer.setClearColor( 0x000000, 0);
            //renderer.setSize( 380-100, 300 );
            //renderer.setSize( window.innerWidth - 100, window.innerHeight );
            rendererSize = {
                width: Math.min(window.innerWidth, window.innerHeight)-75,
                height: Math.min(window.innerWidth, window.innerHeight)-75
            };
            renderer.setSize(rendererSize.width, rendererSize.height);
            //renderer.domElement.style.position = 'absolute';
            renderer.domElement.style.position = 'inherit';
            if ( window.innerWidth / window.innerHeight < 1 ) {
                renderer.domElement.style.right = '50px';
            } else {
                renderer.domElement.style.right = '50px';
            }
            renderer.domElement.style.bottom = '10px';

            //renderer.domElement.addEventListener("click", clickOnCanvas);
            canvasHolderCover.addEventListener("click", clickOnCanvas);

            return renderer;
        }
        function clickOnCanvas(){
            if (data.settings.showControlPointsData == false){
                console.log("you can change control points positions only when they are active");
                return;
            }

            //console.warn(event);
            var screenWidth = renderer.domElement.width;
            var screenHeight = renderer.domElement.height;
            var mouseX = event.offsetX; // can't set (pointX, pointY) to (1,1)
            var mouseY = screenHeight - (event.offsetY);

            if (event.shiftKey == false){
                controlPoints.length = 0;
            }
            //console.warn(mouseX, mouseY, screenWidth, screenHeight);
            controlPoints.push( convertCartesianToPolar(screenWidth, screenHeight, mouseX, mouseY) );
            //controlPoints.push( convertCartesianToMises(screenWidth, screenHeight, mouseX, mouseY) );

            var verticesCPPositions = [];
            for (var pointIndex = 0; pointIndex < controlPoints.length; pointIndex++){
                var controlPoint = controlPoints[pointIndex];
                var controlPointX = controlPoint.radius/totalRadius * Math.sin(deg2rad(controlPoint.angle)) * axisX - axisX2;
                var controlPointY = controlPoint.radius/totalRadius * Math.cos(deg2rad(controlPoint.angle)) * axisY - axisY2;
                verticesCPPositions.push([controlPointX, controlPointY, defZ]);
            }
            var verticesCP = new Float32Array( verticesCPPositions.length * 3 ); // three components per vertex
            for ( var c0 = 0, len0 = verticesCPPositions.length; c0 < len0; c0++ ) {
                for (var j = 0; j < 3; j++) verticesCP[ c0*3 + j ] = verticesCPPositions[c0][j];
            }
            geometryControlPoints.attributes.position = new THREE.BufferAttribute( verticesCP, 3 );
            geometryControlPoints.computeBoundingSphere();

            var vertexCPColors = [];
            for (var c1 = 0; c1 < controlPoints.length; c1++){
                vertexCPColors.push( colorsPresets[c1%5] );
            }
            var colorsCP = new Float32Array( vertexCPColors.length * 3 );
            for ( var c2 = 0, len2 = vertexCPColors.length; c2 < len2; c2++ ) {
                for (var k = 0; k < 3; k++) colorsCP[ c2*3 + k ] = vertexCPColors[c2][k];
            }
            geometryControlPoints.attributes.color = new THREE.BufferAttribute( colorsCP, 3 );

            // it is important, because data for points are fetched from nearestPoints array
            findNearestPoints();

            //setControlPointsData(controls.showCPData, controls.invertCPData);
            $rootScope.$broadcast("updateControlPointsDiagram");
        }
        function convertCartesianToPolar(screenWidth, screenHeight, pointerX, pointerY, invertY){
            // TODO ask Harry, probably should be done method Cartesian to Mises (https://en.wikipedia.org/wiki/Richard_von_Mises)
            var screenX = screenWidth;
            var screenX2 = screenX / 2;
            var screenY = screenHeight;
            var screenY2 = screenY / 2;

            var mouseX = pointerX; // can't set (pointX, pointY) to (1,1)
            var mouseY = pointerY;
            if (invertY) mouseY = screenY - mouseY;

            var pointX = (mouseX - screenX2) / screenX2;
            var pointY = (mouseY - screenY2) / screenY2;
            //console.warn(pointX, pointY);

            var pointDistanceToCenter = Math.sqrt(pointX*pointX + pointY*pointY);
            var pointRadius = pointDistanceToCenter * totalRadius;
            //console.warn(pointDistanceToCenter, pointRadius);

            var pointAngle = 90 - (Math.atan( pointY / pointX) ) * 180 / Math.PI;
            if (pointX < 0) pointAngle += 180;
            //console.warn(pointAngle);

            var ans = { radius: pointRadius, angle: pointAngle};

            var objectRadius = RTET( deg2rad(ans.angle) ) / data.geomprocR;
            var fieldRadius = objectRadius + data.CHECK;
            //console.warn(ans, objectRadius, fieldRadius);
            ans.radius = ans.radius < fieldRadius ? (ans.radius > objectRadius ? ans.radius : objectRadius) : fieldRadius;

            return ans;
        }
        function convertCartesianToMises(screenWidth, screenHeight, pointerX, pointerY, invertY){
            // TODO this method is completly wrong
            var screenX = screenWidth;
            var screenX2 = screenX / 2;
            var screenY = screenHeight;
            var screenY2 = screenY / 2;

            var mouseX = pointerX; // can't set (pointX, pointY) to (1,1)
            var mouseY = pointerY;
            if (invertY) mouseY = screenY - mouseY;

            var pointX = (mouseX - screenX2) / screenX2;
            var pointY = (mouseY - screenY2) / screenY2;
            //console.warn(pointX, pointY);

            var pointDistanceToCenter = Math.sqrt(pointX*pointX + pointY*pointY);
            var pointRadius = pointDistanceToCenter * totalRadius;
            //console.warn(pointDistanceToCenter, pointRadius);

            var pointAngle = 90 - (Math.atan( pointY / pointX) ) * 180 / Math.PI;
            if (pointX < 0) pointAngle += 180;
            //console.warn(pointAngle);

            var polarPoint = { radius: pointRadius, angle: pointAngle};
            var objectRadius = RTET( deg2rad(polarPoint.angle) ) / data.geomprocR;
            var misesPoint = fromMisesToPolar(polarPoint.angle, polarPoint.radius - objectRadius);

            var ans = { radius: misesPoint.radius, angle: misesPoint.phi };
            return ans;
        }

        function initCanvasHolder(){
            var canvasHolder = document.getElementById("mainCanvasHolder");
            if (!canvasHolder){
                console.warn("canvasHolder was not found, appending renderer to document.body");
                canvasHolder = document.body;
            }

            return canvasHolder;
        }

        function initAxisHelper(){
            var axisHelper = new THREE.AxisHelper( 5 );
            return axisHelper;
        }

        function initGeometry(){
            var geometry = new THREE.BufferGeometry();

            var N = 3;  // number of components per vertex
            geometry.addAttribute( 'position',  new THREE.BufferAttribute( [], N ) );
            geometry.addAttribute( 'color',  new THREE.BufferAttribute( [], N ) );

            return geometry;
        }

        // USEFUL METHODS

        function countMinMax(){
            cmin = Number.MAX_VALUE;
            cmax = -Number.MAX_VALUE;
            for (var m0 in mem){
                for (var m1 in mem[m0]){
                    for (var m2 in mem[m0][m1]){
                        cmin = Math.min(cmin, mem[m0][m1][m2]);
                        cmax = Math.max(cmax, mem[m0][m1][m2]);
                    }
                }
            }
            data.cmin = cmin;
            data.cmax = cmax;
            console.log("cmin:", cmin, "; cmax:", cmax);

            if (settings.filter.enabled) {
                filterMinMax();
            }
        }
        function filterMinMax(){
            var startTime = Date.now();

            var prevCmin = cmin;
            var prevCmax = cmax;

            var parts = settings.filter.parts;
            var distance = Math.abs(cmax-cmin);
            var step = distance / parts;
            var stepsValues = [];
            stepsValues.push(cmin);
            for (var i = 0; i < parts; i++) stepsValues.push(cmin + (i+1)*step);

            var valuesInStep = new Array(parts);
            for (var vi = 0; vi < parts; vi++) valuesInStep[vi] = 0;

            for (var m0 in mem){
                for (var m1 in mem[m0]){
                    for (var m2 in mem[m0][m1]){
                        var value = mem[m0][m1][m2];
                        for (var j = 1, jlen = stepsValues.length; j < jlen; j++) {
                            if (value < stepsValues[j]){
                                valuesInStep[j-1]++;
                                break;
                            }
                        }
                    }
                }
            }

            //cmin = stepsValues[6];
            //cmax = stepsValues[parts-2]; // cmax - step;
            cmin = stepsValues[settings.filter.leftBorder];
            cmax = stepsValues[settings.filter.rightBorder];

            var extraAns = "https://plot.ly/alpha/workspace/\n";
            for (var k = 0; k < valuesInStep.length; k++) extraAns += valuesInStep[k].toString() + "\n";
            console.log(((Date.now()-startTime)).toString() + " ms", "filtered cmin:", cmin, "; cmax:", cmax, valuesInStep, stepsValues);
            //console.warn(((Date.now()-startTime)).toString() + " ms", "filtered cmin:", cmin, "; cmax:", cmax, valuesInStep, extraAns, stepsValues);
        }

        function getColorFromValue(value){
            if (settings.visualisationSchemeIndex == 1) {
                return getRainbowColorHSV(value);
            } else if (settings.visualisationSchemeIndex == 2) {
                return getBlueWhiteRedColor(value);
            } else {
                if (settings.visualisationSchemeIndex == 0) return getRainbowColor(value);

                else if (settings.visualisationSchemeIndex == 3) return getRainbowColorZeroInWhite(value);

                else if (settings.visualisationSchemeIndex == 4) return getGrayColor(value);
                else if (settings.visualisationSchemeIndex == 5) return getGreenBlackColor(value);
                else if (settings.visualisationSchemeIndex == 6) return getBlueBlackColor(value);
                else if (settings.visualisationSchemeIndex == 7) return getRedBlackColor(value);

            }
        }
        function getGrayColor(value){
            var SRC_r = value, SRC_g = value, SRC_b = value;
            return [SRC_r, SRC_g, SRC_b];
        }
        function getRedBlackColor(value){
            var SRC_r = value, SRC_g = 0, SRC_b = 0;
            return [SRC_r, SRC_g, SRC_b];
        }
        function getGreenBlackColor(value){
            var SRC_r = 0, SRC_g = value, SRC_b = 0;
            return [SRC_r, SRC_g, SRC_b];
        }
        function getBlueBlackColor(value){
            var SRC_r = 0, SRC_g = 0, SRC_b = value;
            return [SRC_r, SRC_g, SRC_b];
        }

        function getBlueWhiteRedColor(value){
            var borB = -1;  	// Blue
            var borW = 0;    	// White
            var borR = 1;   	// Red

            var SRC_r, SRC_g, SRC_b;

            var bright = 1;
            var power;

            // amplify colors
            if (settings.amplifyColors){
                value *= settings.amplifyCoef;
                if (value < borB) value = borB;
                if (value > borR) value = borR;
                //if (value > 0) SRC_r *= 4; if (SRC_r > 1) SRC_r = 1;
                //if (value < 0) SRC_b *= 4; if (SRC_b > 1) SRC_b = 1;
            }

            if (value < 0){
                power = bright * (value / borB);
                SRC_r = bright - power;
                SRC_g = bright - power;
                SRC_b = 1;
            } else {
                power = bright * (value / borR);
                SRC_r = 1;
                SRC_g = bright - power;
                SRC_b = bright - power;
            }

            //console.log(value, [Math.round(SRC_r * 255), Math.round(SRC_g * 255), Math.round(SRC_b * 255)]);
            return [SRC_r, SRC_g, SRC_b];
        }
        //for (var testI = -1; testI <= 1; testI += 0.25) console.warn(testI, getBlueWhiteRedColor(testI));

        function HSVtoRGB(h, s, v) {
            // http://stackoverflow.com/a/17243070
            var r, g, b, i, f, p, q, t;
            if (arguments.length === 1) {
                s = h.s, v = h.v, h = h.h;
            }
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            //return {
            //    r: Math.round(r * 255),
            //    g: Math.round(g * 255),
            //    b: Math.round(b * 255)
            //};
            return [r, g, b];
        }
        function getRainbowColorHSV(value){
            return HSVtoRGB(value, 1, 1);
        }
        //for (var testI = 0; testI <= 1; testI += 1/6) console.warn("HSV", testI, getRainbowColorHSV(testI));

        // get color from value in diap 0..1
        function getRainbowColor(value){

            var piece = 0.16666666666666666666666666666667;
            var borF = 0 * piece;  		// Fiolet
            var borS = 1 * piece;    	// Sinij
            var borG = 2 * piece;   	// Goluboj
            var borZ = 3 * piece;		// Zelenij
            var borZh = 4 * piece;		// Zheltyj
            var borO = 5 * piece;		// Oranzhevyj
            var borK = 6 * piece;		// Krasnyj

            var SRC_r, SRC_g, SRC_b;
            var bright;

            bright = 1;

            //F - S - G - Z - Zh - O - K
            if ((value >= borF) && (value < borS)) {
                SRC_r = 1;
                SRC_g = 0;
                SRC_b = 1;
                SRC_r = 1 - bright * (value - borF) / piece;
            }
            if ((value >= borS) && (value < borG)) {
                SRC_r = 0;
                SRC_g = 0;
                SRC_b = 1;
                SRC_g = bright * (value - borS) / piece;
            }
            if ((value >= borG) && (value < borZ)) {
                SRC_r = 0;
                SRC_g = 1;
                SRC_b = 1;
                SRC_b = 1 - bright * (value - borG) / piece;
            }
            if ((value >= borZ) && (value < borZh)) {
                SRC_r = 0;
                SRC_g = 1;
                SRC_b = 0;
                SRC_r = bright * (value - borZ) / piece;
            }
            if ((value >= borZh) && (value < borO)) {
                SRC_r = 1;
                SRC_g = 1;
                SRC_b = 0;
                SRC_g = 1 - 0.5 * bright * (value - borZh) / piece;
            }
            if ((value >= borO) && (value <= borK)) {
                SRC_r = 1;
                SRC_g = 0.5;
                SRC_b = 0;
                SRC_g = 0.5 - bright * (value - borO) / piece;
            }

            return [SRC_r, SRC_g, SRC_b];
        }
        //for (var testI = 0; testI <= 1; testI += 1/12) console.warn("RGB", testI, getBlueWhiteRedColor(testI));

        // get color from value in diap -1..1
        function getRainbowColorZeroInGreen(value){

            var piece = 0.16666666666666666666666666666667;
            var borF = 0 * piece;  		// Fiolet
            var borS = 1 * piece;    	// Sinij
            var borG = 2 * piece;   	// Goluboj
            var borZ = 3 * piece;		// Zelenij
            var borZh = 4 * piece;		// Zheltyj
            var borO = 5 * piece;		// Oranzhevyj
            var borK = 6 * piece;		// Krasnyj

            var SRC_r, SRC_g, SRC_b;
            var bright;

            bright = 1;

            //value = (value + 1) / 2;
            value = ctd(value, -1, 1, 0, 1, false);

                //  F - S - G - Z - Zh - O - K
            // -1...........0............1
            if ((value >= borF) && (value < borS)) {
                SRC_r = 1;
                SRC_g = 0;
                SRC_b = 1;
                SRC_r = 1 - bright * (value - borF) / piece;
            }
            if ((value >= borS) && (value < borG)) {
                SRC_r = 0;
                SRC_g = 0;
                SRC_b = 1;
                SRC_g = bright * (value - borS) / piece;
            }
            if ((value >= borG) && (value < borZ)) {
                SRC_r = 0;
                SRC_g = 1;
                SRC_b = 1;
                SRC_b = 1 - bright * (value - borG) / piece;
            }
            if ((value >= borZ) && (value < borZh)) {
                SRC_r = 0;
                SRC_g = 1;
                SRC_b = 0;
                SRC_r = bright * (value - borZ) / piece;
            }
            if ((value >= borZh) && (value < borO)) {
                SRC_r = 1;
                SRC_g = 1;
                SRC_b = 0;
                SRC_g = 1 - 0.5 * bright * (value - borZh) / piece;
            }
            if ((value >= borO) && (value <= borK)) {
                SRC_r = 1;
                SRC_g = 0.5;
                SRC_b = 0;
                SRC_g = 0.5 - bright * (value - borO) / piece;
            }

            return [SRC_r, SRC_g, SRC_b];
        }

        function getRainbowColorZeroInWhite(value){

            var piece = 0.16666666666666666666666666666667;
            var borF = 0 * piece;  		// Fiolet
            var borS = 1 * piece;    	// Sinij
            var borG = 2 * piece;   	// Goluboj
            var borB = 3 * piece;		// Belyj
            var borZ = 4 * piece;		// Zelenyj
            var borZh = 5 * piece;		// Zheltyj
            var borK = 6 * piece;		// Krasnyj

            var SRC_r, SRC_g, SRC_b;
            var bright;

            bright = 1;

            //value = (value + 1) / 2;
            value = ctd(value, -1, 1, 0, 1, false);

            //  F - S - G - B - Z - Zh - K
            // -1...........0............1
            if ((value >= borF) && (value < borS)) {
                SRC_r = 1 - bright * (value - borF) / piece;
                SRC_g = 0;
                SRC_b = 1;
            }
            if ((value >= borS) && (value < borG)) {
                SRC_r = 0;
                SRC_g = bright * (value - borS) / piece;
                SRC_b = 1;
            }
            if ((value >= borG) && (value < borB)) {
                SRC_r = bright * (value - borG) / piece;
                SRC_g = 1;
                SRC_b = 1;
            }
            if ((value >= borB) && (value < borZ)) {
                SRC_r = 1 - bright * (value - borB) / piece;
                SRC_g = 1;
                SRC_b = 1 - bright * (value - borB) / piece;
            }
            if ((value >= borZ) && (value < borZh)) {
                SRC_r = bright * (value - borZ) / piece;
                SRC_g = 1;
                SRC_b = 0;
            }
            if ((value >= borZh) && (value <= borK)) {
                SRC_r = 1;
                SRC_g = 1 - bright * (value - borZh) / piece;
                SRC_b = 0;
            }

            return [SRC_r, SRC_g, SRC_b];
        }

        function testMizesToPolar(){
            var points = [];
            var fixedRadius = 4;
            for (var i = 0; i <= 360; i = i + 5){
                var polarPoint = fromMisesToPolar(i, fixedRadius);
                points.push(polarPoint);
            }
            //console.warn("testMizesToPolar", points);
            var ansStr ="";
            for (var j = 0; j < points.length; j++){
                ansStr += points[j].phi.toFixed(3) + " " + points[j].radius.toFixed(3) + "\n";
            }
            var ansStr2 = "";
            for (var k = 0; k < ansStr.length; k++){
                if (ansStr[k] == ".") ansStr2 += ",";
                else ansStr2 += ansStr[k];
            }
            console.warn(ansStr2);
        }

        function bootstrap(){
            initParamsWithData();

            animate();

            self.visible = true;

            //testMizesToPolar();
        }

        function receivedScrollData(scrollData){
            initColorVertices(scrollData.scrollStep);
        }

        function requestScrollDataAndUpdate(){
            var params = {};
            params.callback = receivedScrollData;
            $rootScope.$broadcast('getScrollData', params);
        }

        // RENDER

        function render() {
            renderer.render(scene, camera);
        }

        function animate() {
            requestAnimationFrame( animate );

            render();
            //stats.update();
        }

        // Events

        $rootScope.$on('dataHaveBeenLoaded', function(event){
            bootstrap();
        });

        $rootScope.$on('scrollEvent', function(event,params){
            initColorVertices( params.scrollData.scrollStep );
        });

        $rootScope.$on('changeCminCmaxEvent', function(event,params){
            cmin = data.cmin;
            cmax = data.cmax;
            requestScrollDataAndUpdate();
        });

        $rootScope.$on('changeSchemeIndex', function(event, params){
            settings.schemeIndex = params.schemeIndex;
            mem.length = 0;
            angular.extend(mem, data.memout[settings.schemeIndex]);
            countMinMax();

            requestScrollDataAndUpdate();
        });

        $rootScope.$on('changeVisualisationSchemeIndex', function(event, params){
            settings.visualisationSchemeIndex = params.visualisationSchemeIndex;
            requestScrollDataAndUpdate();
        });

        // TODO decide what is better $watch or $broadcast($on)
        $scope.$watch('settings.filter', function(newValue, oldValue) {
            console.log("settings.filter changed to", newValue, "; from", oldValue);
            countMinMax();
            requestScrollDataAndUpdate();
        }, true);

        $scope.$watch('settings.amplifyColors', function(newValue, oldValue) {
            console.log("settings.amplifyColors changed to", newValue, "; from", oldValue);
            requestScrollDataAndUpdate();
        });
        $scope.$watch('settings.amplifyCoef', function(newValue, oldValue) {
            console.log("settings.amplifyCoef changed to", newValue, "; from", oldValue);
            requestScrollDataAndUpdate();
        });

        $scope.$watch('settings.showCentralObject', function(newValue, oldValue) {
            if (data.memout === undefined) return;

            console.log("settings.showCentralObject changed to", newValue, "; from", oldValue);
            initPositionVertices();
            requestScrollDataAndUpdate();
        });

        $scope.$watch('settings.showBorderLines', function(newValue, oldValue) {
            if (data.memout === undefined) return;

            console.log("settings.showBorderLines changed to", newValue, "; from", oldValue);
            toggleBorderLines();
        });

        $scope.$watch('settings.showControlPointsData', function(newValue, oldValue) {
            if (data.memout === undefined) return;

            console.log("settings.showControlPointsData (canvas) changed to", newValue, "; from", oldValue);
            toggleControlPoints();
        });

        //$scope.$watch('settings', function(newValue, oldValue) {
        //    console.warn(newValue, oldValue);
        //}, true);

    }]);


    jBBLHControllers.factory('BBLH', [function () {

        var self = this;

        var BBLH;

        init();

        function init(){
            console.log('BBLH factory is here');

            requireBBLH();
        }

        function requireBBLH(){
            BBLH = require("BBLH");
            //self.BBLH = BBLH;
            var data = new BBLH.Datatone();
        }

        //function runSTARTPROC(){
        //    BBLH.BBLHstart.STARTPROC({}, function(){
        //        console.warn("Datatone", data);
        //    });
        //}
        //this.runSTARTPROC = runSTARTPROC;

        return BBLH;
    }]);

    jBBLHControllers.factory('BBLHdataFiles', ['$http', function ($http) {

        var dataFiles = [];

        init();

        function init(){
            getDataFiles();
        }

        function getDataFiles(){
            $http({
                method: 'GET',
                url: '/BBLHfilesList'
            }).then(function successCallback(response) {
                console.log("dataFiles", response.data.allFiles);
                angular.extend(dataFiles, response.data.allFiles);
            }, function errorCallback(response) {
                console.error(response);
            });
        }

        this.dataFiles = dataFiles;

        return this;
    }]);

})(angular, window);