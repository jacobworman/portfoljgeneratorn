var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

router.post('/test', function(req, res, next) {
  res.send({
    ok: true
  });
});

module.exports = router;
