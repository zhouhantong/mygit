"use strict";
Page.ready(function ($, query) {

  return {
    name: 'kpi-index',

    options: {
      menu: true,
      wxSharable: false,
      sharable: true
      // pagingEnabled: true
    },

    onRender: function () {
      var self = this

      Promise.all([
        api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}),
        api.request.get('/hfz/KpiAction/getUserData', {}),
        api.request.get('/global/Select/listItemFromCache',{titleids:[18000]})
      ]).then(function(datas){
        self.userObj = datas[0].data || {}
        self.dataObj = datas[1].data || {}
        self.shareObj = datas[2].data || {}
        if(self.userObj.agent && self.userObj.agent.state == 1 && self.userObj.agent.type == 1) {
          self.tpl('info-layer',self.dataObj, self.find('.info-layer'))
          self.tpl('function-layer',self.dataObj, self.find('.function-layer'))
          
          self.shareJson = JSON.parse(self.shareObj[18000][0].itemtext)
          self.shareUrl = location.protocol + '//' + location.host + '/consumer2/blank.html'
          app.wechat.SHARE_TITLE = self.shareJson[0].share_title
          app.wechat.SHARE_DESC = self.shareJson[0].share_desc
          app.wechat.SHARE_TIMELINE_TITLE = self.shareJson[0].timeline_title
          app.wechat.SHARE_LINK = self.shareUrl
          app.wechat.SHARE_IMG_URL = location.protocol + '//' + location.host + self.shareJson[0].share_img_url
          api.request.get('/global/Qrcode/getQRCodeByKey', {
            // obj: location.protocol + '//' + location.host + '/share.jsp' + '?t=share&preid='+app.session.openid+'&appid='+app.session.appid+'&url='+encodeURIComponent(self.shareUrl)+'&scene=1'
            obj: v.env.wechat ? Fn.getWechatLink(self.shareUrl) : self.shareUrl
          }).then(function(response){
            self.qrcodeUrl = response.data
          })

          app.wechat.SHARE_CALLBACK_OK = function(type){
            $('.home-share-note').addClass('hide')
          }

          wechat.init();

        } else {
          v.ui.alert('您没有注册经纪人或不是中原员工').then(function(){
            Page.open('./myhome.html')
          });
        }
      })

    },

    link: function() {
      v.$({
        classes: 'home-share-note',
        onSingleTap: function() {
          $(this).remove()
        },
        components: [{
          classes: 'home-share-arrow'
        }]
      }, document.body);      
    },

    openQrcode: function() {
      self = this
      v.$({
        classes: 'popup-qrcode',
        onSingleTap: function() {
          $(this).remove()
        },
        components: [{
          classes: 'qrcode-layer',
          components: [{
            classes: 'logo'
          },{
            tag: 'img',
            src: self.qrcodeUrl
          },{
            text: self.dataObj.name
          }]
        }]
      }, document.body);       
    }

  }
})