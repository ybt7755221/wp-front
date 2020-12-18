'use strict';
let request = require('async-request'),
    response;
const { time } = require('console');
var crypto = require('crypto');
var _ = require('lodash');
const { param } = require('../routes');
module.exports = {
  /**
   * return the success data.
   * @param data
   * @returns {{success: boolean, msg:string, data: *, code: number}}
   */
  'success': (data) => {
    return {'success': true, 'msg':'success', 'data': data, 'code': 1000};
  },
  /**
   * return the error data.
   * @param data
   * @param httpCode
   * @returns {{success: boolean, msg:string, data: *, code: *}}
   */
  'error': (msg, code) => {
    return {'success': false, 'msg': msg, 'data':null, 'code': code};
  },
  /**
   * encryption user password
   * @param string
   */
  'hash': (string) => {
    const Hash = crypto.createHash('md5');
    Hash.update(string);
    return Hash.digest('hex');
  },
  'isEmpty': (data) => {
    return _.isEmpty(data)
  },
  /**
   * convert json to string
   * @param json
   */
  'j2s' : (json) => {
    return JSON.stringify(json);
  },
  /**
   * convert string to json
   * @param string
   */
  's2j' : (string) => {
    return JSON.parse(string);
  },
  'get_current_quarter' : ()=> {
    return _.ceil((new Date().getMonth()+1) / 3);
  },
  'get_quarter' : (qa) => {
    let timeArr =[];
    qa = _.floor(qa);
    if (qa > 4 || qa < 1) {
      qa = _.ceil((new Date().getMonth()+1) / 3);
    }
    switch(qa) {
      case 1:
        timeArr = [ '2020-01-01', '2020-03-31'];
        break;
      case 2:
        timeArr = [ '2020-04-01', '2020-06-30'];
        break;
      case 3:
        timeArr = [ '2020-07-01', '2020-09-30'];
        break;
      case 4:
        timeArr = [ '2020-10-01', '2020-12-31'];
        break;
      default:
        break;
    }
    return timeArr
  },
  'http_request' : async (url, data, method) => {
    console.log(method)
    if (method == "POST") {
      try{
        response = await request(url, {
            // This example demonstrates all of the supported options.
            // Request method (uppercase): POST, DELETE, ...
            method: "POST",
            data: data,
            //headers: {},
            //proxy: 'http://127.0.0.1:8000',
            // To create a new cookie jar.
            //cookieJar: true,
            // To use a custom/existing cookie jar.
            // https://www.npmjs.com/package/tough-cookie
            //cookieJar: new tough.CookieJar()
        });
      }catch(e) {
        return {data: response, error: e}
      }
    }else{
      let params = '';
      if (data != null) {
        params += '?';
       _.forEach(data, (value, key) => {
         params += key +'='+value+'&';
       })
      }
      console.log(params)
      try{
        response = await request(url+params);
      }catch(e) {
        return {data: response, error: e}
      }
    }
    return {data: response, error: null}
  }
};