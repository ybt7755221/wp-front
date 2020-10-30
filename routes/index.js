var express = require('express');
var request = require('request');
var crypto = require('crypto');
var router = express.Router();
var tools = require('./common')
const user_url = tools.GoUrl.userUrl
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Work Report System' });
});

router.post('/create', function(req, res, next){
  req.body.password = crypto.createHash('md5').update(req.body.password).digest("hex")
  request.post({url:user_url, form:req.body}, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.redirect('/')
    }else{
      res.send(error)
    }
});
})

router.get('/register', function(req, res, next){
  res.render('register', { title: 'Work Report System' })
})
module.exports = router;
