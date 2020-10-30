var express = require('express');
var request = require('request');
var router = express.Router();
var tools = require('./common')
const work_url = tools.GoUrl.workUrl;
const project_url = tools.GoUrl.projectUrl;
var plist = {}
var workTypeList=tools.WorkType
router.all('*', function(req, res, next) {
    if(!req.session.userInfo){  /*获取*/
      res.redirect('/')
    }
    request({
        timeout:5000, // 设置超时
        method:'GET', //请求方式
        url: project_url,
        },function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var bodyJson = JSON.parse(body)
                if (bodyJson.code == 1000) {
                    if (bodyJson.data == null) {
                        res.send("没有项目可用，请添加项目")
                    }
                    bodyJson.data.forEach(item=>{
                        plist[item['id']] = item['project_name']
                        if(item['test_time'] != "1970-01-01") {
                            plist[item['id']] +="    提测时间:"+item['test_time']
                        }
                        if(item['publish_time'] != "1970-01-01") {
                            plist[item['id']] +="    上线时间:"+item['publish_time']
                        }
                    })
                    next()
                }else{
                    res.send(bodyJson.msg)
                }
            }else{
                res.send(error)
            }
        });
});
//个人日报
router.get('/priDaily', function(req, res, next){
    var defDay = req.query['day'] ? req.query['day'] : 2
    var selectDay = new Date(new Date().getTime()).Format("yyyy-MM-dd")
    if (defDay == 1) {
        selectDay = new Date(new Date().getTime() - 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
    }else if(defDay == 3) {
        selectDay = new Date(new Date().getTime() + 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
    }
    request({
        timeout:5000, //设置超时
        method:'GET', //请求方式
        url: work_url,
        qs:{
            'user_id': req.session.userInfo.id,
            'created': selectDay,
            'page_num': 1,
            'page_size': 1000,
            'sort':JSON.stringify({"id":"desc"})
        }
      },function (error, response, body) {
          if (!error && response.statusCode == 200) {
              var workJson = JSON.parse(body)
              if (workJson.code == 1000) {
                if (workJson.data == null) {
                    res.render('export/daily',{
                        userinfo : req.session.userInfo,
                        defDay: defDay,
                        list : null
                    })
                }else{
                    var wList = {}
                    workJson.data.forEach((item)=>{
                        const arr = wList[plist[item['project_id']]]
                        if (Object.prototype.toString.call(arr) !== '[object Array]') {
                            wList[plist[item['project_id']]] = []
                        }
                        wList[plist[item['project_id']]].push(item)
                    })
                    res.render('export/daily',{
                        userinfo : req.session.userInfo,
                        defDay: defDay,
                        list : wList
                    })
                }
              }else{
                res.send(workJson.msg)
              }
          }else{
              res.send(error)
          }
      });
})
//个人周报
router.get('/priWeekly', function(req, res, next){
    var defWeek =  req.query['week'] ? req.query['week'] : 2
    request({
        timeout:5000, // 设置超时
        method:'GET', //请求方式
        url: work_url+'weekly',
        qs:{
            'user_id': req.session.userInfo.id,
            'page_num': 1,
            'page_size': 1000,
            'weekly_type' : defWeek,
            'sort':JSON.stringify({"id":"desc"})
        }
      },function (error, response, body) {
          if (!error && response.statusCode == 200) {
              var workJson = JSON.parse(body)
              if (workJson.code == 1000) {
                if (workJson.data == null) {
                    res.render('export/weekly',{
                        userinfo : req.session.userInfo,
                        defWeek: defWeek,
                        list : null
                    })
                }else{
                    var wList = {}
                    workJson.data.forEach((item)=>{
                        const arr = wList[plist[item['project_id']]]
                        if (Object.prototype.toString.call(arr) !== '[object Array]') {
                            wList[plist[item['project_id']]] = []
                        }
                        wList[plist[item['project_id']]].push(item)
                    })
                    res.render('export/weekly',{
                        userinfo : req.session.userInfo,
                        defWeek: defWeek,
                        list : wList
                    })
                }
              }else{
                res.send(workJson.msg)
              }
          }else{
              res.send(error)
          }
      });
})

router.get('/proDaily', function(req, res, next){
    var defDay = req.query['day'] ? req.query['day'] : 2
    var selectDay = new Date(new Date().getTime()).Format("yyyy-MM-dd")
    if (defDay == 1) {
        selectDay = new Date(new Date().getTime() - 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
    }else if(defDay == 3) {
        selectDay = new Date(new Date().getTime() + 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
    }
    request({
        timeout:5000, //设置超时
        method:'GET', //请求方式
        url: work_url,
        qs:{
            'created': selectDay,
            'page_num': 1,
            'page_size': 1000,
            'sort':JSON.stringify({"work_type":"asc", "id":"desc"})
        }
      },function (error, response, body) {
          if (!error && response.statusCode == 200) {
              var workJson = JSON.parse(body)
              if (workJson.code == 1000) {
                if (workJson.data == null) {
                    res.render('export/proDaily',{
                        userinfo : req.session.userInfo,
                        defDay: defDay,
                        list : null
                    })
                }else{
                    var wList = {}
                    workJson.data.forEach((item)=>{
                        const arr = wList[workTypeList[item['work_type']]]
                        if (Object.prototype.toString.call(arr) !== '[object Array]') {
                            wList[workTypeList[item['work_type']]] = []
                        }
                        wList[workTypeList[item['work_type']]].push(item)
                    })
                    res.render('export/proDaily',{
                        userinfo : req.session.userInfo,
                        defDay: defDay,
                        list : wList
                    })
                }
              }else{
                res.send(workJson.msg)
              }
          }else{
              res.send(error)
          }
      });
})

router.get('/proWeekly', function(req,res, next){
    var defWeek =  req.query['week'] ? req.query['week'] : 2
    request({
        timeout:5000, // 设置超时
        method:'GET', //请求方式
        url: work_url+'weekly',
        qs:{
            'page_num': 1,
            'page_size': 1000,
            'weekly_type' : defWeek,
            'sort':JSON.stringify({"work_type":"asc", "id":"desc"})
        }
      },function (error, response, body) {
          if (!error && response.statusCode == 200) {
              var workJson = JSON.parse(body)
              if (workJson.code == 1000) {
                if (workJson.data == null) {
                    res.render('export/proWeekly',{
                        userinfo : req.session.userInfo,
                        defWeek: defWeek,
                        list : null
                    })
                }else{
                    var wList = {}
                    workJson.data.forEach((item)=>{
                        const arr = wList[workTypeList[item['work_type']]]
                        if (Object.prototype.toString.call(arr) !== '[object Array]') {
                            wList[workTypeList[item['work_type']]] = []
                        }
                        wList[workTypeList[item['work_type']]].push(item)
                    })
                    res.render('export/proWeekly',{
                        userinfo : req.session.userInfo,
                        defWeek: defWeek,
                        list : wList
                    })
                }
              }else{
                res.send(workJson.msg)
              }
          }else{
              res.send(error)
          }
      });
})

module.exports = router;

Date.prototype.Format = function(fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
    
    
