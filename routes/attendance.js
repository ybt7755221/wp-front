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
/**
 * 获取详情
 */
router.get('/getDayoff', async (req, res, next) => {
    let resp = await ets.http_request(GoUrl.dayoffUrl, req.query, 'GET');
    if (resp['error'] != null && resp['data'].statusCode != 200) {
        res.send({code:1990, msg:resp['error'], data:{}});
    }
    res.send(ets.s2j(resp['data'].body))
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
    res.render('attendance/index', {
        userinfo: req.session['userInfo'],
        attendanceList: bodyJson.data
    })
});

router.get('/create', async (req, res, next) => {
    res.render('attendance/create', {
        userinfo: req.session['userInfo'],
    });
});

router.post('/save', async (req, res, next) => {
    req.body.user_id = req.session['userInfo'].id;
    req.body.status = 1;
    let resp = await ets.http_request(GoUrl.attendanceUrl, req.body, "POST");
    if (resp['error'] != null && resp['data'].statusCode != 200) {
        res.send(resp['error']);
    }
    res.send(ets.s2j(resp['data'].body));
});

router.get('/delete', async (req, res, next) => {

});

router.get('/create-dayoff', async (req, res, next) => {

});

router.get('/delete-dayoff', async (req, res, next) => {

});

module.exports = router;