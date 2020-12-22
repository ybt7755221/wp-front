var express = require('express');
var request = require('request');
var router = express.Router();
var tools = require('./common');
const _ = require('lodash');
const etools = require('../library/etools');
const e = require('express');
const work_url = tools.GoUrl.workUrl;
const project_url = tools.GoUrl.projectUrl;

router.all('*', function(req, res, next) {
  if(!req.session.userInfo){  /*获取*/
    res.redirect('/')
  }
  next();
});

router.post('/update', async function(req, res, next){
  let data = etools.j2s(req.body);
  data = etools.s2j(data);
  console.log(work_url+'update-by-id');
  console.log(data);
  let resp = await etools.http_request(work_url+'update-by-id', data, 'POST');
  let error = resp['error'];
  let response = resp['data'];
  if (!error && response.statusCode == 200) { 
    let body = etools.s2j(response.body);
    if (body['code'] == 1000) {
      res.send(etools.success(body['data']));
    }else{
      res.send(etools.error(body['data'], body['code']));
    }
  }else{
    res.send(etools.error(error != null ? error : etools.j2s(response), 10010));
  }
});

/* GET home page. */
router.get('/', async function(req, res, next) {
  let page = 1;
  let page_num = 10;
  let isLast = 0;
  if (req.query['page'] != "" && req.query['page'] > 0) {
    page = req.query['page'];
  }
  let resp = await etools.http_request(work_url, {
      'user_id'   : req.session.userInfo.id,
      'page_num'  : page,
      'page_size' : page_num,
      'sort'      : JSON.stringify({"id":"desc"})
  }, 'GET');
  if (!resp['error'] && resp['data'].statusCode == 200) {
    var workJson = etools.s2j(resp['data'].body)
    if (workJson.code == 1000) {
      let respp = await etools.http_request(project_url, {}, 'GET');
      if (!respp['error'] && respp['data'].statusCode == 200) {
          var bodyJson = etools.s2j(respp['data'].body)
          if (bodyJson.code == 1000) {
            var plist = {}
            if (!etools.isEmpty(bodyJson.data)) {
              bodyJson.data.forEach(item=>{
                plist[item['id']] = item['project_name']
              })
            }

            if (workJson.data == null || page_num > workJson.data.length) {
              isLast = 1;
            }
            res.render('pages/index',{
              userinfo : req.session.userInfo,
              list : workJson.data,
              workTypeList: tools.WorkType,
              currentPage : page,
              pageNum : page_num,
              isLast : isLast,
              plist: plist
            })
          }else{
            res.send(bodyJson.msg)
          }
      }else{
          res.send(respp['error'])
      }
    }else{
      res.send(workJson.msg)
    }
  }else{
      res.send(resp['error'])
  }
});
router.get('/create', async function(req, res, next){
  let resp = await etools.http_request(project_url, {
    'sort':JSON.stringify({"id":"desc"})
  }, 'GET');
  let error = resp['error'];
  let response = resp['data'];
  if (!error && response.statusCode == 200) {
    var bodyJson = JSON.parse(response.body)
    if (bodyJson.code == 1000) {
      res.render('pages/create',{
        userinfo : req.session.userInfo,
        workTypeList : tools.WorkType,
        projectList : bodyJson.data
      })
    }else{
      res.send(bodyJson.msg)
    }
  }else{
      res.send(error)
  }
});
router.post('/save', function(req, res, next){
  req.body.user_id=req.session.userInfo.id
  req.body.title = _.trim(req.body.title)
  req.body.url = _.trim(req.body.url)
  request.post({url:work_url, form:req.body}, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(JSON.parse(body))
      }else{
        res.send(error)
      }
  });
});
router.post('/delWork', function(req, res, next){
  if (req.body.user_id != req.session.userInfo.id) {
    res.send({isOk:-1, msg:"传递用户非登陆用", data:{}})
  }
  request.post({url:work_url+"delete", form:req.body}, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(JSON.parse(body))
      }else{
        res.send(error)
      }
  });
});
module.exports = router;
