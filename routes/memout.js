/**
 * Created by jaric on 16.12.2014.
 */

var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require('fs');

var multer = require('multer');
var multerDownloadFolder = path.join(__dirname, '..', 'uploads');
var multerUpload = multer({ dest: multerDownloadFolder });

var zippartManager = {};
function generateZippartNameById(zipId){
    return "z" + zipId.toString();
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


router.get('/zipped/:name', function(req, res){
    var name = req.params.name;

    var pathToFile = path.join(__dirname, '..', 'public', 'dat', name, '_info.json');

    readJSONFile(pathToFile, function(err, data){
        if (err != null) console.log('err:', err);

        console.log("json", data);
        res.send(data);
    });
});

router.post('/zipped/:name', multerUpload.single('zipped'), function(req, res){    // "zipped" is a formData field name
//}, multerUpload.fields([{name: 'zipped', maxCount: 1}]), function(req, res){
    if (req.file) {
        console.dir(req.file);

        var recentFilePath = path.join(multerDownloadFolder, req.file.filename);

        var name = req.params.name;
        var date = currentDateToStr();
        console.log("date:", date);

        var pathToFile = path.join(__dirname, '..', 'public', 'dat', 'def00_' + date + name + '.zip.json');
        copyFileTo(
            recentFilePath,
            pathToFile,
            //path.join(multerDownloadFolder, '..', 'public', 'dat', req.file.filename),
            { replace: true },
            function(){
                fs.unlink(recentFilePath, noop);
            }
        );

        return res.end('Thank you for the file');
    }
    res.end('Missing file');
});

router.post('/zippart/:zipId', multerUpload.single('zipped'), function(req, res){    // "zipped" is a formData field name
    if (req.file) {
        //console.dir(req.file);
        //console.dir(req.body);

        var zipId = req.params.zipId;
        var options = JSON.parse(req.body.options);
        var recentFilePath = path.join(multerDownloadFolder, req.file.filename);

        var zippartObject;
        if (zippartManager.hasOwnProperty(generateZippartNameById(zipId)) == false){
            zippartObject = {};
            zippartObject.currentDate = currentDateToStr();
            zippartObject.filesNameList = [];

            zippartManager[generateZippartNameById(zipId)] = zippartObject;
        } else zippartObject = zippartManager[generateZippartNameById(zipId)];

        console.log("zipId:", zipId, "zippart date:", zippartObject.currentDate);

        var newFileName = zipId  + '_' + options.memoutIndex + '.zip';
        var pathToFile = path.join(__dirname, '..', 'public', 'dat', 'def00_' + zippartObject.currentDate + options.name, newFileName);
        zippartObject.filesNameList.push(newFileName);

        copyFileTo(
            recentFilePath,
            pathToFile,
            { replace: true },
            function(){
                fs.unlink(recentFilePath, noop);

                if (options.lastPart && options.lastPart == true){
                    writeJSONFile(
                        path.join(path.dirname(pathToFile), '_info.json'),
                        zippartObject,
                        function(){
                            zippartManager[generateZippartNameById(zipId)] = null;
                            delete zippartManager[generateZippartNameById(zipId)];
                        }
                    );
                }
            }
        );

        return res.end('Thank you for the file');
    }
    res.end('Missing file');
});

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
    // it is better to use server local time. The reason why is time=d.toLocalTimeString() so it might be a new day (by time) and old day by UTC
    var d = new Date();
    //var year = d.getUTCFullYear().toString();
    var year = d.getFullYear().toString();
    //var month = d.getUTCMonth()+1;  // months are counted from 0
    var month = d.getMonth()+1;  // months are counted from 0
    if (month < 10) month = "0" + month;
    //var day = d.getUTCDate();
    var day = d.getDate();
    if (day < 10) day = "0" + day;
    var time = d.toLocaleTimeString();
    time = replaceAll(time, ":", "");
    return year + month + day + time;
}

function copyFileTo(src, dst, options, callback){
    var mkdirp = require('mkdirp');

    var srcPath = src;
    var dstPath = dst;

    var dstDir = path.dirname(dstPath);
    mkdirp(dstDir, function(err){
        if (err) throw err;

        fscopy(srcPath, dstPath, options, function (err) {
            if (err) throw err;
            console.log("Copied", srcPath, "to", dstPath);
            callback();
        });
    });
}
function fscopy(src, dst, opts, cb) {
    // modified from https://github.com/coolaj86/utile-fs/blob/master/fs.extra/fs.copy.js
    if ('function' === typeof opts) {
        cb = opts;
        opts = null;
    }
    opts = opts || {};

    function copyHelper(err) {
        var is
            , os
            ;
        if (!err && !(opts.replace || opts.overwrite)) {
            return cb(new Error("File " + dst + " exists."));
        }
        fs.stat(src, function (err, stat) {
            if (err) {
                return cb(err);
            }
            is = fs.createReadStream(src);
            os = fs.createWriteStream(dst);

            is.pipe(os);
            os.on('close', function (err) {
                if (err) {
                    return cb(err);
                }
                fs.utimes(dst, stat.atime, stat.mtime, cb);
            });
        });
    }
    cb = cb || noop;
    fs.stat(dst, copyHelper);
}
function noop(){};

module.exports = router;
