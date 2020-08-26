var express = require('express');
var router = express.Router();

router.get('/fafa', function(req, res, next) {
    res.send('farms');
  });

module.exports = router;