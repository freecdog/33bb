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
        jBBLHClientCalcControllers: 'BBLHclientCalcApp/jBBLHClientCalcControllers',

        JSZip: 'jszip'
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
        },
        'JSZip': {
            exports: 'JSZip'
        }
    }
});

requirejs(['BBLH', 'Chart', 'angular', 'jBBLHClientCalcApp', 'jBBLHClientCalcControllers', 'JSZip'], function(BBLH, Chart, angular, jBBLHClientCalcApp, jBBLHClientCalcControllers, JSZip) {

    console.log(angular, jBBLHClientCalcApp, jBBLHClientCalcControllers);

    function noop(){}
    function zipData(data, dataType, callback){
        var startTime = Date.now();
        callback = callback || noop;
        var zip = new JSZip();
        var stringifiedData = JSON.stringify(data);
        zip.file("1.txt", stringifiedData);
        stringifiedData = null;
        zip.generateAsync({
            type: dataType,
            compression: "deflate",
            compressionOptions: {level: 4}
        }).then(function(zipped) {
            zip = null;
            callback(zipped);
            console.log("zipped for " + ((Date.now() - startTime)/1000).toString() + " s");
            // 10s calc, 26617136 bytes
            // len: 16569090, level: 1 === 5.758 s
            // len: 15534884, level: 4 === 7.008 s (264mb -> 639mb on zipping -> 470mb -> 411mb)
            // len: 15264680, level: 6 === 9.075 s
            // len: 15104735, level: 9 === 14.129 s
        });
    }
    function unzipData(zippedData, dataType, callback){
        var JSZip = require('JSZip');
        callback = callback || noop;
        var unzip = new JSZip();
        unzip.loadAsync(zippedData).then(function(unzipped){
            unzipped.file("1.txt").async(dataType).then(function (fileData){
                var fr = new FileReader();
                fr.onload = function() {
                    fileData = null;
                    callback(JSON.parse(this.result));
                };
                fr.readAsText(fileData);
            });
        });
    }
    // test
    //var dataToZip = [0, 1, "2", [6, "7", {c: "8", d: 9}, 10],{a: 3, b: "4"}, 5];
    //zipData(dataToZip, function(zipped){
    //    unzipData(zipped, function(unzipped){
    //        console.warn("functions", unzipped);
    //    });
    //});

    function uploadFormData(url, formData, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.onload = function(e) {
            console.log("uplodaded formData", e);
            callback(e);
        };
        // Listen to the upload progress.
        //xhr.upload.onprogress = function(e) {};
        xhr.send(formData);
    }

    // init angular application (instead of ng-app directive in view)
    angular.element(document).ready(function() {
        angular.bootstrap(document, [jBBLHClientCalcApp.name]);
    });

    var data = (new BBLH.Datatone());

    var domCurrentProgress = document.getElementById("currentProgress");
    var domCurrentTime = document.getElementById("currentTime");
    domCurrentTime.innerHTML = "current time";
    var hasSent = false;
    var hasZipped = false;
    var runCallbackFired = false;

    function runCallback(){
        runCallbackFired = true;

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
        var name = buildName(data);

        console.log("dataToSend", dataToSend);

        // upload zipped
        // DONE slice, zip, send, repeat
        var async = require('async');

        var zipId = Math.random().toString().slice(2);
        var MEMOUT_ZIP_LENGTH = 17;
        var domLastValue = domCurrentTime.innerHTML;
        var asyncWhilstIndex = 0;
        var zipSteps = Math.ceil(dataToSend.memout.length / MEMOUT_ZIP_LENGTH); // ceil(7/3) = 3; ceil(6/3) = 2
        var timeBeforeZipAndUpload = Date.now();

        async.whilst(
            function(){
                var calcNext = dataToSend.memout.length > 0;

                return calcNext;
            },
            function(callback){
                domCurrentTime.innerHTML = domLastValue + "<br>zipping " + asyncWhilstIndex.toString() + " of " + zipSteps.toString();

                var recMemoutSplice = dataToSend.memout.splice(-MEMOUT_ZIP_LENGTH);

                zipData(recMemoutSplice, "blob", function(zipped){
                    console.log(asyncWhilstIndex.toString() + ") recMemoutSplice is zipped, length is " + zipped.size);
                    var formData = new FormData();
                    formData.append("zipped", zipped);
                    formData.append("options", JSON.stringify( {memoutIndex: asyncWhilstIndex, name: name} ));

                    domCurrentTime.innerHTML = domLastValue + "<br>uploading " + asyncWhilstIndex.toString() + " of " + zipSteps.toString();

                    uploadFormData(addressArr[0]+"//"+addressArr[2]+"/memout/zippart/" + zipId, formData, function(event){
                        zipped = null;
                        formData = null;
                        recMemoutSplice = null;

                        asyncWhilstIndex++;
                        callback();
                    });
                });
            },
            function(err){
                if (err) console.error(err, "BBLHclientCalc.runCallback() error");

                zipData(dataToSend, "blob", function(zipped){
                    console.log(asyncWhilstIndex.toString() + ") The rest of dataToSend is zipped, length is " + zipped.size);
                    var formData = new FormData();
                    formData.append("zipped", zipped);
                    formData.append("options", JSON.stringify( {memoutIndex: asyncWhilstIndex, lastPart: true, name: name} ));

                    uploadFormData(addressArr[0]+"//"+addressArr[2]+"/memout/zippart/" + zipId, formData, function(event){
                        zipped = null;
                        formData = null;

                        domCurrentTime.innerHTML = domLastValue + "<br>zipped and uploaded for <span class='text-success'>" + ((Date.now()-timeBeforeZipAndUpload)/1000).toString() + " s</span>";
                        domCurrentProgress.style.width = "100%";
                    });
                });

                // TODO send inputData

            }
        );

        /*
        var domLastValue = domCurrentTime.innerHTML;
        domCurrentTime.innerHTML += "<br>start zipping now";
        var zipStartTime = Date.now();
        zipData(dataToSend, "blob", function(zipped){
            var url = window.location.href;
            var addressArr = url.split("/");
            console.log("File is zipped, length is " + zipped.size);

            domCurrentTime.innerHTML = domLastValue + "<br>zipped for <span class='text-success'>" + ((Date.now()-zipStartTime)/1000).toString() + " s</span>";

            var formData = new FormData();
            formData.append("zipped", zipped);
            formData.append("somedata", JSON.stringify([0, 1, "2", [6, "7", {c: "8", d: 9}, 10],{a: 3, b: "4"}, 5]));

            domLastValue = domCurrentTime.innerHTML;
            domCurrentTime.innerHTML += "<br>start zipping now";

            var uploadStartTime = Date.now();
            uploadFormData(addressArr[0] + "//" + addressArr[2] + "/memout/zipped" + "/" + name, formData, function(event){
                domCurrentTime.innerHTML = domLastValue + "<br>sent for <span class='text-success'>" + ((Date.now()-uploadStartTime)/1000).toString() + " s</span>";
                domCurrentProgress.style.width = "100%";
            });
        });
        */
    }
    window.runCallback = runCallback;

    function buildName(data){
        var name = "_BBLH_";
        //name += data.inputData.printPoints[data.inputData.printPoints.length-1].toFixed(0);
        //name += 'x' + (data.inputData.printPoints[data.inputData.printPoints.length-1] - data.inputData.printPoints[data.inputData.printPoints.length-2]).toFixed(0);
        //name += '_';
        name += (data.S0*data.C0*data.RC0*1e-6).toFixed(1)+ "S_";    //CalcCtrl.data.S0 * CalcCtrl.data.C0 * CalcCtrl.data.RC0 * 1e-6
        name += (data.inputData.seismicEventEnergy*1e-9).toFixed(1)+ "J_";
        name += (data.inputData.TM < 10 ? '0' : '') + data.inputData.TM.toFixed(0) + 's';
        name += '(st'+(data.inputData.STATICTM < 10 ? '0' : '') + data.inputData.STATICTM.toFixed(0) + ')';
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
        name += '_' + data.inputData.comment + '_';
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

        if (runCallbackFired) return;

        var currentT;
        var TM = data.STATICTM + data.TM;

        if (data.status.isCOUNTPROC) currentT = data.STATICTM + data.currentT;
        else currentT = data.currentT;
        if (currentT > data.STATICTM + data.TM) currentT = data.STATICTM + data.TM;

        var progressLevel = currentT / (data.STATICTM + data.TM) ;
        domCurrentProgress.style.width = parseInt(progressLevel * 100).toString() + "%";

        var str = "";
        if (currentT < 0){
            str += "preparing...";
            str += " (" + (1.1 * data.XDESTR + currentT).toFixed(2) + " of " + (1.1 * data.XDESTR).toFixed(2) +  ")";
        } else if (data.status.active) {
            str += currentT.toFixed(2) + " of " + TM.toFixed(2) + " ["+ data.STATICTM.toFixed(2) + "+" + data.TM.toFixed(2) + "] s";
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
            str += " [";
            str += "<span class='text-success'>";
            str += ((Date.now() - data.status.startTime)/1000).toFixed(0) + "s";
            str += "</span>";
            str += " of estimated total " + (maximalT/1000).toFixed(0) + "s" + " (or ";
            str += "<span class='text-success'>";
            str += ((Date.now() - data.status.startTime + estimatedT)/1000).toFixed(0) + "s";
            str += "</span>";
            str += ")" + "]";
        } else {
            str += TM.toFixed(2) + " s";
            str += " (" + (TM / TM * 100).toFixed(0) + "%)";
        }
        if (data.status.duration) str += "; " + (data.status.duration/1000/60).toFixed(2) + " min passed";
        if (data.status.duration && hasZipped) str += " (zipped)";
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