/**
 * Created by jaric on 26.11.2014.
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('clientCalc');
});

module.exports = router;
