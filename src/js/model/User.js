var User = Object.extend(function() {
  return {
    init: function() {
      this.load()
    },
    
    auth: function(options) {
      var self = this
      options = options || {
        // prompt: false,  // 是否提示用户登录
        // target: null,   // 改变登录后的跳转地址（默认为当前地址）
        // login: false    // 是否跳转到登录页面
      }
      
      // 已登录
      // if (app.session.uid) {
      if (app.session.openid && app.session.passport) {
        if (options.target) {
          Page.open(options.target)
        }
        return Promise.resolve(this)
      }
      
      if (options.prompt) {
        return v.ui.confirm('您还未登录，是否现在登录？').then(function(result) {
          return self.openLogin(options, result)
        })
      }
      
      return self.openLogin(options)
    },
    
    openLogin: function openLogin(options, force) {
      if (options.login || force) {
        var backUrl = options.target || location.href
        if (v.env.wechat) {
          // TODO: 进入微信鉴权
          v.cookie.set(app.id + "-oauth-state", backUrl, 60 * 5)
          var authUrl = app.wechat.OAUTH_URL.replace(/\{appid\}/g, v.url.encode(app.id))
            .replace('{state}', v.url.encode(location.protocol + "//" + location.host + "/state.html"))
            .replace('{hostname}', v.url.encode(location.host))
            .replace('{apidirpath}', v.url.encode('qc-webapp'))
          Page.redirect(authUrl, {})
          // Page.redirect(app.wechat.OAUTH_URL, {
          //   state: v.url.build({back: backUrl}, 'user/wx-login.html')
          // })
        } else {
          Page.redirect('user/login.html', {back: backUrl})
        }
      }
      return Promise.reject(self)
    },
    
    login: function(data) {
      var token = data.token
      var user = data.msg
      
      app.updateSession(v.x({
        token: token,
        uid: user.id
      }, app.session, {
        theme: 'aha',
        apiVersion: 1
      }))
      
      this.save(user)
      
      return Promise.resolve(this)
    },
    
    logout: function() {
      app.session.uid = ''
      app.session.token = ''
      app.updateSession(app.session)
      
      this.user = null
      v.storage.remove('user')
      
      return Promise.resolve(this)
    },
    
    save: function(user) {
      v.storage.set('user', {
        id: user.id,
        nickname: user.nickname
      })
      
      this.info = user
    },
    
    load: function() {
      this.info = v.storage.get('user')
    }
  }
})