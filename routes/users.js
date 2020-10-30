var express = require('express');
const session = require('express-session');
var request = require('request');
const { runInNewContext } = require('vm');
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
router.post('/login', function(req, res, next) {
  request.post(
    tools.GoUrl.baseUrl+'check',
    { form: req.body },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body);
        if (bodyJson.code == 1000) {
          delete bodyJson.data.password
          req.session.userInfo = bodyJson.data
          res.redirect('/pages/')
        }else{
          res.send(bodyJson)
        }
      }else{
        res.send(response)
      }
    }
  );
})

module.exports = router;
