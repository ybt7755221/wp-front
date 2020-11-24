var express = require('express');
const session = require('express-session');
var request = require('request');
const { runInNewContext } = require('vm');
const etools = require('../library/etools');
const {http_request} = require('../library/etools');
var router = express.Router();
var tools = require('./common')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
});
router.post('/login', async function(req, res, next) {
  let resp = await http_request(tools.GoUrl.baseUrl+'check', req.body, "POST");
  if (resp['error'] == null && resp['data'].statusCode == 200) {
    var bodyJson = etools.s2j(resp['data'].body);
    if (bodyJson.code == 1000) {
      delete bodyJson.data.password
      req.session.userInfo = bodyJson.data
      res.redirect('/pages/')
    }else{
      res.send(bodyJson)
    }
  }else{
    res.send(resp['error'])
  }
})

module.exports = router;
