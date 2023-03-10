'use strict';

var utils = require('../utils');
var AxiosURLSearchParams = require('../helpers/AxiosURLSearchParams');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @param {?object} options
 * @returns {string} The formatted url
 * 将 params 参数拼接到 url 后
 */
module.exports = function buildURL(url, params, options) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var hashmarkIndex = url.indexOf('#');

  if (hashmarkIndex !== -1) {
    url = url.slice(0, hashmarkIndex);
  }

  var _encode = options && options.encode || encode;

  var serializerParams = utils.isURLSearchParams(params) ?
    params.toString() :
    new AxiosURLSearchParams(params, options).toString(_encode);

  if (serializerParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializerParams;
  }

  return url;
};
