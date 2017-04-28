(function () {

  var KEY_TID = 'tid'
  var tid = v.storage.get(KEY_TID)

  var api = window.api = {}
  var Api = window.Api = Object.extend({
    init: function (path, options) {
      this.baseUrl = app.API_URL
      // this.url = path
      this.url = ''
      this.dataType = 'json'
      this.options = options || {}
    },

    quiet: function () {
      this.options.quiet = true
      return this
    },

    get: callMethod('GET'),
    post: callMethod('POST'),
    put: callMethod('PUT'),
    del: callMethod('DELETE'),

    buildUrl: function () {
      return this.baseUrl + this.url
    },

    statics: {
      init: function () {
        v.each(app.APIS, function (options, name) {
          api[name] = new Api(options.path || name, options || {});
        });

        var fake = app.fake && app.FAKE_DATAS[app.fake]
        if (fake) {
          app.updateSession(fake)
        } else if (aha.isReady) {
          return aha.getSession().then(function (result) {
            app.updateSession(result.msg)
            return Promise.resolve()
          })
        } else if (!v.env.wechat) {
          if (!app.loadJ() && setting.channel) {
            app.SESSION_FIELDS.forEach(function (name) {
              app.session[name] = v.cookie.get(name) || setting.channel[name]
            })
          }
        } else {
          app.loadSession()
          return Promise.resolve()
        }
      }
    }
  });

  function callMethod(methodName) {
    if (aha.isReady) {
      return function (action, params, options) {
        if (v.isString(action)) {
          options = v.x({action: action}, options, this.options)
          params = v.x(params || {}, options.params);
        } else {
          options = v.x(params || {}, this.options)
          params = v.x(action || {}, options.params);
        }
        var self = this;

        if (options.action) { // 兼容旧版本
          action = options.action
        }
        if (v.defined(options.mask)) { // 兼容旧版本
          options.quiet = !options.mask
        }

        // build url
        var url = this.buildUrl(params, options);
        if (options.urlParams && v.isObject(options.urlParams)) {
          options.urlParams = v.url.query(options.urlParams)
        }

        v.storage.set(KEY_TID, tid);
        this.tid = tid;

        var session = app.session
        if (session.vericode) {
          options.vericode = session.vericode
          delete session.vericode
        }

        // if (!options.quiet) {
        //   v.ui.Loading.start()
        // }

        DEVMODE && console.log('#' + self.tid + ' Request: ' +
          methodName + ' ' + options.action,
          params);

        return aha.callApi({
          method: methodName,
          action: action,
          params: params,
          options: options
        }).then(function (result) {
          result = result.msg.result;
          if (result && v.isString(result)) {
            result = JSON.parse(result)
          }
          return _callback(self, {
            response: result,
            request: {
              type: methodName,
              url: url,
              data: params
            },
            options: options
          })
        }).catch(function (err) {
          return _error(self, {
            response: err.response || {code: -1, errmsg: err.msg},
            request: err.request || {
              type: methodName,
              url: url,
              data: params
            },
            options: err.options || options
          })
        });
      }
    }

    return function (action, params, options) {
      if (v.isString(action)) {
        options = v.x({action: action}, options, this.options)
        params = v.x(params || {}, options.params);
      } else {
        options = v.x(params || {}, this.options)
        params = v.x(action || {}, options.params);
      }
      var self = this;

      if (options.action) { // 兼容旧版本
        action = options.action
      }
      if (v.defined(options.mask)) { // 兼容旧版本
        options.quiet = !options.mask
      }

      // build url
      var url = this.buildUrl(params, options);
      if (options.urlParams) {
        var queryPrefix = url.indexOf('?') < 0 ? '?' : '&'
        if (v.isObject(options.urlParams)) {
          url += v.url.query(options.urlParams, queryPrefix)
        } else {
          url += queryPrefix + options.urlParams
        }
      }

      // build params
      var session = app.session
      var j = JSON.stringify({
        wxappid: options.otherAppid || app.id || '',
        openid: options.otherOpenid || session.openid || '',
        passport: options.otherPassport || session.passport || '',
        vericode: session.vericode || '',
        url: location.href,
        action: options.action || '',
        requestParam: params || {},
        xxx: new Date().getTime() % 10000
      })
      var sign = md5(j)
      var requestParams = {_t: ++tid, j: j, sign: sign}
      v.storage.set(KEY_TID, tid);
      this.tid = tid;
      //
      if (options.ljsonp) {
        v.x(requestParams, {jdomain: options.jdomain, japi: options.japi})
      }
      //
      if (options.type === 'JSONP') {
        requestParams.callback = '?'
      }

      if (session.vericode) {
        delete session.vericode
      }

      if (!options.quiet) {
        v.ui.Loading.start()
      }

      DEVMODE && console.log('#' + self.tid + ' Request: ' +
        methodName + ' ' + options.action,
        params, "J: " + requestParams.j);

      return $.ajax({
        type: methodName,
        url: url,
        data: requestParams,
        dataType: this.dataType,
        timeout: app.API_TIMEOUT,
        contentType: methodName === 'GET'
          ? options.contentType
          : 'application/x-www-form-urlencoded'
      }).then(function (result) {
        result.options = options
        return _callback(self, result)
      }).catch(function (err) {
        err.options = options
        return _error(self, err)
      });
    };
  }

  function stringProxy(method) {
    return function (params, options) {
      return api.request[method](this, params, options).then(function (response) {
        return response.data
      })
    }
  }

  v.x(String.prototype, {
    GET: stringProxy('get'),
    POST: stringProxy('post')
  })

  function objectProxy(method) {
    return function (action, options) {
      var params = {obj: {}};
      if (this.isQ && this[0]) {
        Array.from(this[0].attributes).forEach(item => {
          if (item.name.indexOf('data-') == 0) {
            params[item.name.replace('data-', '')] = item.value;
          }
        })
      } else {
        v.x({}, this, params);
      }
      return api.request[method](action, params, options).then(function (response) {
        return response.data
      })
    }
  }

  v.x(Object.prototype, {
    GET: objectProxy('get'),
    POST: objectProxy('post')
  })

  function _callback(api, result) {
    return new Promise(function (resolve, reject) {
      var response = result.response;
      var success = (response.code === 0);

      if (!result.options.quiet && !aha.isReady) {
        v.ui.Loading.stop();
      }

      if (response) {

        DEVMODE && console.debug('#' + api.tid +
          ' Response: ' + result.request.type + ' ' + result.options.action,
          response.obj);

        if (success) {
          result.data = response.obj
          result.msg = response.obj // 兼容旧版本代码
          app.updateSession(response)
          return resolve(result)
        }
      }

      reject(result);
    })
  }

  function _error(api, result) {
    if (DEVMODE) {
      if (result instanceof Error) {
        console.warn(api, result);
      } else if (!result.error) {
        v.ui.alert(`DEVMODE: ${result.response.errmsg}`)
        // console.warn('#' + api.tid + ' ' + result.response.errmsg + ' (' + result.response.code + ')', result);
      } else {
        console.warn('#' + api.tid + ' ' + result.type, result.error, result);
      }
    }
    if (!result.options.quiet && !aha.isReady) {
      v.ui.Loading.stop();
    }
    // throw result;
    return Promise.reject(result)
  }
})();