/**
 * Created by jaric on 11.04.2016.
 */

importScripts('require.js');
importScripts('clientCalc.js');

//self.onmessage = function(e){
self.addEventListener('message', function(e) {
    //console.log("going to msg from worker, event:", e);
    //e.data.asd++;
    //self.postMessage(e.data);
    //
    //self.close(); // close Worker

    console.log("got event from workerController, event:", e);

    //require({
    //        baseUrl: "./"
    //    },
    //    ["require", "simple", "anon/blue", "func", "anon/green"],
    //    function(require, simple, blue, func, green) {
    //        postMessage(simple.color);
    //        postMessage(green.name);
    //        postMessage(func());
    //        postMessage(blue.name);
    //    }
    //);

    //function a1(){
    //    var start = Date.now();
    //    var j = 0;
    //    for (var i = 0; i < 1e10; i++) {j++;}
    //    console.log(j, Date.now() - start, "ms");
    //}
    //a1();
});

function onError(e) {
    console.log(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''));
}

self.addEventListener('error', onError, false);