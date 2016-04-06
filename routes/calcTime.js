/**
 * Created by jaric on 06.04.2016.
 */


var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res) {
    var time = null;
    if (req.body && req.body.time) time = req.body.time;

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var message = "got time " + time.toString() + " at " + (new Date()).toString() + " from ip:" + ip;
    console.log(message);
    res.send(message);
});

module.exports = router;
