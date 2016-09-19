/**
 * Created by jaric on 24.02.2016.
 */

requirejs.config({
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BBL/lib/node_modules/async/lib/async',
        fs: 'BBL/lib/node_modules/fsFake/fsFake',
        BBL: 'BBL/lib/BBL',

        Chart: 'Chart',

        angular: 'angular',
        'ui-bootstrap-tpls-0.12.0': 'ui-bootstrap-tpls-0.12.0',
        jBBLClientCalcApp: 'BBLclientCalcApp/jBBLClientCalcApp',
        jBBLClientCalcControllers: 'BBLclientCalcApp/jBBLClientCalcControllers'
    },
    shim: {
        'THREE': {
            exports: 'THREE'
        },
        'dat': {
            exports: 'dat'
        },
        'Stats': {
            exports: 'Stats'
        },
        'Chart': {
            exports: 'Chart'
        },
        'angular': {
            exports: 'angular'
        },
        'jBBLClientCalcApp': {
            deps:['angular']
        },
        'jBBLClientCalcControllers': {
            deps: ['jBBLClientCalcApp']
        }
    }
});

requirejs(['BBL', 'Chart', 'angular', 'jBBLClientCalcApp', 'jBBLClientCalcControllers'], function(BBL, Chart, angular, jBBLClientCalcApp, jBBLClientCalcControllers) {

    console.warn(angular, jBBLClientCalcApp, jBBLClientCalcControllers);

    // init angular application (instead of ng-app directive in view)
    angular.element(document).ready(function() {
        angular.bootstrap(document, [jBBLClientCalcApp.name]);
    });

    var data = (new BBL.Datatone());
    //BBL.BBLup.run({}, runCallback);

    function runCallback(){
        var dataToSend = {};
        //dataToSend.memOut = data.memOut;
        //dataToSend.G = data.G;
        //dataToSend.inputData = data.inputData;
        // to prevent data copy, using black list for params I don't want to send to server
        // TODO blackList = ["files", "fds"];
        var blackList = ["files", "fds"];
        for (var param in data){
            if (!data.hasOwnProperty(param)) continue;
            var allowToSend = true;
            for (var c0 = 0; c0 < blackList.length; c0++){
                if (param == blackList[c0]){
                    allowToSend = false;
                    break;
                }
            }
            if (allowToSend){
                dataToSend[param] = data[param];
            }
        }

        var url = window.location.href;
        var addressArr = url.split("/");
        //ajaxWrapper('POST', data.memOut, addressArr[0] + "//" + addressArr[2] + "/memout", function(status, responseText){
        // 360x5_30s_4xd_epur0_45deg_circleCube_config(19min)
        var name = buildName(data);

        console.warn("dataToSend", dataToSend);
        // TODO use zip files instead of json (https://github.com/Stuk/jszip), it should reduce size of files by 3 times
        ajaxWrapper('POST', dataToSend, addressArr[0] + "//" + addressArr[2] + "/memout" + "/" + name, function(status, responseText){
            console.log("dataToSend has been post to", addressArr[2], "status code:", status, "server message:", responseText);

            window.connectToApp(data);
        });

    }
    window.runCallback = runCallback;

    function buildName(data){
        var name = "_BBL_";
        name += data.inputData.printPoints[data.inputData.printPoints.length-1].toFixed(0);
        name += 'x' + (data.inputData.printPoints[data.inputData.printPoints.length-1] - data.inputData.printPoints[data.inputData.printPoints.length-2]).toFixed(0);
        name += '_';
        name += (data.inputData.TM < 10 ? '0' : '') + data.inputData.TM.toFixed(1) + 's';
        name += '_';
        name += data.inputData.XDESTR.toFixed(1) + 'xd';
        name += '_';
        name += data.inputData.EPUR.toFixed(0) + 'e';
        name += '_';
        name += data.inputData.INDEX.toFixed(0) + 'i';
        name += '_';
        name += data.inputData.NL.toFixed(0) + 'NL';
        name += '_';
        name += data.inputData.ALFA.toFixed(0) + 'deg';
        name += '_';
        name += data.inputData.rtetN.toFixed(0) + 'N';
        name += '_';
        name += data.inputData.rtetA.toFixed(2) + 'A';
        name += '_';
        name += data.inputData.rtetB.toFixed(2) + 'B';
        name += '_';
        name += data.inputData.needRealValues ? 'real' : 'norm';
        if (data.inputData.rtetNoEdge == false){
            name += '_';
            name += '(Edge' + data.inputData.rtetVortex.toFixed(0) + 'deg,' + data.inputData.rtetC.toFixed(2) + 'C,' + data.inputData.rtetN1.toFixed(2) + 'N1,' + data.inputData.rtetN2.toFixed(2) + 'N2' + ')';
        }
        name += '(' + (data.status.duration/1000/60).toFixed(1) + 'min)';

        return name;
    }

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

    var domCurrentTime = document.getElementById("currentTime");
    domCurrentTime.innerHTML = "current time";

    var doCheckTime = true;
    var checkInterval = 1000;
    var lastDiff = 0;
    var lastT = 0;
    var estimatedT = 0;
    var maximalT = 0;

    setTimeout(checkTime, checkInterval);

    function checkTime(){
        // if it isn't started try a bit later
        if (!data.status) {
            setTimeout( checkTime, checkInterval);
            return;
        }

        var str = "";
        if (data.currentT < 0){
            str += "preparing...";
            str += " (" + (1.1 * data.XDESTR + data.currentT).toFixed(2) + " of " + (1.1 * data.XDESTR).toFixed(2) +  ")";
        } else if (data.currentT < data.TM) {
            str += data.currentT.toFixed(2) + " of " + data.TM.toFixed(2) + " s";
            str += " (" + (data.currentT / data.TM * 100).toFixed(0) + "%)";

            if (lastT != data.currentT){
                if (lastDiff != 0) {
                    var a1 = Date.now() - lastDiff;
                    var n = (data.TM - data.currentT) / data.DT;
                    estimatedT = n * (a1 + a1/2)/2; // sum of arithmetic progression
                    if (maximalT == 0) maximalT = estimatedT;
                }
                lastDiff = Date.now();
                lastT = data.currentT;
            }
            str += " [" + ((Date.now() - data.status.startTime)/1000).toFixed(0) + "s of estimated total " + (maximalT/1000).toFixed(0) + "s" + " (or " + ((Date.now() - data.status.startTime + estimatedT)/1000).toFixed(0) + "s)" + "]";
        } else {
            str += data.TM.toFixed(2) + " s";
            str += " (" + (data.TM / data.TM * 100).toFixed(0) + "%)";
        }
        if (data.status.duration) str += "; " + (data.status.duration/1000/60).toFixed(2) + " min left";
        domCurrentTime.innerHTML = str;

        if (data.currentT > 0 && Math.abs(parseInt(data.currentT) - data.currentT ) < 1e-6) {
            var url = window.location.href;
            var addressArr = url.split("/");
            ajaxWrapper('POST', {time: parseInt(data.currentT)}, addressArr[0] + "//" + addressArr[2] + "/calcTime", function(status, responseText){
                if (status === 200 || status === 304){
                    if (responseText != undefined){
                        console.log("last time has been sent");
                    }
                } else {
                    //alert("GET status:" + status.toString() + ", something goes wrong in ajaxWrapper GET " + addressArr[0] + "//" + addressArr[2] + "/memout");
                    console.log("GET status:", status, responseText);
                }
            });
        }

        if (data.currentT >= data.TM ) doCheckTime = false;

        if (doCheckTime){
            setTimeout( checkTime, checkInterval);
        }
    }

});