/**
 * Created by jaric on 12.12.2014.
 */

requirejs.config({
    paths: {
        numbers: 'numbersAMD/lib/numbers',
        async: 'BB/lib/node_modules/async/lib/async',
        fs: 'BB/lib/node_modules/fsFake/fsFake',
        BB: 'BB/lib/BB',
        bulkedData: 'bulkedData',

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

requirejs(['BB', 'bbCompile', 'bulkedData'], function(BB, bbCompile, bulkedData) {
    console.log("bb is starting");

    //data.memOut = bulkedData;
    //bbCompile.start();

    var data = (new BB.Datatone());

    var url = window.location.href;
    var addressArr = url.split("/");
    ajaxWrapper('GET', null, addressArr[0] + "//" + addressArr[2] + "/memout", function(status, responseText){
        if (status === 200 || status === 304){
            if (responseText != undefined){
                var responseObject = JSON.parse(responseText);
                //data.memOut = responseObject.memOut;
                //angular.extend(data, responseObject);

                var params = {
                    userInput: true,
                    userData: responseObject.inputData
                };
                BB.BBstart.STARTPROC(params, function(){
                    data.memOut = responseObject.memOut;

                    bbCompile.start();
                });

            }
        } else {
            //alert("GET status:" + status.toString() + ", something goes wrong in ajaxWrapper GET " + addressArr[0] + "//" + addressArr[2] + "/memout");
            console.log("GET status:", status, responseText);
        }
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
                callback(xmlhttp.status);
            }
        };
        var parameters = JSON.stringify(theJson);
        xmlhttp.send(parameters);
    }
});