/**
 * Created by jaric on 24.02.2016.
 */

requirejs.config({
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BB/lib/node_modules/async/lib/async',
        fs: 'BB/lib/node_modules/fsFake/fsFake',
        BB: 'BB/lib/BB',

        THREE: 'three',
        Stats: 'stats',
        dat: 'dat.gui',
        bbCompile: 'bbCompile'
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
        }
    }
});

requirejs(['BB', 'bbCompile'], function(BB, bbCompile) {
    var data = (new BB.Datatone());
    BB.BBup.run(function(){
        var dataToSend = {};
        //dataToSend.memOut = data.memOut;
        //dataToSend.G = data.G;
        //dataToSend.inputData = data.inputData;
        // to prevent data copy, using black list for params I don't want to send to server
        var blackList = ["G", "ACC", "files", "fds1", "fds2", "cavform"];
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
        ajaxWrapper('POST', dataToSend, addressArr[0] + "//" + addressArr[2] + "/memout", function(status, responseText){
            console.log("dataToSend has been post to", addressArr[2], "status code:", status, "server message:", responseText);

            window.connectToApp(data);
        });

    });

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

    //bbCompile.start();
    var domCurrentTime = document.getElementById("currentTime");
    domCurrentTime.innerHTML = "current time";

    setTimeout(function(){
        // storing to localStorage
        //localStorage.setItem('mo', JSON.stringify(d.memOut));

        // reading from localStorage
        //d.memOut = JSON.parse( localStorage.getItem('mo') );

        var doCheckTime = true;
        var checkInterval = 1000;
        function checkTime(){
            var str = "";
            if (data.currentT < 0){
                str += "preparing...";
                str += " (" + (1.1 * data.XDESTR + data.currentT).toFixed(2) + " of " + (1.1 * data.XDESTR).toFixed(2) +  ")";
            } else if (data.currentT < data.TM) {
                str += data.currentT.toFixed(2) + " of " + data.TM.toFixed(2) + " s";
                str += " (" + (data.currentT / data.TM * 100).toFixed(0) + "%)";
            } else {
                str += data.TM.toFixed(2) + " s";
                str += " (" + (data.TM / data.TM * 100).toFixed(0) + "%)";
            }
            if (data.status.duration) str += "; " + data.status.duration.toFixed(2) + " ms left";
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
        setTimeout(checkTime, checkInterval);

    }, 100);

});