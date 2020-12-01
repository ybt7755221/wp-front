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

router.post('/delete', async (req, res, next) => {
    req.body.user_id = req.session['userInfo'].id;
    let resp = await ets.http_request(GoUrl.attendanceUrl+'delete-by-id', req.body, "POST");
    if (resp['error'] != null && resp['data'].statusCode != 200) {
        res.send(resp['error']);
    }
    res.send(ets.s2j(resp['data'].body));
});

router.post('/save-dayoff', async (req, res, next) => {
    //获取attendance
    let attdInfo = await ets.http_request(GoUrl.attendanceUrl, {id:req.body.attendance_id}, "GET");
    if (attdInfo['error'] != null && attdInfo['data'].statusCode != 200) {
        res.send(attdInfo['error']);
    }
    let attdJson = ets.s2j(attdInfo['data'].body);
    if (attdJson.code != 1000) {
        res.send(attdJson);
    }
    let attdData = attdJson.data[0];
    //剩余时间
    let remainTime = Number(attdData['hours']) - Number(attdData['used']);
    if (remainTime < Number(req.body.hours)) {
        res.send({code:1100, msg:'剩余时间:'+remainTime+'h, 小于需要的请假时间'+req.body.hours+'h'});
        return
    }
    let used = Number(attdData['used']) + Number(req.body.hours);
    let status = 3;
    console.log(attdData['hours']);
    console.log(used);
    if (Number(attdData['hours']) > used) {
        status = 2;
    }
    //创建dayoff记录
    req.body.user_id = req.session['userInfo'].id;
    let resp = await ets.http_request(GoUrl.dayoffUrl, req.body, "POST");
    if (resp['error'] != null && resp['data'].statusCode != 200) {
        res.send(resp['error']);
    }
    let bodyJson = ets.s2j(resp['data'].body);
    if (bodyJson.code != 1000) {
        res.send(bodyJson);
    }
    //更新attendance
    let params = {
        id: req.body.attendance_id, 
        used: used,
        status: status
    };
    console.log(params);
    let resp2 = await ets.http_request(GoUrl.attendanceUrl+'update-by-id', params, "POST");
    if (resp2['error'] != null && resp2['data'].statusCode != 200) {
        res.send(resp2['error']);
    }
    res.send(ets.s2j(resp2['data'].body));
});

router.get('/delete-dayoff', async (req, res, next) => {

});

module.exports = router;