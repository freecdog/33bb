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
    BB.BBstart.STARTPROC(function(){
        var d = (new BB.Datatone());
        //d.memOut = bulkedData;
        //bbCompile.start();

        var url = window.location.href;
        var addressArr = url.split("/");
        ajaxWrapper('GET', null, addressArr[0] + "//" + addressArr[2] + "/memout", function(status, responseText){
            if (status === 200 || status === 304){
                if (responseText != undefined){
                    d.memOut = JSON.parse(responseText);
                    bbCompile.start();
                }
            } else {
                alert(status.toString() + ", something goes wrong");
                console.log(responseText);
            }
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
                callback(xmlhttp.status);
            }
        };
        var parameters = JSON.stringify(theJson);
        xmlhttp.send(parameters);
    }
});