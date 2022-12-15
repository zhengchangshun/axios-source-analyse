'use strict';

var CanceledError = require('./CanceledError');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  // 这里的 cancel 传入的是 token.reason , 从代码的62行执行
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i = token._listeners.length;

    // 遍历执行 cancelToken 的订阅，在 lib/adapters/xhr 的 220 行，有添加订阅：实现请求的中断 request.abrot()
    while (i-- > 0) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  // cancel 方法的具体实现，cancel 方法执行时，触发 Promise 的 resolve
  executor(function cancel (message, config, request) {
    // 已经取消了
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new CanceledError(message, config, request);  // 设置取消原因
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal: 新增订阅
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  // 订阅列表存在则添加，否则创建订阅列表
  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal : 取消订阅
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  // 根据所以取消订阅
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 * 
 * source 方法本质还是执行 new CancelToken, 其中 token 是 CancenToken 的实例，
 * 执行 cancel 方法的时候，实际是执行 token 的 promise 属性 （Promise 对象）的 resolve 方法
 * 进而可以在 promise.then 中执行取消方法的订阅回调，其中最最要的的订阅是 lib/adapters/xhr - 220 行（node 类似），真正的执行取消请求。
 * 此处的 cancel 方法其实就是发布订阅模式下的 trigger 方法。
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;
