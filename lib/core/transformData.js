'use strict';

var utils = require('./../utils');
var defaults = require('../defaults');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Number} status HTTP status code
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 * 
 * 依次执行 fns 中函数，并将前三个参数作为 fn 的入参。最终返回 data 数据
 */
module.exports = function transformData(data, headers, status, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers, status);
  });

  return data;
};
