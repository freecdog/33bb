/**
 * Created by jaric on 16.12.2014.
 */

var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require('fs');

function readJSONFile(filepath, callback){
    callback = callback || function(){};
    fs.readFile(filepath, {encoding: "utf8"}, function(err, filedata){
        if (err) {
            console.log("read error:", err);
            callback(err, null);
        } else {
            // some hack with first symbol =/
            filedata = filedata.replace(/^\uFEFF/, '');
            // parsing file to JSON object
            var jsondata = JSON.parse(filedata);

            callback(null, jsondata);
        }
    });
}

function writeJSONFile(filepath, jsondata, callback){
    callback = callback || function(){};
    fs.writeFile(filepath, JSON.stringify(jsondata), {encoding: "utf8"}, function (err) {
        if (err) {
            console.log("write error:", err);
            callback(e, null);
        } else {
            console.log('File has been successfully written', new Date());
            callback();
        }
    });
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function currentDateToStr(){
    var d = new Date();
    var year = d.getUTCFullYear().toString();
    var month = d.getUTCMonth()+1;  // months are counted from 0
    if (month < 10) month = "0" + month;
    var day = d.getUTCDate();
    if (day < 10) day = "0" + day;
    var time = d.toLocaleTimeString();
    time = replaceAll(time, ":", "");
    return year + month + day + time;
}

// send default memOut
router.get('/', function(req, res){
    var pathToFile = path.join(__dirname, '..', 'public', 'dat', 'def01.json');

    readJSONFile(pathToFile, function(err, data){
        if (err != null) console.log('err:', err);

        res.send(data);
    });
});

router.get('/:name', function(req, res){
    var name = req.params.name;

    var pathToFile = path.join(__dirname, '..', 'public', 'dat', name);

    readJSONFile(pathToFile, function(err, data){
        if (err != null) console.log('err:', err);

        res.send(data);
    });
});

// recording to file req.body as json
router.post('/', function(req, res){

    // TODO try Blob(), "sending binary data" https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
    //console.log("req.body.memout[1][1][1][1]:", req.body.memout[1][1][1][1]);
    var pathToFile = path.join(__dirname, '..', 'public', 'dat', 'def01.json');
    writeJSONFile(pathToFile, req.body, function(err){
        if (err != null) console.log('Some errors occurred:', err);

        res.send('Data has been written');
    });

});

router.post('/:name', function(req, res) {
    var name = req.params.name;
    var date = currentDateToStr();
    console.log("date:", date);

    var pathToFile = path.join(__dirname, '..', 'public', 'dat', 'def00_' + date + name + '.json');
    writeJSONFile(pathToFile, req.body, function(err){
        if (err != null) console.log('Some errors occurred:', err);

        res.send('Data has been written');
    });
});

module.exports = router;
