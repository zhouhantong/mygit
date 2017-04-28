Page.ready(function() {
  
  function formatJSON(json) {
    return JSON.stringify(json)//.replace(/\,\"/g, ', "')
  }
  
  return {
    options: {
      menu: false,
      hideOptionMenu: DEBUG ? false : true
    },
    
    init: function() {
      var self = this
      
      if (this.params.title) {
        Page.setTitle("Page #" + this.params.title)
      }
      
      self.print('user agent', navigator.userAgent)
      self.print('v.env', formatJSON(v.env))
      
      self.print('Aha JSSDK', aha.isReady ? 'yes' : 'no')

      self.print('app.session', formatJSON(app.session))

      if (aha.isReady) {
        aha.getAppVersion().then(function(result) {
          // aha.log(result)
          self.print('App Version', formatJSON(result.msg))
        })
        // self.print('App Version', app.session)
        
        aha.getSession().then(function(result) {
          // aha.log(result)
          self.print('session', formatJSON(result.msg))
        })

        // aha.initShare({
        //   url: "123",
        //   title: "123",
        //   imageUrl: "123",
        //   content: "123",
        //   success: function(){
        //     self.print("init share", true)
        //   }
        // })
      }
      // api.album.get({id: "4028b8814e29fd4d014e29fe3fe20265", withItems: true}).then(function(data) {
      //   aha.log(data.response)
      // });

    },

    onRender: function(){
    },
    
    onSearch: function() {
      aha.search({word: '啊哈'})
    },
    
    onSearchBlank: function() {
      aha.search()
    },
    
    onOpenUrl: function() {
      aha.openUrl({url:'http://www.baidu.com'})
    },
    
    onOpenUrl2: function() {
      aha.openUrl({url: v.url.build({title: v.rand(10000)})})
    },
    
    onOpenUrlDianping: function() {
      aha.openUrl({url:'https://dev.aha.wenhaoer.com/app/life/dianping?category=%E8%B4%AD%E7%89%A9',provider:'大众点评'})
    },
    
    onOpenUrlAlbum: function() {
      // aha.openUrl({url:'album://4028b8814e29fd4d014e29fe3fe20265'})
      // aha.debug(v.url.build('', '/album/page/4028b8814e29fd4d014e29fe3fe20265'))
      aha.openUrl({url: v.url.build('', '/album/page/4028b8814e29fd4d014e29fe3fe20265')})
    },
    
    onAddFavoriteAlbum: function() {
      aha.addFavorite({
        type: 'album', 
        id: '4028b8814e29fd4d014e29fe41410282', 
        title: '岁月如歌',
        complete: function(data) {
          v.ui.alert(data.success ? '成功' : data.msg)
        }
      })
    },
    
    onAddFavoriteItem: function() {
      aha.addFavorite({
        type: 'item', 
        id: '4028b8814e29fd4d014e29fe414c0283', 
        title: '续集',
        complete: function() {
          v.ui.alert(data.success ? '成功' : data.msg)
        }
      })
    },
    
    onPreviewImages: function() {
      aha.previewImages({"images":[
        {"url":"http://dev.res.aha.wenhaoer.com/images/db/c8/27b78e352b7b55ab483575b146b7.png"},
        {"url":"http://dev.res.aha.wenhaoer.com/images/e9/9e/6577435fbd8f0d351a4b96cb0fe2.png"},
        {"url":"http://dev.res.aha.wenhaoer.com/images/82/b4/f8b0d98c66beeb4ac21d1409c4e1.png"},
        {"url":"http://dev.res.aha.wenhaoer.com/images/50/84/6360affe55dff858eae4c95dadc9.png"},
        {"url":"http://dev.res.aha.wenhaoer.com/images/bf/02/b5d2ef7a875b50ea664b8d04ceda.png"}
      ],"index":1})
    },
    
    onScan: function() {
      aha.scan()
    },
    
    onScanNeedResult: function() {
      aha.scan({needResult: 1, success: function(result) {
        aha.debug(result)
      }})
    },
    
    onSpeech: function() {
      aha.speech()
    },
    
    onSpeechNeedResult: function() {
      aha.speech({needResult: 1, success: function(result) {
        aha.debug(result)
      }})
    },
    
    onFetchWeb: function() {
      aha.fetchWeb({url:'http://www.baidu.com', success: function(result) {
        aha.debug(result)
      }})
    },
    
    onGetLocation: function() {
      aha.getLocation({success: function(result) {
        aha.debug(result)
      }})
    },
    
    onCallApi: function() {
      aha.callApi({
        method: 'GET',
        action: '/global/Select/listItemFromCache',
        params: {"titleids":[1,2,3]},
        options: {},
        success: function(obj) {
          alert(JSON.stringify(obj));
        }
      })

      // aha.callApi({
      //   path: 'album',
      //   method: 'GET',
      //   params: {id: '000000004dedb717014df689322f0003'},
      //   success: function(result) {
      //     aha.debug(result)
      //   }
      // })
    },
    
    onShareWechatTimeline: function() {
      aha.share({
        name: 'wechat_timeline',
        title: '优雅的生活方式',
        desc: '优雅是一种生活方式，人生并不长久，我愿到老都拥有这种气息',
        image: 'http://dev.res.ahasou.com/image/0/ff/66/396693250caa53fb97073d51a248.png',
        url: 'http://dev.ahasou.com/album.html?id=4028b8814e29fd4d014e29fe3d620236',
        albumId: '4028b8814e29fd4d014e29fe3d620236'
      })
    },
    
    onShareSinaWeibo: function() {
      aha.share({
        name: 'sinaweibo',
        title: '优雅的生活方式',
        desc: '优雅是一种生活方式，人生并不长久，我愿到老都拥有这种气息',
        image: 'http://dev.res.ahasou.com/image/0/ff/66/396693250caa53fb97073d51a248.png',
        url: 'http://dev.ahasou.com/album.html?id=4028b8814e29fd4d014e29fe3d620236',
        albumId: '4028b8814e29fd4d014e29fe3d620236'
      })
    },
    
    onShare: function() {
      aha.share({
        // name: '',
        title: '优雅的生活方式',
        desc: '优雅是一种生活方式，人生并不长久，我愿到老都拥有这种气息',
        image: 'http://dev.res.ahasou.com/image/0/ff/66/396693250caa53fb97073d51a248.png',
        url: 'http://dev.ahasou.com/album.html?id=4028b8814e29fd4d014e29fe3d620236',
        albumId: '4028b8814e29fd4d014e29fe3d620236'
      })
    },
    
    onShareNoAlbumId: function() {
      aha.share({
        // name: '',
        title: '优雅的生活方式',
        desc: '优雅是一种生活方式，人生并不长久，我愿到老都拥有这种气息',
        image: 'http://dev.res.ahasou.com/image/0/ff/66/396693250caa53fb97073d51a248.png',
        url: 'http://dev.ahasou.com/album.html?id=4028b8814e29fd4d014e29fe3d620236'
      })
    },
    
    
    print: function(label, value) {
      var text = '_N/A_'
      if (v.defined(value)) {
        text = value === null ? '_NULL_' : value
      }
      this.append({
        classes: 'field',
        components: [
          {tag: 'label', text: label + ':'},
          {tag: 'span', text: text}
        ]
      })
    }
  }
  
});
