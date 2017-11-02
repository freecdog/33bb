//importScripts('javascripts/test.js');
var worker = new Worker('javascripts/testWorker.js');
var dataToSend = {asd:321};
worker.onmessage = function(e){
    console.log("going to process data from worker, data:", e.data, dataToSend);
};
worker.postMessage(dataToSend);
//var worker2 = new Worker('javascripts/test.js');
//worker2.postMessage({});
//var worker3 = new Worker('javascripts/test.js');
//worker3.postMessage({});