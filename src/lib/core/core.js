// if (DEBUG) {
//   window.onerror = function(errorMessage, scriptURI, line, column, error) {
//     if (error) {
//       aha.error(error.stack)
//     } else {
//       aha.error(errorMessage + ' in ' + scriptURI + ':' + line + ':' + column);
//     }
//   };
// }
var COOKIES_EXPIRES = 60 * 60 * 24 * 30;
var readyFn = function() {
  var isReady = false
  var readyCallbacks = []
  return function(callback) {
    if (callback === true) {
      isReady = true
      readyCallbacks.forEach(function(callback) {
        callback()
      })
      return readyCallbacks = []
    }
    if (isReady) {
      callback()
    } else {
      readyCallbacks.push(callback)
    }
  }
}

var app = {
  ready: readyFn(),
  session: {},
  loadJ: function(){
    var j = v.url.query().j
    if (j && j.openid && j.passport) {
      app.updateSession(j)
      return true
    }
    return false
  },
  updateSession: function(session) {
    app.SESSION_FIELDS.forEach(function(name) {
      if (v.defined(session[name])) {
        v.cookie.set(name, app.session[name] = session[name], COOKIES_EXPIRES)
      }
    })
  },
  loadSession: function() {
    if(!app.loadJ()){
      app.SESSION_FIELDS.forEach(function(name) {
        app.session[name] = v.cookie.get(name)
      })
      app.updateSession(app.session)
    }
  }
}

var View = v.EventTrigger.extend({
  init: function(id, el, context) {
    this.id = id
    this.el = el
    this.context = context

    this.viewInit(el, context)
  },

  viewInit: v.nop,

  find: function(selector) {
    return this.el.find(selector);
  },

  append: function(obj) {
    return v.$(obj, this.el);
  },

  data: function(name) {
    var data = this.el.data(name)
    var context = this.context
    var result = data[0]
    if (result === '[' || result === '{') {
      return Promise.resolve(JSON.parse(data))
    }

    result = context[data]
	  if (v.defined(result)) {
		  if (v.isFunction(result)) {
			  result = result.call(context, this.el, name)
		  }
		  if (result instanceof Promise) {
			  return result
		  }
		  return Promise.resolve(result)
	  }

    return Promise.resolve(data)
  },

  fn: function(name) {
    return name && this.context[name] || v.nop
  }
})

var Page = Object.extend(function() {
  var EXP_FULLURL = /^(?:\.{0,2}|(?:\w+:)?\/)\//i;

  var tplContainer = document.createElement('div');

  var tpls = {};

  var current;

  var views = {};

  var URL_SUFFIX = {};
  try {
    URL_SUFFIX = v.url.query(v(v('script').filter(function (item) { return item.src.indexOf('setting.js') > 0 })[0]).attr('src').split("?")[1]);
  } catch (e) {
    URL_SUFFIX = {};
  }

  var defaultOptions = {
    needsAuth: (v.env.wechat ? true : false),           // 需要用户登录
    autoRender: true,           // 自动页面渲染
    pagingEnabled: false,        // 自动分页
    sharable: false,
    wxSharable: true
  };

  var Paging = Object.extend({
    size: 20,
    // index: 1,
    // loading: false,
    // hasMore: true,
    // count: 0,

    init: function(context) {
      var self = this
      var body = document.body
      self.context = context
      self.reset()
      if (context.options.pagingMode != 'manual') {
        $(window).on('scroll', function(event) {
          var bottom = body.scrollHeight - (body.scrollTop + window.innerHeight);
          if (bottom <= 100 && !self.loading && self.hasMore) {
            self.load()
          }
        })
      }
    },

    isFirst: function() {
      return this.index == 1
    },

    setSize: function(size){
      this.size = size || this.size;
      return this
    },

    reset: function() {
      this.loading = false
      this.index = 1
      this.count = 0
      this.hasMore = true
      return this
    },

    load: function() {
      this.context.onPaging.call(this.context, this)
    },

    start: function() {
      if (this.loading || !this.hasMore) {
        return Promise.reject(this)
      }
      this.loading = true
      return Promise.resolve(this)
    },

    done: function(size, total) {
      var self = this
      self.count += size
      self.hasMore = (size >= self.size && (total < 0 || self.count < total))
      if (self.hasMore) {
        self.index++
      }
      !function() {
        self.loading = false
      }.defer(200)
    }
  })

  // function refreshFn() {
  //   if (v.storage.get('page-needs-reload')) {
  //     v.storage.remove('page-needs-reload');
  //     Page.reload();
  //   }
  // }

  function openUrl(url, params, replace) {
    // refreshFn.cancel();
    params = params || {};

    if (url && !EXP_FULLURL.test(url)) {
      url = require.config.baseUrl + url;
    }

    if (app.channel.name) {
	    params.channel = app.channel.name
    }

    params = v.mixin({}, URL_SUFFIX, params);

	  url = v.url.build(params, url)

    if (aha.isReady) {
      aha.openUrl({url: v.url.parse(url).href, replace: !!replace})
      return;
    }

    if (replace) {
      top.location.replace(url);
    } else {
      top.location.href = url;
    }
    // v.storage.remove('page-needs-reload');
    // refreshFn.defer(100);
  }

	v.fn.appendView = function (tpl, context) {
		var el = v.isObject(tpl) ? v.$(tpl) : v(tpl)
		initView(el, context || current)
		this.append(el)
	}

  v.jsx = function (type, properties, children) {
    properties = properties || {}
    if (v.isString(type)) {
      properties.tag = type
    } else if (type.tag) {
      properties.tag = type.tag
    }
    if (arguments.length > 2) {
      children = Array.from(arguments).slice(2)
      if (children[0] && !children[0].isQ) {
        properties.html = children[0]
        children.shift()
      }
      properties.components = children.filter(function (value) {
        return value != null && value !== false && value !== ''
      }).map(function (value) {
        return value.isQ ? value : v.$('' + value)
      })
    }
    var el = v.$(properties)
    if (!v.isString(type)) {
      createView(type, el, current)
    }
    initView(el, current)
    return el
  }

  function createView(type, el, context) {
    var id = el.attr('v-id') || v.id(el)
    views[(context.name || '') + '.' + id] = {
      view: new type(id, el, context)
    }
  }

  function initView(el, context) {
    function _initLink(el, link) {
      var eventName = el.attr('v-link-event');
      var prefix = link.charAt(0);

      el.attr('tap-highlight', 'yes');

      el.on(eventName || 'singleTap', function(event) {
        var el = $(this)
        if (el.enabled()) {
          event.el = el
          event.stopPropagation()

          if (prefix === '*' || prefix === '@') {
            var args = link.substring(1).split(/\s+/).map($.url.decode)
            var name = args.shift()
            var ctx = (prefix === '*' ? context : window)
            if (ctx[name]) {
              ctx[name].apply(ctx, [event].concat(args))
            }
            return
          }

          if (link) {
            openUrl(link)
          }
        }
      })
    }

    function _initView(el, viewName) {
      if (DEBUG) {
        if (!window[viewName]) {
          console.error('View ' + viewName + ' is not found.')
        }
      }
      var viewClass = window[viewName] || View
      createView(viewClass, el, context)
    }

    function _process(el) {
      if (el.nodeType !== 1 && el.nodeType !== 9) {
        return
      }

      el = $(el);

      var link = el.attr('v-link')
      var viewName = el.attr('v-name')

      if (link) {
        _initLink(el, link)
        el.removeAttr('v-link');
      }

      if (viewName) {
        _initView(el, viewName)
        el.removeAttr('v-name')
      }

      el.children().forEach(_process)
    }

    el.forEach(_process);
  }

  return {
    // options: {},

    init: function(name, _options) {
      var self = this;
      var options = v.x(_options || {}, self.options || {}, defaultOptions);

      var body = $(document.body);
      var el = $('#' + name);
      if (el.length == 0) {
        el = $('article.vpage').get(0);
        if (el.has()) {
          if (el.attr('id')) {
            el = [];
          } else {
            el.attr('id', name);
          }
        }
      }
      if (el.length == 0) {
        el = v.$({id: name, classes: 'vpage', tag: 'article', components: [
          {tag: 'section', components: [
            {classes: 'vpage-content'}
          ]}
        ]}, body);
      }

      self.name = name;
      self.options = options;
      self.params = v.url.query();

      self.el = el;
      self.wrapperEl = el.children('section').get(0);
      var contentEl = self.contentEl = el.find('.vpage-content');

      if (self.content) {
        contentEl.append($(self.content));
      }

      el.addClass('vpage');
      body.addClass(name);

      // Page Header Init
      var headerEl = self.headerEl = el.children('header');
      if (headerEl.has()) {
        el.addClass('with-header');
        var titleEl = headerEl.children('h1');
        if (titleEl.has()) {
          Page.setTitle(titleEl.text() || app.ui.title);
        }
      }

      // Page Footer Init
      var footerEl = self.footerEl = el.children('footer');
      if (footerEl.has()) {
        el.addClass('with-footer');
      }

      // Page SideBar Init
      var asideEl = self.asideEl = el.children('aside');
      if (asideEl.has()) {
        el.addClass('with-aside');
      }

      // Template Init
      el.find('script').forEach(function(tplEl) {
        tplEl = $(tplEl);
        if (tplEl.attr('type') == 'text/template') {
          tpls[name + '.' + tplEl.attr('name')] = tplEl.html().replace(/>\s+</g, '><').trim();
          tplEl.remove();
        }
      });

      // Auto Paging
      if (options.pagingEnabled) {
        self.paging = new Paging(self)
      }

      v.$({classes: 'clear'}, body)
      body.prepend(v.$({classes: 'prepend'}))

      $(window).on('share-event', function (event) {
        var target = event.shareTarget
        if (target && self.onShouldShare(target)) {
          aha.share({
            target: target,
            url: target == app.SHARE_TARGET.WECHAT_FRIEND || target == app.SHARE_TARGET.WECHAT_TIMELINE
              ? Fn.getWechatLink(app.wechat.SHARE_LINK || app.SHARE_LINK) : (app.wechat.SHARE_LINK || app.SHARE_LINK),
            title: app.wechat.SHARE_TITLE || app.SHARE_TITLE,
            imageUrl: app.wechat.SHARE_IMG_URL || app.SHARE_IMG_URL,
            content: app.wechat.SHARE_DESC || app.SHARE_DESC,
            complete: function (result) {
              self.onDidShare(target, result.success, result.msg)
            }
          })
        }
      })

      current = self;
      if (DEBUG) {
        window.page = current
      }
    },

    find: function(selector) {
      return this.el.find(selector);
    },

    append: function(obj) {
      return v.$(obj, this.contentEl);
    },

    tpl: function(name, obj, appendTo) {
      if (DEBUG) {
        if (!tpls[this.name + '.' + name]) {
          console.error('Template ' + name + ' is not found.')
        }
      }

      var key = this.name + '.' + name;
      var tpl = v.tpl(tpls[key], obj, '');
      var el;

      tplContainer.innerHTML = '' + tpl;
      el = $(Array.from(tplContainer.childNodes));
      tplContainer.innerHTML = '';

      initView(el, this);

      if (appendTo) {
        (appendTo.isQ || appendTo instanceof Page ? appendTo : this.find(appendTo)).append(el);
      }

      return el;
    },

    hideHeader: function() {
      this.headerEl.hide()
      this.el.removeClass('with-header')
    },

    hideFooter: function() {
      this.footerEl.hide()
      this.el.removeClass('with-footer')
    },
    
    makeFooter: function () {
      this.footerEl = v.$({tag: 'footer'}, this.el)
      this.el.addClass('with-footer')
    },

    view: function(id) {
      if (id.isQ) {
        id = v.id(id)
      }
      return views[this.name + '.' + id].view
    },

    onRender: v.nop,
    render: function() {
      this.onRender();
    },

    onReload: v.nop,
    reload: function() {
      if (this.onReload === v.nop) {
        location.reload();
      } else {
        this.onReload();
      }
    },

    onPaging: v.nop,

    onShouldShare: function (target) {
      return true
    },

    onDidShare: function (target, success, message) {
      // nothing
    },

    statics: {
      ready: function(properties) {
        if (v.isFunction(properties)) {
          properties = properties(v, v.url.query());
        }

        var init = properties.init || v.nop;
        properties.init = function() {
          this.super('init', arguments);

          var self = this
          var options = self.options

          function _init() {
            init.call(self);

            // View Init
            initView(self.el, self)
            
            if (options.menu && app.menu && v.env.wechat) {
              if (!self.footerEl.has()) {
                self.makeFooter()
              }
              initView(v.$({vName: 'MainTab'}, self.footerEl), self)
            }

            if (options.autoRender) {
              self.onRender(true);
            }

            app.wechat.wxShareUrl = options.wxShareUrl
            app.wechat.wxShortUrl = options.wxShortUrl
            
            if (options.wxSharable && v.env.wechat) {
              wechat.init();
            }

            if (options.sharable && aha.isReady) {
              var targets
              if (Array.isArray(options.sharable)) {
                targets = options.sharable
              }
              aha.initShare({ targets: targets })
            }

            self.el.show();

            if ($('meta[name=v-viewport]').attr('content') == 'no') {
              self.el.style('width', 'auto')
              viewportInit()
            } else {
              viewportInit(self.el.rect().width)
            }
          }

          if (options.needsAuth) {
            app.user.auth({login: true}).then(function(data) {
              _init()
            })
          } else {
            _init()
          }
        };

        app.ready(function() {
          var name = properties.name;
          var pos;
          var path = location.pathname;
          if (!name) {
            pos = path.lastIndexOf('/');
            if (pos >= 0 && /\.html$/.test(path)) {
              name = path.substring(pos + 1).replace(/\.html$/, '');
            }
          }
          Page.extend(properties).create('page-' + (name || 'index'));
        });
      },

      setTitle: function(title) {
        document.title = title || '';
        var el = v.$({
          tag: 'iframe',
          src: '/blank.html',
          height: 1,
          width: 1,
          style: 'opacity:0',
          onLoad: function() {
            setTimeout(function() {
              el.off('load').remove()
            }, 0)
          }
        }, document.body)
        if (current && current.headerEl) {
          current.headerEl.find('h1').text(title)
        }
      },

      open: openUrl,
      redirect: function(url, params) {
        openUrl(url, params, true)
      },

      back: function(num, backToHome) {
        // if (num !== false) {
        //   v.storage.set('page-needs-reload', 1)
        // }

        if (aha.isReady) {
          aha.historyBack({ count: (num | 0) || 1 })
          return
        }

        if (backToHome) {
          function toHome() {
            Page.open(app.channel.homepage || 'index.html')
          }
          $(window).on('beforeunload', function() {
            toHome.cancel()
          })
          toHome.defer(100)
        }

        if (num) {
          history.go(-num);
        } else {
          history.back();
        }
      },

      forward: function(num) {
        // if (num !== false) {
        //   v.storage.set('page-needs-reload', 1)
        // }
        if (num) {
          history.go(num);
        } else {
          history.forward();
        }
      },

      reload: function(force) {
        if (!force && current) {
          current.reload();
        } else {
          location.reload();
        }
      }
    }
  };
});

$(window).on('message', function(event) {
  var data = event.data
  if (/^(message_\w+):(.*)$/.test(data)) {
    var name = RegExp.$1
    var value = RegExp.$2
    try {
      value = JSON.parse(value)
    } catch (e) {
      // nothing
    }
    $(window).trigger(name, {data: value})
  }
})

v.storage.set('last-href', location.href)
