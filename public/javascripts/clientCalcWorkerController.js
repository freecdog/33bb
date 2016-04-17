/**
 * Created by jaric on 11.04.2016.
 */

var worker = new Worker('javascripts/clientCalcWorker.js');
var dataToSend = {asd:321};
worker.onmessage = function(e){
    console.log("going to process data from worker, data:", e.data, dataToSend);
};
worker.postMessage(dataToSend);