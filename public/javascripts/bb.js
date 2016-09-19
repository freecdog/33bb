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
        bbCompile: 'bbCompile',

        Chart: 'Chart'
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
        }
    }
});

requirejs(['BB', 'bbCompile', 'bulkedData', 'Chart'], function(BB, bbCompile, bulkedData, Chart) {
    console.log("bb is starting");

    //data.memOut = bulkedData;
    //bbCompile.start();

    var data = (new BB.Datatone());

    var url = window.location.href;
    var addressArr = url.split("/");
    //ajaxWrapper('GET', null, addressArr[0] + "//" + addressArr[2] + "/memout", startDrawing);

    ajaxWrapper('GET', null, addressArr[0] + "//" + addressArr[2] + "/filesList", function(status, responseText){
        if ((status === 200 || status === 304) && (responseText !== undefined)){
            var responseData = JSON.parse(responseText);
            var files = responseData.allFiles;
            //console.warn('/filesList', responseText, files);

            var urls = [];
            var baseUrl = addressArr[0] + "//" + addressArr[2] + "/memout";
            for (var fileName in files){
                if (!files.hasOwnProperty(fileName)) continue;

                var url = baseUrl + files[fileName].path;
                urls.push(url);
            }
            //console.warn("urls:", urls);

            for (var address in urls){
                createAnchor(urls[address]);
            }
        }
    });

    window.startDrawing = false;
    function startDrawing(status, responseText){
        if ((status === 200 || status === 304) && (responseText !== undefined)){
            if (responseText != undefined){
                window.startDrawing = true;

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
            //console.log("GET status:", status, responseText);
        }
    }

    var anchorsHolder = document.getElementById("anchorsHolder");
    function ajaxWrapper(mode, theJson, toUrl, callback){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open(mode, toUrl, true);
        xmlhttp.setRequestHeader("Content-type", "application/json");
        xmlhttp.onreadystatechange = function () { //Call a function when the state changes.
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //console.log(xmlhttp.responseText);
                callback(xmlhttp.status, xmlhttp.responseText);
                setLoading(false, 100);
            }else {
                callback(xmlhttp.status);
            }
        };
        xmlhttp.onprogress = function(event){
            //console.log(event.loaded, event.total);
            var percentLoaded = Math.round(event.loaded / event.total * 100);
            //if (progressBar) progressBar.style.width = percentLoaded.toString() + "%";

            setLoading(true, percentLoaded);
        };
        var parameters = JSON.stringify(theJson);
        xmlhttp.send(parameters);
    }

    function createAnchor(url){
        var divObject = document.createElement("DIV");
        var h4Object = document.createElement("H4");
        var aObject = document.createElement("A");
        var textObj = document.createTextNode(url.substr(url.lastIndexOf('/'), url.length - url.lastIndexOf('/')));
        //aObject.setAttribute("href", url);
        divObject.appendChild(h4Object);
        h4Object.appendChild(aObject);
        aObject.appendChild(textObj);
        aObject.onclick = function(e){
            //console.log("asd", e);
            setLoading(true, 0);
            ajaxWrapper('GET', null, url, startDrawing);
            anchorsHolder.style.visibility = "hidden";
        };
        anchorsHolder.appendChild(divObject);
    }
});