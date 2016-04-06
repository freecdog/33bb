/**
 * Created by jaric on 16.12.2014.
 */

var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require('fs');

// send default memOut
router.get('/', function(req, res){

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

    readJSONFile(path.join(__dirname, '..', 'public', 'dat', 'def01.json'), function(err, data){
        if (err != null) console.log('err:', err);

        res.send(data);
    });

});

// recording to file req.body as json
router.post('/', function(req, res){

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

    // TODO try Blob(), "sending binary data" https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
    //console.log("req.body.memout[1][1][1][1]:", req.body.memout[1][1][1][1]);
    writeJSONFile(path.join(__dirname, '..', 'public', 'dat', 'def01.json'), req.body, function(err){
        if (err != null) console.log('Some errors occurred:', err);

        res.send('Data has been written');
    });

});

module.exports = router;
