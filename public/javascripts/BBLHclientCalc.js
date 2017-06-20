/**
 * Created by jaric on 30.05.2017.
 */

requirejs.config({
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BBLH/lib/node_modules/async/lib/async',
        fs: 'BBLH/lib/node_modules/fsFake/fsFake',
        BBLH: 'BBLH/lib/BBLH',

        Chart: 'Chart',

        angular: 'angular',
        'ui-bootstrap-tpls-0.12.0': 'ui-bootstrap-tpls-0.12.0',
        jBBLHClientCalcApp: 'BBLHclientCalcApp/jBBLHClientCalcApp',
        jBBLHClientCalcControllers: 'BBLHclientCalcApp/jBBLHClientCalcControllers'
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
        'jBBLHClientCalcApp': {
            deps:['angular']
        },
        'jBBLHClientCalcControllers': {
            deps: ['jBBLHClientCalcApp']
        }
    }
});

requirejs(['BBLH', 'Chart', 'angular', 'jBBLHClientCalcApp', 'jBBLHClientCalcControllers'], function(BBLH, Chart, angular, jBBLHClientCalcApp, jBBLHClientCalcControllers) {

    console.warn(angular, jBBLHClientCalcApp, jBBLHClientCalcControllers);

    // init angular application (instead of ng-app directive in view)
    angular.element(document).ready(function() {
        angular.bootstrap(document, [jBBLHClientCalcApp.name]);
    });

    var data = (new BBLH.Datatone());
    //BBLH.BBLHup.run({}, runCallback);

    var domCurrentTime = document.getElementById("currentTime");
    domCurrentTime.innerHTML = "current time";
    var hasSent = false;

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

            hasSent = true;
            domCurrentTime.innerHTML += " (sent)";

            window.connectToApp(data);
        });

    }
    window.runCallback = runCallback;

    function buildName(data){
        var name = "_BBLH_";
        //name += data.inputData.printPoints[data.inputData.printPoints.length-1].toFixed(0);
        //name += 'x' + (data.inputData.printPoints[data.inputData.printPoints.length-1] - data.inputData.printPoints[data.inputData.printPoints.length-2]).toFixed(0);
        //name += '_';
        name += (data.inputData.TM < 10 ? '0' : '') + data.inputData.TM.toFixed(0) + 's';
        name += '_';
        name += 'H' + data.inputData.HDAY.toFixed(0);
        name += '_';
        name += data.inputData.NL.toFixed(0) + 'NL';
        name += '(';
        for (var i = 0; i < data.inputData.NL; i++) name += data.inputData.layers[i].H.toFixed(0) + (i+1==data.inputData.NL? ')' : ',');
        //name += data.inputData.XDESTR.toFixed(1) + 'xd';
        //name += '_';
        name += data.inputData.EPUR.toFixed(0) + 'e';
        name += '_';
        name += data.inputData.INDEX.toFixed(0) + 'i';
        name += '_';
        name += data.inputData.ALFA.toFixed(0) + 'deg';
        name += '_';
        name += data.inputData.rtetN.toFixed(0) + 'N';
        name += '_';
        name += data.inputData.rtetA.toFixed(0) + 'A';
        name += '_';
        name += data.inputData.rtetB.toFixed(0) + 'B';
        name += '_';
        name += data.inputData.needRealValues ? 'real' : 'norm';
        if (data.inputData.rtetNoEdge == false){
            name += '_';
            name += '(Edge' + data.inputData.rtetVortex.toFixed(0) + 'deg,' + data.inputData.rtetC.toFixed(0) + 'C,' + data.inputData.rtetN1.toFixed(0) + 'N1,' + data.inputData.rtetN2.toFixed(0) + 'N2' + ')';
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

    var domCurrentS0 = document.getElementById("currentS0");
    var domCurrentGeomprocS = document.getElementById("currentGeomprocS");
    var domCurrentGeomprocR = document.getElementById("currentGeomprocR");

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

        var currentT;
        var TM = data.STATICTM + data.TM;

        if (data.status.isCOUNTPROC) currentT = data.STATICTM + data.currentT;
        else currentT = data.currentT;

        var str = "";
        if (currentT < 0){
            str += "preparing...";
            str += " (" + (1.1 * data.XDESTR + currentT).toFixed(2) + " of " + (1.1 * data.XDESTR).toFixed(2) +  ")";
        } else if (data.status.active) {
            str += currentT.toFixed(2) + " of " + TM.toFixed(2) + "["+ data.STATICTM.toFixed(2) + "+" + data.TM.toFixed(2) + "] s";
            str += " (" + (currentT / TM * 100).toFixed(0) + "%)";

            if (lastT != currentT){
                if (lastDiff != 0) {
                    var a1 = Date.now() - lastDiff;
                    var n = (TM - currentT) / data.DT;
                    estimatedT = n * (a1 + a1/2)/2; // sum of arithmetic progression
                    if (maximalT == 0) maximalT = estimatedT;
                }
                lastDiff = Date.now();
                lastT = currentT;
            }
            str += " [" + ((Date.now() - data.status.startTime)/1000).toFixed(0) + "s of estimated total " + (maximalT/1000).toFixed(0) + "s" + " (or " + ((Date.now() - data.status.startTime + estimatedT)/1000).toFixed(0) + "s)" + "]";
        } else {
            str += TM.toFixed(2) + " s";
            str += " (" + (TM / TM * 100).toFixed(0) + "%)";
        }
        if (data.status.duration) str += "; " + (data.status.duration/1000/60).toFixed(2) + " min passed";
        if (data.status.duration && hasSent) str += " (sent)";
        domCurrentTime.innerHTML = str;

        domCurrentS0.innerHTML = domCurrentS0.innerHTML.substr(0, 4) + " " + (data.S0 * data.C0 * data.RC0 * 1e-6).toFixed(3) + " MPa";
        domCurrentGeomprocS.innerHTML = domCurrentGeomprocS.innerHTML.substr(0, 3) + " " + (data.geomprocS).toFixed(3) + " m²";
        domCurrentGeomprocR.innerHTML = domCurrentGeomprocR.innerHTML.substr(0, 3) + " " + (data.geomprocR).toFixed(3) + " m";

        if (currentT > 0 && Math.abs(parseInt(currentT) - currentT ) < 1e-6) {
            var url = window.location.href;
            var addressArr = url.split("/");
            ajaxWrapper('POST', {time: parseInt(currentT)}, addressArr[0] + "//" + addressArr[2] + "/calcTime", function(status, responseText){
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

        if (data.status.active == false) doCheckTime = false;

        if (doCheckTime){
            setTimeout( checkTime, checkInterval);
        }
    }

});