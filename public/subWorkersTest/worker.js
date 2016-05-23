// settings

var endValue = 1e11;
var num_workers = 8;
var items_per_worker = 1e9; //Math.floor(endValue / num_workers);

console.log(num_workers, items_per_worker);

// start the workers
var result = 0;
var pending_workers = num_workers;
for (var i = 0; i < num_workers; i += 1) {
  var worker = new Worker('core.js');
  var multiplayer = 1 << i;
  var start = {num: 0, index: i};
  var end = {num: items_per_worker , index: i};
  //if (i == 2) end.num *= 2;
  console.log(i, ')', start.num, end.num);
  
  worker.postMessage(start);
  worker.postMessage(end);

  worker.onmessage = storeResult;
}

// handle the results
function storeResult(event) {
  result += 1*event.data;
  pending_workers -= 1;
  if (pending_workers <= 0)
    postMessage(result); // finished!
}