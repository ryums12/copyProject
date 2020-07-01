var express = require('express');
var router = express.Router();

/* GET test  */
router.get('/', function (req, res, next) {
    var name = req.query.name;
    var number = req.query.number;
    res.send("Get : \n" + name + "\n" + number +'\n');
});
router.post('/', function (req, res, next) {
    var name = req.body.name;
    var number = req.body.number;
    res.send("Post : \n" + name + "\n" + number);
});

module.exports = router;