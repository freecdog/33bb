var timeAtStart = Date.now();
var index = -1;

var start;
onmessage = getStart;
function getStart(event) {
  index = event.data.index;
  
  start = 1*event.data.num;
  onmessage = getEnd;
}

var end;
function getEnd(event) {
  end = 1*event.data.num;
  onmessage = null;
  work();
}

function work() {
  var result = 0;
  for (var i = start; i < end; i += 1) {
    // perform some complex calculation here
    result += 1;
  }
  console.log('Thread:', index, ';', Date.now() - timeAtStart, 'ms');
  postMessage(result);
  close();
}