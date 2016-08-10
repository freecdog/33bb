/**
 * Created by jaric on 10.08.2016.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('BBLview');
});

module.exports = router;
