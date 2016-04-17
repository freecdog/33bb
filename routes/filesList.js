/**
 * Created by jaric on 15.04.2016.
 */

var express = require('express');
var router = express.Router();

var path = require('path');
var fs = require('fs');

var _ = require('underscore');
var async = require('async');

// SOLVED cut names of paths (avascript, ootstrap etc). It was only in browser view, because of \B \d special symbols
router.get('/', function(req, res){
    var sharedFolder = "./public/dat";
    //sharedFolder = path.join('X:', 'pro', 'nodejs', '33bb', 'public', 'dat');

    var exclusions = ['BBinput.json'];

    var fsStartTime = Date.now();
    readFolderRecursive(sharedFolder, 0, exclusions, function(err, data){
        if (err) throw err;

        res.send(data);
        console.log(Date.now() - fsStartTime, 'msec to read and send files from /dat folder');
    });
});

function readFolderRecursive(item, level, exclusions, cb) {
    //http://stackoverflow.com/a/7550430
    level = typeof level !== 'undefined' ? level : 0;

    var recursionData = {};

    if (level == 0){
        recursionData.private = {};

        recursionData.private.homePath = item;
    }

    recursionData.statistics = {};
    recursionData.statistics.timestamp = new Date().getTime();

    var allObjects = [];

    var allFiles = [];

    recursionData.allFiles = allFiles;
    recursionData.allObjects = allObjects;

    function stopRecursion(){
        cb(null, recursionData);
    }

    if (level > 3) {
        stopRecursion();
        return;
    }

    var lastPartIndex = item.lastIndexOf('\\');
    var lastPart = item.substr(lastPartIndex + 1, item.length - lastPartIndex - 1);
    var isExclusion = false;
    for (var excIndex = 0; excIndex < exclusions.length; excIndex++){
        if (exclusions[excIndex] == lastPart){
            isExclusion = true;
            break;
        }
    }
    if (isExclusion == true) {
        stopRecursion();
        return;
    }

    // fs.lstat
    fs.stat(item, function(err, stats) {
        if (err) throw err;

        var objType;

        var currentObj = {
            path: item
            , stats: stats
        };

        if (!err && stats.isDirectory()) {

            objType = 'folder';
            currentObj.type = objType;
            currentObj.children = [];
            allObjects.push(currentObj);

            fs.readdir(currentObj.path, function(err, list) {
                if (err) return cb(err);

                async.forEach(
                    list,
                    function(diritem, callback) {
                        readFolderRecursive(path.join(currentObj.path, diritem), level+1, exclusions, function(err, data) {

                            for (var someFile in data.allFiles){
                                if (data.allFiles.hasOwnProperty(someFile)){
                                    allFiles.push(data.allFiles[someFile]);
                                }
                            }

                            for (var someObject in data.allObjects){
                                if (data.allObjects.hasOwnProperty(someObject)){
                                    currentObj.children.push(data.allObjects[someObject]);
                                }
                            }

                            callback(err);
                        });
                    },
                    function(err) {

                        if (level == 0){
                            recursionData.statistics.timestamp = (new Date().getTime()) - recursionData.statistics.timestamp;
                            console.log(recursionData.statistics.timestamp, 'msec to finish recursion');

                            function treeProcess(tree){
                                if (tree.hasOwnProperty('path')){
                                    var homePathLength = recursionData.private.homePath.length;
                                    if (recursionData.private.homePath[0] === "." && recursionData.private.homePath[1] === '/') homePathLength -= 2;

                                    tree.path = tree.path.substr(homePathLength, tree.path.length - homePathLength);

                                    // probably this command could be moved to client side
                                    tree.path = tree.path.replace(/\\/g, "/");
                                }
                                if (tree.hasOwnProperty('children')){
                                    for (var i = 0; i < tree.children.length; i++){
                                        treeProcess(tree.children[i]);
                                    }
                                }
                            }
                            treeProcess(recursionData.allObjects[0]);
                            for (var i = 0; i < recursionData.allFiles.length; i++){
                                treeProcess(recursionData.allFiles[i]);
                            }

                            delete recursionData.statistics;
                            delete recursionData.private;
                        }

                        cb(err, recursionData);
                    }
                );
            });

        }
        else {
            objType = 'file';
            currentObj.type = objType;

            if (isValidFile(currentObj.path)){
                allObjects.push(currentObj);

                allFiles.push({
                    path: currentObj.path
                    //, stats: stats
                    , type: objType
                });
            }

            cb(err, recursionData);
        }
    });
}

function isValidFile(filename){
    var isValid = false;
    var filenameNorm = filename.toLowerCase();
    var filenameNormLen = filenameNorm.length;
    var matches = ['json'];

    var filenameEnding, mLength;
    for (var i = 0, len = matches.length; i < len; i++){
        mLength = matches[i].length;
        filenameEnding = filenameNorm.substr(filenameNormLen - mLength, mLength);
        if (filenameEnding == matches[i]){
            isValid = true;
            break;
        }
    }

    return isValid;
}

module.exports = router;