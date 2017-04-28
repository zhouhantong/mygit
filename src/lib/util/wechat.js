// @see 微信JS-SDK说明文档 http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
(function(v) {

  var inited = false

  var SCENE_FRIEND = 1
  var SCENE_TIMELINE = 2
  var SCENE_QQ = 3
  var SCENE_WEIBO = 4
  var SCENE_QZONE = 5

  var params
  var wechatSettings

  var wechat = window.wechat = {
    hideOptionMenu: false,
    hideMenuItems: [],

    user: {},

    ready: readyFn(),

    init: function(_params) {
      if(!v.env.wechat){
        return;
      }
      if (!inited) {
        inited = true;
        wechatSettings = app.wechat

        if (!_params && wechatSettings.jssdk.appid) {
          _params = wechatSettings.jssdk
        }

        var jobs = [_params ? Promise.resolve(_params) : _getAppid()]
        if (!('wx' in window)) {
          jobs.push(require(location.protocol + '//res.wx.qq.com/open/js/jweixin-1.1.0.js'))
        }

        if (wechatSettings.wxShareUrl) {
          jobs.push(_getShareUrl())
        }

        Promise.all(jobs).then(function(data) {
          params = data[0]
          if (params.response) {
            params = params.response.msg
          }
          _wxConfig()
        })
      } else {
        _wxConfig();
      }
    },

    update: function(_settings) {
      v.x(wechatSettings, _settings || {}, true);
      Promise.all([
        _shareOptions(SCENE_FRIEND),
        _shareOptions(SCENE_TIMELINE),
        _shareOptions(SCENE_QQ),
        _shareOptions(SCENE_WEIBO),
        _shareOptions(SCENE_QZONE)
      ]).then(optionsList => {
        // 2.1 监听“分享给朋友”，自定义分享内容及分享结果接口
        wx.onMenuShareAppMessage(optionsList[0]);
        // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
        wx.onMenuShareTimeline(optionsList[1]);
        // 2.3 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
        wx.onMenuShareQQ(optionsList[2]);
        // 2.4 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
        wx.onMenuShareWeibo(optionsList[3]);
        // 2.5 监听“分享到QQ空间”按钮点击、自定义分享内容及分享结果接口
        wx.onMenuShareQZone(optionsList[4]);
      })

      if (wechat.hideMenuItems.length) {
        wx.hideMenuItems({
          menuList: wechat.hideMenuItems
        });
      }

      if (wechat.hideOptionMenu) {
        wx.hideOptionMenu();
      }
    }
  };

  ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage',
    'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice',
    'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice',
    'translateVoice', 'getNetworkType', 'getLocation', 'openLocation',
    'closeWindow', 'scanQRCode', 'openProductSpecificView',
    'chooseCard', 'addCard', 'openCard', 'chooseWXPay'
  ].forEach(function(name) {
    wechat[name] = function(options) {
      if (v.isFunction(options)) {
        options = {
          success: options
        }
      }
      return new Promise(function(resolve, reject) {
        wechat.ready(function() {
          var success = options.success
          var fail = options.fail
          options.success = function(res) {
            success && success(res)
            resolve(res)
          }
          options.fail = function(res) {
            fail && fail(res)
            reject(res)
          }
          if (name in wx) {
            wx[name](options)
          } else {
            v.ui.alert('您的微信版本太低或者部分功能未加载成功，请升级微信客户端或稍后重试。')
          }
        })
      })
    }
  });

  function _wxConfig() {
    if (!params) {
      return;
    }

    wx.config({
      debug: wechatSettings.DEBUG,
      appId: params.appid,
      timestamp: params.timestamp,
      nonceStr: params.noncestr,
      signature: params.signature,
      jsApiList: [
        'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ',
        'onMenuShareWeibo', 'onMenuShareQZone', 'startRecord', 'stopRecord',
        'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice',
        'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'chooseImage',
        'previewImage', 'uploadImage', 'downloadImage', 'translateVoice',
        'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu',
        'showOptionMenu', 'hideMenuItems', 'showMenuItems',
        'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow',
        'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard',
        'chooseCard', 'openCard'
      ]
    });
    // wx.error(function(res){
    //   alert(JSON.stringify(res));
    // });

    aha.log('Wechat JSSDK is configured.', params)

    wx.ready(function() {
      wechat.update()
      wechat.ready(true)
      aha.log('Wechat JSSDK is ready.')
    })
  }

  function _shareOptions(scene) {
    var _settings = _getSettings(scene)
    var options = {
      title: v.tpl(_settings.SHARE_TPL_TITLE, {
        content: _settings.SHARE_TITLE
      }),
      desc: v.tpl(_settings.SHARE_TPL_DESC, {
        content: _settings.SHARE_DESC
      }),
      link: _shareLink(scene, _settings),
      imgUrl: _settings.SHARE_IMG_URL,
      success: _shareCallback_OK(scene, _settings),
      cancel: _shareCallback_CANCEL(scene, _settings),
      // complete: function(res) {
      //   wechatSettings.DEBUG && alert(JSON.stringify(res));
      // },
      fail: function(res) {
        wechatSettings.DEBUG && v.ui.alert(JSON.stringify(res));
      }
    };
    if (wechatSettings.wxShortUrl) {
      return Fn.getDynShortUrl(options.link).then(link => v.x({
        link: link
      }, options))
    } else {
      return Promise.resolve(options);
    }
  }

  function _shareCallback_OK(scene, settings) {
    return function() {
      settings.SHARE_CALLBACK_OK(scene);
      // app.wechat.SHARE && app.wechat.SHARE.closeGuide();
    }
  }

  function _shareCallback_CANCEL(scene, settings) {
    return function() {
      settings.SHARE_CALLBACK_CANCEL(scene);
      // app.wechat.SHARE && app.wechat.SHARE.closeGuide();
    }
  }

  function _shareLink(scene, settings) {
    var link = settings.SHARE_LINK
    if (!link) {
      var q = v.x({}, v.url.query());
      if (q.wechatUserInfo || q.cmd || q.fake) {
        if (q.wechatUserInfo) {
          delete q.wechatUserInfo;
        }
        if (q.cmd) {
          delete q.cmd;
        }
        if (q.fake) {
          delete q.fake;
        }
      }
      link = v.url.build(q)
    }

    if (!v.env.wechat || (scene != SCENE_FRIEND && scene != SCENE_TIMELINE)) {
      return link;
    }

    return v.url.build({}, v.tpl(settings.SHARE_URL, {
      url: v.url.encode(link),
      openid: app.session.openid,
      appid: params.appid,
      scene: scene
    }, ''))
  }

  function _getSettings(scene) {
    var options
    switch (scene) {
      case SCENE_FRIEND:
        options = wechatSettings.SHARE_FRIEND
        break;
      case SCENE_TIMELINE:
        options = wechatSettings.SHARE_TIMELINE
        break;
      case SCENE_QQ:
        options = wechatSettings.SHARE_QQ
        break;
      case SCENE_WEIBO:
        options = wechatSettings.SHARE_WEIBO
        break;
      case SCENE_QZONE:
        options = wechatSettings.SHARE_QZONE
        break;
    }
    return v.x({}, wechatSettings, options || {})
  }

  function _getAppid() {
    return api.getAppid.get().then(function(response) {
      wechatSettings.jssdk.appid = response.data
      return Promise.resolve(wechatSettings.jssdk)
    })
  }

  function _getShareUrl() {
    return api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {
      obj: {
        openid: app.session.openid
      }
    }).then(function(response) {
      var userObj = response.data
      var query = v.x({}, v.url.query())
      if (userObj) {
        if (userObj.agent && userObj.agent.state == 1 && userObj.agent.workstate != 0) {
          //是经纪人
          delete query.fopenid
          delete query.memberopenid
          query.fopenid = app.session.openid
          query.memberopenid = app.session.openid
          wechatSettings.SHARE_LINK = v.url.build(query)
        } else if (userObj.teammember && userObj.teammember.state == 1) {
          //是队员或队长
          delete query.fopenid
          delete query.memberopenid
          query.fopenid = userObj.teammember.leaderopenid
          query.memberopenid = app.session.openid
          wechatSettings.SHARE_LINK = v.url.build(query)
        }
      }
      return Promise.resolve()
    })
  }

})(vee);