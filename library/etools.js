'use strict';
let request = require('async-request'),
    response;
var crypto = require('crypto');
var _ = require('lodash');
const { param } = require('../routes');
module.exports = {
  /**
   * return the success data.
   * @param data
   * @returns {{success: boolean, result: *, httpCode: number}}
   */
  'success': (data) => {
    return {'success': true, 'result': data, 'httpCode': 200};
  },
  /**
   * return the error data.
   * @param data
   * @param httpCode
   * @returns {{success: boolean, result: *, httpCode: *}}
   */
  'error': (data, httpCode) => {
    return {'success': false, 'result': data, 'httpCode': httpCode};
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