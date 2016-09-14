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
    function noop(){}

    jBBLControllers.controller('jBBLloadingController', ['$rootScope', function($rootScope) {
        var self = this;

        init();

        function init(){
            console.log('jBBLloadingController is here');

            self.visible = false;
        }

        $rootScope.$on('loadingChanged', function(event, params){
            self.visible = params.visible;
        });
    }]);

    jBBLControllers.controller('jBBLfileListController', ['$rootScope','$scope', '$http', 'BBLdataFiles', 'BBL', function($rootScope, $scope, $http, BBLdataFiles, BBL) {
        var self = this;

        var data;

        init();

        function init(){
            console.log('jBBLfileListController is here');

            self.visible = true;

            self.searchString = "";

            self.allFiles = BBLdataFiles.dataFiles;

            data = new BBL.Datatone();
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
                //var BBLstart = BBL.BBLstart;
                //BBLstart.STARTPROC(sceneInput, function(){
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

    jBBLControllers.controller('jBBLscrollController', ['$rootScope','$scope', 'BBL', function($rootScope, $scope, BBL){
        var self = this;

        var data;
        var scrollDiv = document.getElementById("timeScroll");

        init();

        function init(){
            self.visible = false;
            self.scrollPos = 0;

            scrollDiv.addEventListener("scroll", scrollAction);
            scrollDiv.addEventListener("wheel", wheelAction);
            scrollDiv.style.left = "0px";
            scrollDiv.style.top = "0px";
            scrollDiv.style.width = "100%";
            scrollDiv.style.height = "100%";
        }

        function scrollAction(){
            //console.log("scroll");
            if (data === undefined) data = new BBL.Datatone();

            if (data.TM === undefined) {
                // still not loaded
                console.warn("data are not loaded", data);
            } else {

                // http://stackoverflow.com/a/5704386
                var scrollMax = scrollDiv.scrollWidth - scrollDiv.clientWidth;
                var params = {
                    scrollPos: scrollDiv.scrollLeft,
                    scrollMax: scrollMax,
                    scrollStep: Math.round(data.TM / data.STEP * (scrollDiv.scrollLeft / scrollMax))
                };

                $rootScope.$broadcast('scrollEvent', params);

                self.scrollPos = (params.scrollStep * data.DT).toFixed(2) + " s";
                $scope.$digest();
            }
        }
        function wheelAction(event){
            //console.log("wheel");
            //if (data === undefined) data = new BBL.Datatone();
            //
            //if (data.TM === undefined) {
            //    // still not loaded
            //    console.warn("data are not loaded", data);
            //} else {
                var delta = event.wheelDelta;
                // actually, this and scrollDiv are equal
                scrollDiv.scrollLeft -= (delta);

                // http://stackoverflow.com/a/5704386
                //var scrollMax = scrollDiv.scrollWidth - scrollDiv.clientWidth;
                //self.scrollPos = scrollDiv.scrollLeft;
                //var params = {
                //    scrollPos: scrollDiv.scrollLeft,
                //    scrollMax: scrollMax,
                //    scrollStep: Math.round(data.TM / data.STEP * (scrollDiv.scrollLeft / scrollMax) )
                //};
                //self.scrollPos = params.scrollStep;
                // commented because of extra scroll event fired when wheeling
                //$rootScope.$broadcast('wheelEvent', params);
                //console.log(scrollDiv.scrollLeft, [scrollDiv], scrollMax, (scrollDiv.scrollLeft/scrollMax*100).toFixed(2));

                // commented because of extra scroll event fired when wheeling
                //$scope.$digest();

                //event.preventDefault();
            //}
        }

        //$rootScope.$broadcast('dataHaveBeenLoaded');
        $rootScope.$on('dataHaveBeenLoaded', function(event){
            self.visible = true;
        });

    }]);

    jBBLControllers.controller('jBBLcanvasController', ['$rootScope', '$scope', 'BBL', function($rootScope, $scope, BBL){
        var self = this;
        var data;

        init();

        function init(){
            self.visible = false;

            data = new BBL.Datatone();
            self.data = data;
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
            visualisationSchemeIndex += 1;
            $rootScope.$broadcast('changeVisualisationSchemeIndex', {visualisationSchemeIndex: visualisationSchemeIndex});
        }
        this.changeVisualisationSchemeIndex = changeVisualisationSchemeIndex;

    }]);

    jBBLControllers.controller('jBBLmemoutController', ['$rootScope', '$scope', 'BBL', function($rootScope, $scope, BBL){
        var self = this;
        var data;

        init();

        function init(){
            self.visible = false;
            self.showData = false;

            self.currentTabIndex = 2;

            //self.dataNames = window.dataNames;
            self.dataNames = [];

            data = new BBL.Datatone();
            self.data = data;
        }

        function toggleDataTable(){
            if (self.dataNames.length == 0) angular.extend(self.dataNames, window.dataNames);
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

        $rootScope.$on('dataHaveBeenLoaded', function(event){
            self.timeValues = [];
            for (var i = 0; i < data.memout[0].length; i++) self.timeValues.push(i * data.STEP);
            self.radiusValues = [];
            for (var j = 0; j < data.memout[0][0].length; j++) self.radiusValues.push(j * data.STEPX * data.geomprocR);

            self.visible = true;
        });

        function getLayerNumberByCoordinate(X){
            var L, ans;   // integer
            ans=0;
            for (L = data.NL-1; L > 0; L--){
                // TODO this shouldn't be true, but it is (getLayerNumberByCoordinate, probably comparision problems in Fortran)
                if (X < data.HI[L]*data.DX + 1e-6){
                    ans = L;
                    return ans;
                }
            }
            return ans;
        }
        this.getLayerNumberByCoordinate = getLayerNumberByCoordinate;
    }]);

    jBBLControllers.controller('jBBLcanvasHolderController', ['$rootScope', '$scope', 'BBL', function($rootScope, $scope, BBL){
        var self = this;

        var THREE, Stats, dat, data, RTET, MatMult;
        var stats;
        var scene, camera, renderer, canvasHolder, axisHelper, geometry, material, mesh;
        var rendererSize;
        var N, initTime, schemeIndex, mem, visualisationSchemeIndex, angles, radiuses,
            axisX, axisY, axisX2, axisY2, defZ,
            vertexPositions, vertexColors,
            cmin, cmax,
            amplifyColors, amplifyCoef,
            timeStepsCount,
            showControlPoints,
            controlPoints,
            nearestPoints,
            totalRadius,
            totalRadiusOffset,
            extraAngleFix;
        var memout;

        init();

        $rootScope.$on('dataHaveBeenLoaded', function(event){
            bootstrap();
        });

        $rootScope.$on('scrollEvent', function(event,params){
            initColorVertices( params.scrollStep );
        });

        function init(){
            console.log('jBBLcanvasHolderController is here');

            self.visible = false;

            data = new BBL.Datatone();
            RTET = BBL.FUNC2.RTET;

            MatMult = BBL.MatMult;

            initThree();
            stats = initStats();
            initDat();
            initParams();

            scene = initScene();
            camera = initCamera();
            renderer = initRenderer();
            canvasHolder = initCanvasHolder();
            canvasHolder.appendChild( renderer.domElement );

            axisHelper = initAxisHelper();
            scene.add( axisHelper );

            geometry = initGeometry();

            extraAngleFix = false;
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

        function initParams(){
            N = 3;  // number of components per vertex

            initTime = 0;

            // load from Datatone. Mem[time from 0 to 5 (data.TM), with 0.1 (data.DT) step][coord from 0 to 1 (data.XDESTR) with 0.1 (data.STEPX) step][angle from 0 to 90 (data.printPoints) with 15 step]
            schemeIndex = 2;

            visualisationSchemeIndex = 2;   // 1 == rainbow, 2 == blue-white-red

            axisX = 2;
            axisY = 2;   // length of axises
            axisX2 = axisX / 2;
            axisY2 = axisY / 2;
            defZ = 1.0;

            axisX = axisY = 1;
            axisX2 = axisY2 = 0;

            vertexPositions = [];
            vertexColors = [];

            amplifyColors = true;
            amplifyCoef = 1.3;
        }
        function initParamsWithData(){
            // with Data means that BBL.Datatone is available with memout

            //initTime = Math.round(data.TM / data.STEP);
            initTime = 0;

            reorderMemout();
            //mem = memout[schemeIndex];
            mem = [];
            mem.length = 0;
            angular.extend(mem, data.memout[schemeIndex]);
            countMinMax();

            // converting TP to correct array of angles (indexed from 0)
            angles = [];
            for (var cang in data.TP) {
                if (data.TP.hasOwnProperty(cang)) {
                    if (data.TP[cang] != null) angles.push(data.TP[cang]);
                }
            }
            data.angles = angles;
            //console.log("angles:", angles);
            radiuses = getAllRadiusesForAngles(angles);

            timeStepsCount = Math.round(data.TM / data.STEP) + 1;
            console.log("timeStepsCount:", timeStepsCount);

            showControlPoints = false;
            controlPoints = [
                { radius: data.XDESTR + data.rtetA / data.geomprocR, angle: 0 },
                { radius: data.XDESTR + data.rtetB / data.geomprocR, angle: 90 },
                { radius: 5, angle: 30 }
            ];
            nearestPoints = [];
            findNearestPoints();
            console.log("controlPoints", controlPoints, "nearestPoints", nearestPoints);

            totalRadius = 1.0;    // "1.0" is default value
            totalRadiusOffset = 1.05;

            initVertices();

            material = new THREE.MeshBasicMaterial( {
                //color: 0xffffff, // also if set color to 0xbbbbbb brightness will be smaller
                vertexColors: THREE.VertexColors,
                side: THREE.DoubleSide  // if there is only front side it may be rotated with backside (and become invisible)
            } );
            // Almost triangle only view (for real, every second triangle is colored
            //material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 1 } );

            mesh = new THREE.Mesh( geometry, material );
            scene.add(mesh);

            var zeroDegreeText = createText("0°", renderer.domElement.offsetLeft + rendererSize.width/2, renderer.domElement.offsetTop);
            canvasHolder.appendChild(zeroDegreeText);
            var ninetyDegreeText = createText("90°", renderer.domElement.offsetLeft + rendererSize.width, renderer.domElement.offsetTop + rendererSize.height/2);
            canvasHolder.appendChild(ninetyDegreeText);

            window.addEventListener("resize", function(){
                zeroDegreeText.style.left = (renderer.domElement.offsetLeft + rendererSize.width/2).toString() + 'px';
                zeroDegreeText.style.top = renderer.domElement.offsetTop.toString() + 'px';

                ninetyDegreeText.style.left = (renderer.domElement.offsetLeft + rendererSize.width).toString() + 'px';
                ninetyDegreeText.style.top = (renderer.domElement.offsetTop + rendererSize.height/2).toString() + 'px';
            });

        }
        function getAllRadiusesForAngles(angles){
            var radiuses = [];
            for (var i = 0, ilen = angles.length; i < ilen; i++){
                var angle = angles[i] * Math.PI / 180;
                radiuses[i] = RTET(angle) / data.geomprocR;
            }
            return radiuses;
        }
        // converts Num from diap (ds to df) to diap (dmin to dmax)
        function ctd(num, ds, df, dmin, dmax, invert){
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
                        if (!data.cavform[angles[c2]]) skipThis = true;
                        if (skipThis) continue;

                        var objectRadius1 = data.cavform[angles[c2]].radius;
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
        function findNearestCavFormAngle(angle){
            var minDiff = Number.MAX_VALUE;
            var minIndex = -1;
            for (var c0 = 0; c0 < data.cavform.length; c0++){
                if (Math.abs(data.cavform[c0].TETA - angle) < minDiff) {
                    minDiff = Math.abs(data.cavform[c0].TETA - angle);
                    minIndex = c0;
                }
            }
            if (minIndex != -1) return data.cavform[minIndex];
            else {
                console.error("no nearest angle for this angle:", angle);
            }
        }
        function deg2rad(angle){ return angle / 180 * Math.PI; }
        // TODO it could be movedto FUNC2 with name SinGamma
        function derivativeR0(T){
            // from FUNC2.RCURB()
            var DR1, R0, R1, DT = 0.0000000001;
            R1 = RTET(T + DT) / data.geomprocR;
            R0 = RTET(T - DT) / data.geomprocR;
            DR1 = (R1 - R0) / (2 * DT);
            return DR1;
        }
        function fromMizesToPolar(Th, X){
            var ans = { phi: 0, radius: 0 };
            //return {phi: Th, radius: X};

            var theta = Th * Math.PI / 180;

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
        //    var mians = fromMizesToPolar(80, mi);
        //    console.log(mi, mians);
        //}
        //for (var mi = 0; mi <= 360; mi = mi + 5){
        //    var mians = fromMizesToPolar(mi, data.XDESTR);
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
            console.log("maxRadius", maxRadius, maxIndex);

            // CHECK = HTOTAL + XDESTR;
            var ans = fromMizesToPolar(data.cavform[maxIndex].TETA, data.CHECK).radius;
            //return (maxRadius + data.CHECK) * totalRadiusOffset; // *1.05 to show axis
            return ans * totalRadiusOffset; // *1.05 to show axis
        }
        function initVertices(){
            initPositionVertices();
            initColorVertices(initTime);
        }
        function initPositionVertices(){
            vertexPositions = [];

            var r1, r2, r3, r4;
            var p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y;
            var objectRadius1, objectRadius2;
            totalRadius = calcTotalRadius();

            // add Extra angle, to finish full circle
            if (extraAngleFix) angles.push(0);
            for (var c0 = 0, c0len = Math.round(data.CHECK / data.STEPX); c0 < c0len; c0=c0+1){
                for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){

                    // Theta
                    var currentAngle = angles[c1];
                    var nextAngle = angles[c1+1];

                    //if (!data.cavform[currentAngle] || !data.cavform[nextAngle]){
                    //    // SOLVED findNearest works fine, but values are wrong, aren't they? Seems like values are good now
                    //    if (!data.cavform[currentAngle]) console.warn("No angle", currentAngle);
                    //    if (!data.cavform[nextAngle]) console.warn("No angle", nextAngle);
                    //    objectRadius1 = findNearestCavFormAngle(currentAngle).radius;
                    //    objectRadius2 = findNearestCavFormAngle(nextAngle).radius;
                    //} else {
                    //    objectRadius1 = data.cavform[currentAngle].radius;
                    //    objectRadius2 = data.cavform[nextAngle].radius;
                    //}
                    objectRadius1 = radiuses[c1];
                    objectRadius2 = radiuses[c1+1];
                    // X
                    r1 = objectRadius1 + c0 * data.STEPX;
                    r2 = r1 + data.STEPX;
                    r3 = objectRadius2 + c0 * data.STEPX;
                    r4 = r3 + data.STEPX;

                    // transfer from Mizes to Polar
                    var mp1 = fromMizesToPolar(currentAngle, c0 * data.STEPX);
                    var mp2 = fromMizesToPolar(currentAngle, (c0+1) * data.STEPX);
                    var mp3 = fromMizesToPolar(nextAngle, c0 * data.STEPX);
                    var mp4 = fromMizesToPolar(nextAngle, (c0+1) * data.STEPX);

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
            if (extraAngleFix) angles.pop();

            var vertices = new Float32Array( vertexPositions.length * N ); // three components per vertex

            for ( var i = 0, len = vertexPositions.length; i < len; i++ ) {
                for (var j = 0; j < N; j++) vertices[ i*N + j ] = vertexPositions[i][j];
            }

            geometry.attributes.position = new THREE.BufferAttribute( vertices, N );

            geometry.computeBoundingSphere();
        }
        function initColorVertices(currentTime){
            //if (controls && !controls.autoPlay) console.log("initialization of color vertices, time:", currentTime, "; visualisation scheme index:", visualisationSchemeIndex);
            vertexColors = [];

            var extraAngle = false;
            if (extraAngleFix) angles.push(0);
            // it was c0 <= c0len, but in 90degree case it led to an error
            for (var c0 = 0, c0len = Math.round(data.CHECK / data.STEPX); c0 < c0len; c0++){
                for (var c1 = 0, c1len = angles.length-1; c1 < c1len; c1++){
                    extraAngle = (extraAngleFix == true) && (c1 + 1 == c1len);
                    var isInvert = false;

                    var recTime = currentTime;

                    if (extraAngle){
                        if (visualisationSchemeIndex == 2) {
                            // Blue White Red
                            // 1st triangle
                            vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0 + 1][c1], cmin, 0, cmax, -1, 0, 1)));
                            vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0][c1], cmin, 0, cmax, -1, 0, 1)));
                            vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0 + 1][0], cmin, 0, cmax, -1, 0, 1)));

                            // 2nd triangle
                            vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0][c1], cmin, 0, cmax, -1, 0, 1)));
                            vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0 + 1][0], cmin, 0, cmax, -1, 0, 1)));
                            vertexColors.push(getColorFromValue(ctd3(mem[recTime][c0][0], cmin, 0, cmax, -1, 0, 1)));
                        } else {
                            // Rainbow color and others single colors schemes
                            var intervalMax = 1;
                            // HSV
                            if (visualisationSchemeIndex == 1) intervalMax = 0.94117647;   // 240 / 255 = 0.94117647, because we don't need red color for both min and max values

                            // 1st triangle
                            vertexColors.push(getColorFromValue(ctd(mem[recTime][c0 + 1][c1], cmin, cmax, 0, intervalMax, isInvert)));
                            vertexColors.push(getColorFromValue(ctd(mem[recTime][c0][c1], cmin, cmax, 0, intervalMax, isInvert)));
                            vertexColors.push(getColorFromValue(ctd(mem[recTime][c0 + 1][c1 + 1], cmin, cmax, 0, intervalMax, isInvert)));

                            // 2nd triangle
                            vertexColors.push(getColorFromValue(ctd(mem[recTime][c0][c1], cmin, cmax, 0, intervalMax, isInvert)));
                            vertexColors.push(getColorFromValue(ctd(mem[recTime][c0 + 1][c1 + 1], cmin, cmax, 0, intervalMax, isInvert)));
                            vertexColors.push(getColorFromValue(ctd(mem[recTime][c0][c1 + 1], cmin, cmax, 0, intervalMax, isInvert)));
                        }
                    } else {
                        if (visualisationSchemeIndex == 2) {
                            // Blue White Red
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
                            if (visualisationSchemeIndex == 1) intervalMax = 0.94117647;   // 240 / 255 = 0.94117647, because we don't need red color for both min and max values

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
            }
            if (extraAngleFix) angles.pop();

            var colors = new Float32Array( vertexColors.length * N );

            for ( var i = 0, len = vertexColors.length; i < len; i++ ) {
                for (var k = 0; k < N; k++) colors[ i*N + k ] = vertexColors[i][k];
            }

            geometry.attributes.color = new THREE.BufferAttribute( colors, N );
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

            renderer.domElement.addEventListener("click", clickOnCanvas);

            return renderer;
        }
        function clickOnCanvas(){
            console.warn("clickOnCanvas, I do nothing");
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
            console.log("cmin:", cmin, "; cmax:", cmax);
        }

        function getColorFromValue(value){
            if (visualisationSchemeIndex == 1) {
                return getRainbowColorHSV(value);
            } else if (visualisationSchemeIndex == 2) {
                return getBlueWhiteRedColor(value);
            } else {
                if (visualisationSchemeIndex == 0) return getRainbowColor(value);
                else if (visualisationSchemeIndex == 3) return getGrayColor(value);
                else if (visualisationSchemeIndex == 4) return getRedBlackColor(value);
                else if (visualisationSchemeIndex == 5) return getGreenBlackColor(value);
                else if (visualisationSchemeIndex == 6) return getBlueBlackColor(value);
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
            if (amplifyColors){
                value *= amplifyCoef;
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


        // RENDER

        function render() {
            renderer.render(scene, camera);
        }

        function animate() {
            requestAnimationFrame( animate );

            render();
            stats.update();
        }

        // GLOBAL METHODS

        $rootScope.$on('changeSchemeIndex', function(event, params){
            schemeIndex = params.schemeIndex;
            mem.length = 0;
            angular.extend(mem, data.memout[schemeIndex]);
            countMinMax();
            initColorVertices(initTime);
        });

        $rootScope.$on('changeVisualisationSchemeIndex', function(event, params){
            visualisationSchemeIndex = params.visualisationSchemeIndex;
            initColorVertices(initTime);
        });

        function bootstrap(){
            initParamsWithData();

            animate();

            self.visible = true;
        }
    }]);


    jBBLControllers.factory('BBL', [function () {

        var self = this;

        var BBL;

        init();

        function init(){
            console.log('BBL factory is here');

            requireBBL();
        }

        function requireBBL(){
            BBL = require("BBL");
            //self.BBL = BBL;
            var data = new BBL.Datatone();
        }

        //function runSTARTPROC(){
        //    BBL.BBLstart.STARTPROC({}, function(){
        //        console.warn("Datatone", data);
        //    });
        //}
        //this.runSTARTPROC = runSTARTPROC;

        return BBL;
    }]);

    jBBLControllers.factory('BBLdataFiles', ['$http', function ($http) {

        var dataFiles = [];

        init();

        function init(){
            getDataFiles();
        }

        function getDataFiles(){
            $http({
                method: 'GET',
                url: '/BBLfilesList'
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