/**
 * Created by jaric on 25.02.2016.
 */

(function (angular, window){

    "use strict";

    console.log("jClientCalcControllers", angular);

    var jClientCalcControllers = angular.module('jClientCalcControllers', []);

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    var calcCtrl = null;
    // method that is called by clientCalc.js after calculations have finished
    window.connectToApp = function(param){
        calcCtrl.drawMe(param);
    };

    window.changeBodyFontSize = function(fontSize){
        var bodyDOM = document.body;
        var style = bodyDOM.style;
        console.log(fontSize, style);
    };

    jClientCalcControllers.controller('jClientInputCalcController', ['$scope', '$window', function($scope, $window) {
        var self = this;
        init();

        var BB, data, inputObject, userData;

        function init(){
            console.log("jClientInputCalcController init");

            userData = {
                TM: 30,
                XDESTR: 4,
                EPUR: 2,
                INDEX: 0,
                ALFA: 0,
                rtetN: 4,
                rtetA: 2.05,
                rtetB: 4.05,

                rtetN1: 1.3,
                rtetN2: 1.2,
                rtetC: 4.5,
                rtetVortex: 0,
                rtetNoEdge: true,

                needRealValues: true
            };
            inputObject = {
                userInput: true,
                userData: userData
            };

            self.inputParams = userData;
            self.visibility = true;
        }

        function startCalculactions(){
            self.visibility = false;

            BB.BBup.run(inputObject, $window.runCallback);
        }
        this.startCalculactions = startCalculactions;

        $window.onload = function(e) {
            BB = require('BB');
            data = new BB.Datatone();
            //console.log("data", data);
        };

    }]);

    jClientCalcControllers.controller('jClientCalcController', ['$scope', function($scope) {

        var self = this;
        init();

        function init(){
            calcCtrl = self;

            //self.dataNames = ['V1', 'V2', 'S11', 'S12', 'S22', 'V01', 'V02', 'S011', 'S012', 'S022'];
            self.dataNames = ['V1', 'V2', 'S11', 'S12', 'S22'];

            console.log("jClientCalcController init");
        }

        function drawMe(param){
            console.log("we have a params here:", param);

            self.data = param;

            var curTime = Date.now();
            //$scope.$apply();
            $scope.$digest();
            console.log("Time to update $scope:", (Date.now() - curTime), "msec");
        }
        this.drawMe = drawMe;

        function changeCellValueOnServer(scopeCellHas){
            console.log(scopeCellHas);
            console.log("indices:", scopeCellHas.$parent.$parent.$parent.$index, scopeCellHas.$parent.$parent.$index, scopeCellHas.$parent.$index, scopeCellHas.$index);
            console.log("we have some code here to change direct value of cell, just uncomment the following code");

            //self.data.memOut
            //    [scopeCellHas.$parent.$parent.$parent.$index]
            //    [scopeCellHas.$parent.$parent.$index]
            //    [scopeCellHas.$parent.$index]
            //    [scopeCellHas.$index] = 3.3806873310289274e-8; // 1e-31; //3.3806873310289274e-8
            //
            //var url = window.location.href;
            //var addressArr = url.split("/");
            //ajaxWrapper('POST', self.data.memOut, addressArr[0] + "//" + addressArr[2] + "/memout", function(status, responseText){
            //    console.log("memOut has been post to", addressArr[2], "status code:", status, "server message:", responseText);
            //
            //    window.connectToApp(self.data);
            //});

        }
        this.changeCellValueOnServer = changeCellValueOnServer;

        function changeBodyFontSize(fontSize){
            if (!isNumber(fontSize)) {
                console.error("wrong fontSize", fontSize);
                return null;
            }

            var bodyDOM = document.body;
            var style = bodyDOM.style;
            console.log(fontSize, style);
            style.fontSize = fontSize.toString() + "px";
        }
        this.changeBodyFontSize = changeBodyFontSize;

        function calcAllWatchers() {
            // http://stackoverflow.com/a/18526757
            var root = angular.element(document.getElementsByTagName('body'));

            var watchers = [];

            var f = function (element) {
                angular.forEach(['$scope', '$isolateScope'], function (scopeProperty) {
                    if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
                        angular.forEach(element.data()[scopeProperty].$$watchers, function (watcher) {
                            watchers.push(watcher);
                        });
                    }
                });

                angular.forEach(element.children(), function (childElement) {
                    f(angular.element(childElement));
                });
            };

            f(root);

            // Remove duplicate watchers
            var watchersWithoutDuplicates = [];
            angular.forEach(watchers, function(item) {
                if(watchersWithoutDuplicates.indexOf(item) < 0) {
                    watchersWithoutDuplicates.push(item);
                }
            });

            console.log(watchersWithoutDuplicates.length);
        }
        this.calcAllWatchers = calcAllWatchers;

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
            var inputStr = input.toExponential(); //.toString(); // no need, as mozilla docs say toExponential returns string
            if (input === 0) {
                return input;
            }else{
                var ans = "";
                var symbolsAfterDot = 3;
                ans = input.toExponential(symbolsAfterDot);
                //var signIndex = inputStr.indexOf("-");
                //// SOLVED if separator isn't "." (learn how toExponential() uses locales). It seems like locales apply after.
                //var separator = ".";
                //var dotIndex = inputStr.indexOf(separator);
                //var eIndex = inputStr.indexOf("e");
                //if (signIndex == 0) ans += "-";
                //// Maybe it will be better to use (number % 1) instead of this substring methods
                //if (dotIndex != -1){
                //    if (signIndex == 0) ans += inputStr.substr(1, 1);
                //    else ans += inputStr.substr(0, 1);
                //
                //    var realLengthOfFractionalPart = Math.min(symbolsAfterDot, eIndex - dotIndex);
                //    ans += separator;
                //    ans += inputStr.substr(dotIndex + 1, realLengthOfFractionalPart);
                //}else ans += inputStr.substr(0, eIndex);
                //ans += inputStr.substr(eIndex, inputStr.length - eIndex);
                return ans;
            }
        };
    }]);

    function ajaxWrapper(mode, theJson, toUrl, callback){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open(mode, toUrl, true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
        xmlhttp.onreadystatechange = function () { //Call a function when the state changes.
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //console.log(xmlhttp.responseText);
                callback(xmlhttp.status, xmlhttp.responseText);
            }else {
                console.log("xmlhttp.readyState:", xmlhttp.readyState == 4, "status:", xmlhttp.status);
                //callback(xmlhttp.status); // here we had several callbacks fired while we need only one
            }
        };
        var parameters = JSON.stringify(theJson);
        xmlhttp.send(parameters);
    }

})(angular, window);