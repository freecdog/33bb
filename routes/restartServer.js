/**
 * Created by jaric on 16.12.2014.
 */

var express = require('express');
var router = express.Router();

var path = require('path');

// TODO. Looks like I've done it, but tricky and odd solution
// When service restarting it terminate parent process
// so chilren process terminate too. Thus child_process that had been
// executed can't finish process of restarting server.
// http://nodejs.org/api/child_process.html
// Advanced ci: http://www.carbonsilk.com/node/deploying-nodejs-apps/
// tags: ci, continious integration
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
//var execFile = require('child_process').execFile;
function restartServer(){
    //execFile('./restart.sh');
    //exec("sudo service node33 restart", function (error, stdout, stderr) {
    //    if (error !== null) console.log('exec error: ' + error);
    //});
    //spawn("sudo service node33 restart");
    //spawn("sudo", ['service', 'node33', 'restart']);

    // spawn will ruin server so Forever should back it up.
    spawn("sudo service node33 restart");
}
function updateServer(callback){
    // update from github
    exec("git --git-dir=" + path.join(__dirname, '.git') + " --work-tree=" + __dirname + " pull origin master", callback);
}

function prepareIpToConsole(req){
    return 'ip:'+req.connection.remoteAddress;
}

router.get('/', function(req, res){
    res.render('restartServer');
});
router.post('/', function(req, res){
    console.log('going to restart server', prepareIpToConsole(req), new Date());
    if(req.body.name && req.body.password){
        console.log(req.body.name, req.body.updateOnly);
        var passHash = req.app.getHash(req.body.password);
        if (req.body.name=='jaric' && passHash=='bXSdeiUOrFs6OEO6jzlsXMVatr0V3ih4t8EpDLbh7b6y5mbV5uk1f5XD2na5oSWRYyY9mSg9rGauTr7rI01plA=='){
            if (req.body.updateOnly !== undefined && req.body.updateOnly == 'on') {
                updateServer(function(error, stdout, stderr){
                    if (!error){
                        res.render('restartServer', {
                            message: 'successfully updated',
                            serverTime: new Date(),
                            error: JSON.stringify(error),
                            stdout: JSON.stringify(stdout),
                            stderr: JSON.stringify(stderr)
                        });
                    } else {
                        res.render('restartServer', {
                            message:'something goes wrong',
                            serverTime: new Date(),
                            error: JSON.stringify(error),
                            stdout: JSON.stringify(stdout),
                            stderr: JSON.stringify(stderr)
                        });
                    }
                });
            } else {
                updateServer(function(error, stdout, stderr){
                    if (!error){
                        res.render('restartServer', {
                            message: 'successfully updated and going to reboot',
                            serverTime: new Date(),
                            error: JSON.stringify(error),
                            stdout: JSON.stringify(stdout),
                            stderr: JSON.stringify(stderr)
                        });
                    } else {
                        res.render('restartServer', {
                            message:'something goes wrong with update and going to reboot',
                            serverTime: new Date(),
                            error: JSON.stringify(error),
                            stdout: JSON.stringify(stdout),
                            stderr: JSON.stringify(stderr)
                        });
                    }
                    restartServer();
                });
            }
        } else res.send('No, inc');
    } else res.send('No');
});

module.exports = router;
