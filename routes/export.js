var express = require('express');
var router = express.Router();
var tools = require('./common')
const etools = require('../library/etools');
const { http_request } = require('../library/etools');
const { forEach } = require('lodash');
const work_url = tools.GoUrl.workUrl;
const project_url = tools.GoUrl.projectUrl;
var plist = {}
var workTypeList=tools.WorkType
router.all('*', async function(req, res, next) {
    if(!req.session.userInfo){  /*获取*/
      res.redirect('/')
    }
    let resp = await http_request(project_url, null, 'GET');
    if (resp['error'] == null && resp['data'].statusCode == 200) {
        var bodyJson = etools.s2j(resp['data'].body)
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
//个人日报
router.get('/priDaily', async function(req, res, next){
    var defDay = req.query['day'] ? req.query['day'] : 2
    var selectDay = new Date(new Date().getTime()).Format("yyyy-MM-dd")
    if (defDay == 1) {
        selectDay = new Date(new Date().getTime() - 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
    }else if(defDay == 3) {
        selectDay = new Date(new Date().getTime() + 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
    }
    let resp = await http_request(work_url, {
        'user_id': req.session.userInfo.id,
        'created': selectDay,
        'page_num': 1,
        'page_size': 1000,
        'sort':JSON.stringify({"id":"desc"})
    }, "GET");
    if (resp['error'] == null && resp['data'].statusCode == 200) {
        var workJson = etools.s2j(resp['data'].body)
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
})
//个人周报
router.get('/priWeekly', async function(req, res, next){
    var defWeek =  req.query['week'] ? req.query['week'] : 2
    let resp = await http_request( work_url+'weekly',{
        'user_id': req.session.userInfo.id,
        'page_num': 1,
        'page_size': 1000,
        'weekly_type' : defWeek,
        'sort':JSON.stringify({"id":"desc"})
    }, 'GET');
    if (resp['error'] == null && resp['data'].statusCode == 200) {
        var workJson = etools.s2j(resp['data'].body)
        if (workJson.code == 1000) {
          if (workJson.data == null) {
              res.render('export/weekly',{
                  userinfo : req.session.userInfo,
                  defWeek: defWeek,
                  list : null
              })
          }else{
              var wList = {}
              let frList = etools.uniq_list(workJson.data)
              for(let item in frList) {
                let jkey = frList[item]
                const arr = wList[plist[jkey.project_id]]
                  if (Object.prototype.toString.call(arr) !== '[object Array]') {
                    wList[plist[jkey.project_id]] = []
                  }
                wList[plist[jkey.project_id]].push(jkey)
              }
              console.log(wList);
            //   workJson.data.forEach((item)=>{
            //       const arr = wList[plist[item['project_id']]]
            //       if (Object.prototype.toString.call(arr) !== '[object Array]') {
            //           wList[plist[item['project_id']]] = []
            //       }
            //       wList[plist[item['project_id']]].push(item)
            //   })
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
})

router.get('/proDaily', async function(req, res, next){
    var defDay = req.query['day'] ? req.query['day'] : 2
    var selectDay = new Date(new Date().getTime()).Format("yyyy-MM-dd")
    if (defDay == 1) {
        selectDay = new Date(new Date().getTime() - 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
    }else if(defDay == 3) {
        selectDay = new Date(new Date().getTime() + 1000 * 60 * 60 * 24).Format("yyyy-MM-dd")
    }
    let resp = await http_request(work_url, {
        'created': selectDay,
        'page_num': 1,
        'page_size': 1000,
        'sort':etools.j2s({"work_type":"asc", "id":"desc"})
    }, 'GET');
    if (resp['error'] == null && resp['data'].statusCode == 200) {
        var workJson = etools.s2j(resp['data'].body)
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
})

router.get('/proWeekly', async function(req,res, next){
    var defWeek =  req.query['week'] ? req.query['week'] : 2
    let resp = await http_request(work_url+'weekly', {
        'page_num': 1,
        'page_size': 1000,
        'weekly_type' : defWeek,
        'sort':etools.j2s({"work_type":"asc", "id":"desc"})
    }, 'GET');
    if (resp['error'] == null && resp['data'].statusCode == 200) {
        var workJson = etools.s2j(resp['data'].body)
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
})

router.get('/quarter', async (req, res, next)=>{
    //获取季度信息
    let quater = req.query['quarter'] ? req.query['quarter'] : etools.get_current_quarter();
    let timeArr = etools.get_quarter(quater);
    let resp = await http_request( work_url+'created-limit',{
        'user_id': req.session.userInfo.id,
        'page_num': 1,
        'page_size': 1000,
        'start_time': timeArr[0],
        'end_time' : timeArr[1],
        'sort':JSON.stringify({"id":"desc"})
    }, 'GET');
    if (resp['error'] == null && resp['data'].statusCode == 200) {
        var workJson = etools.s2j(resp['data'].body)
        if (workJson.code == 1000) {
          if (workJson.data == null) {
              res.render('export/quarter',{
                  userinfo : req.session.userInfo,
                  defQuarter: quater,
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
              res.render('export/quarter',{
                  userinfo : req.session.userInfo,
                  defQuarter: quater,
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