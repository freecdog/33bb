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
    // Don't want to start it automatically for now
    BB.BBup.run();

    //bbCompile.start();


    setTimeout(function(){
        var d = (new BB.Datatone());
        d.breakCalculation = true;

        d.memOut = bulkedData;
        bbCompile.start();

        // storing to localStorage
        //localStorage.setItem('mo', JSON.stringify(d.memOut));

        // reading from localStorage
        //d.memOut = JSON.parse( localStorage.getItem('mo') );

        //bbCompile.start();

//        BB.BBup.run();
        var doCheckTime = true;
        var checkInterval = 1000;
        function checkTime(){

            if (d.currentT >= d.TM - 0.2) {
                setTimeout(function(){
                    ajaxWrapper('POST', d.memOut, "http://" + "localhost:3113" + "/memout", function(){
                        console.warn("it seems like it is finished");
                    });
                }, checkInterval);
                doCheckTime = false;
            }

            if (doCheckTime){
                setTimeout( checkTime, checkInterval);
            }
        }
        setTimeout(checkTime, checkInterval);

        function ajaxWrapper(mode, theJson, toUrl, callback){
            xmlhttp = new XMLHttpRequest();
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
        /*
        ajaxWrapper('POST', d.memOut, "http://" + window.hostIp + "/memout");
        ajaxWrapper('GET', null, "http://" + window.hostIp + "/memout", function(status, stringData){
            if (status === 200 || status === 304){
                if (stringData != undefined){
                    d.memOut = JSON.parse(stringData);
                    bbCompile.start();
                }
            } else {
                alert(status.toString() + ", something goes wrong");
                console.log(stringData);
            }
        });
        */

    }, 100);
});