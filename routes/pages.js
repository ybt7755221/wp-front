var express = require('express');
var request = require('request');
var router = express.Router();
var tools = require('./common')
const work_url = tools.GoUrl.workUrl;
const project_url = tools.GoUrl.projectUrl;

router.all('*', function(req, res, next) {
  if(!req.session.userInfo){  /*获取*/
    res.redirect('/')
  }
  next()
});

/* GET home page. */
router.get('/', function(req, res, next) {
    request({
      timeout:5000, // 设置超时
      method:'GET', //请求方式
      url: work_url,
      qs:{
        'user_id':req.session.userInfo.id,
        'page_num':1,
        'page_size':100,
        'sort':JSON.stringify({"id":"desc"})
      }
    },function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var workJson = JSON.parse(body)
            if (workJson.code == 1000) {
              request({
                timeout:5000, // 设置超时
                method:'GET', //请求方式
                url: project_url
              },function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                      var bodyJson = JSON.parse(body)
                      if (bodyJson.code == 1000) {
                        var plist = {}
                        bodyJson.data.forEach(item=>{
                            plist[item['id']] = item['project_name']
                        })
                        res.render('pages/index',{
                          userinfo : req.session.userInfo,
                          list : workJson.data,
                          workTypeList: tools.WorkType,
                          plist: plist
                        })
                      }else{
                        res.send(bodyJson.msg)
                      }
                  }else{
                      res.send(error)
                  }
              });
            }else{
              res.send(workJson.msg)
            }
        }else{
            res.send(error)
        }
    });
});
router.get('/create', function(req, res, next){
  request({
    timeout:5000, // 设置超时
    method:'GET', //请求方式
    url: project_url,
    qs:{
      'sort':JSON.stringify({"id":"desc"})
    }
  },function (error, response, body) {
      if (!error && response.statusCode == 200) {
          var bodyJson = JSON.parse(body)
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
});
router.post('/save', function(req, res, next){
  req.body.user_id=req.session.userInfo.id
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
