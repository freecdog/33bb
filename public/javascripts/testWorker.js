'use strict';

//self.onmessage = function(e){
self.addEventListener('message', function(e) {
    console.log("going to msg from worker, event:", e);
    e.data.asd++;
    self.postMessage(e.data);

    self.close(); // close Worker
});

//function a1(){
//    var start = Date.now();
//    var j = 0;
//    for (var i = 0; i < 1e10; i++) {j++;}
//    console.log(j, Date.now() - start, "ms");
//}
//a1();