'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');
var formDataToJSON = require('./helpers/formDataToJSON');

/* 
通过 Axios 构造函数，创建 Axios 实例 context， instance 默认被赋值为 context 的 request 方法。
instance 最终又被赋值给 axios，因此 axios 实际是 Axios.prototype.request 的方法。直接调用 axios 方法，等同于调用 axios.request 方法
给 instance 这个函数添加属性，包括 ：Axios 原型链上的方法，Axios 实例（context）的属性
instance 虽然不是 Axios 实例（是一个函数），但是具备 Axios 实例的所有属性。
 */
/**
 * Create an instance of Axios
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios ：工厂模式创造一个 Axios 对象的实例 axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  // 直接使用  axios(config) 时，实际调用 request方法
  var instance = bind(Axios.prototype.request, context);  // request 方法执行，this 指向 context

  // Copy axios.prototype to instance
  // 拷贝 Axios原型链方法到 instance ，并指定 this 属性为当前的 context ，包括 get、post等方法
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance : 拷贝实例 context 中的属性到 instance
  utils.extend(instance, context);

  // Factory for creating new instances
  // 最常用的 axios.create 方法，创建 instance
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  // 返回的一个函数，执行 context.request 方法
  return instance;
}

// Create the default instance to be exported
// 工厂模式创造一个 Axios 对象的实例 axios， 直接调用 axios(config) 实际是调用 request 方法
var axios = createInstance(defaults);  

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.CanceledError = require('./cancel/CanceledError');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');
axios.VERSION = require('./env/data').version;
axios.toFormData = require('./helpers/toFormData');

// Expose AxiosError class
axios.AxiosError = require('../lib/core/AxiosError');

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

// Expose isAxiosError
axios.isAxiosError = require('./helpers/isAxiosError');

axios.formToJSON = function(thing) {
  return formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);
};

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
