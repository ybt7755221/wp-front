var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var tools = require('./common');
const etools = require('../library/etools');
const user_url = tools.GoUrl.userUrl;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Work Report System' });
});

router.get('/test', async function(req, res, next){
  let resp = await etools.http_request(user_url,{id:1},'GET')
  res.send(resp);
});

router.post('/create', async function(req, res, next){
  req.body.password = etools.hash(req.body.password)
  let resp = await etools.http_request(user_url, req.body, "POST")
  if (resp['error'] == null && resp['data'].statusCode == 200) {
    let body = etools.s2j(resp['data'].body)
    if (body.code == 1000) {
      res.redirect('/');
    } else {
      res.send(body.msg);
    }
  }else{
    res.send(error)
  }
});

router.get('/register', function(req, res, next){
  res.render('register', { title: 'Work Report System' })
})
module.exports = router;
