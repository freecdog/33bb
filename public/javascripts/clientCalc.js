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
    var d = (new BB.Datatone());
    BB.BBup.run(function(){
        var url = window.location.href;
        var addressArr = url.split("/");
        ajaxWrapper('POST', d.memOut, addressArr[0] + "//" + addressArr[2] + "/memout", function(){
            console.log("memOut has been post to", addressArr[2]);
        });
    });

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

    //bbCompile.start();
    var domCurrentTime = document.getElementById("currentTime");
    domCurrentTime.innerHTML = "current time";

    setTimeout(function(){
        // storing to localStorage
        //localStorage.setItem('mo', JSON.stringify(d.memOut));

        // reading from localStorage
        //d.memOut = JSON.parse( localStorage.getItem('mo') );

        //bbCompile.start();

        var doCheckTime = true;
        var checkInterval = 1000;
        function checkTime(){
            domCurrentTime.innerHTML = d.currentT.toFixed(2);
            if (d.currentT >= d.TM ) {
                //setTimeout(function(){
                //    ajaxWrapper('POST', d.memOut, "http://" + "localhost:3113" + "/memout", function(){
                //        console.warn("it seems like it is finished");
                //    });
                //}, checkInterval);
                doCheckTime = false;
            }

            if (doCheckTime){
                setTimeout( checkTime, checkInterval);
            }
        }
        setTimeout(checkTime, checkInterval);



        //ajaxWrapper('POST', d.memOut, "http://" + window.hostIp + "/memout");
        //ajaxWrapper('GET', null, "http://" + window.hostIp + "/memout", function(status, stringData){
        //    if (status === 200 || status === 304){
        //        if (stringData != undefined){
        //            d.memOut = JSON.parse(stringData);
        //            bbCompile.start();
        //        }
        //    } else {
        //        alert(status.toString() + ", something goes wrong");
        //        console.log(stringData);
        //    }
        //});


    }, 100);

});