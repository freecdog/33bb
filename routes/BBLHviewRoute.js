/**
 * Created by jaric on 30.05.2017.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('BBLHview');
});

module.exports = router;
