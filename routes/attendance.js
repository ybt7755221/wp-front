var express = require('express');
var router = express.Router();
const {GoUrl} = require('./common');
const ets = require('../library/etools');
var userinfo = null;

router.all('*', function(req, res, next) {
    if(!req.session['userInfo']){  /*获取*/
        res.redirect('/');
    }
    userinfo = req.session['userInfo'];
    next();
});

router.get('/', async (req, res, next) => {
    let resp = await ets.http_request(GoUrl.attendanceUrl, {
        'user_id':userinfo['id'],
        'sort':JSON.stringify({"overtime":"desc"})
    }, "GET");
    if (resp['error'] != null && resp['data'].statusCode != 200) {
        res.send(resp['error']);
    }
    let bodyJson = ets.s2j(resp['data'].body);
    if (bodyJson.code != 1000) {
        res.send(bodyJson.msg);
    }
    console.log(bodyJson);
    res.render('attendance/index', {
        userinfo: req.session['userInfo'],
        attendanceList: bodyJson.data
    })
});

module.exports = router;