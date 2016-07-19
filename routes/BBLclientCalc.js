/**
 * Created by jaric on 13.07.2016.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('BBLclientCalc');
});

module.exports = router;
