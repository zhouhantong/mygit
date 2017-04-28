"use strict";
Page.ready(function ($, query) {

  return {
    name: 'wd-teamshare',

    options: {
      wxSharable: false,
      sharable: true
      // pagingEnabled: true
    },

    onRender: function () {
      var self = this

      api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function (response) {
        self.userObj = response.data
        if(!self.userObj.team) {
          v.ui.alert('您还没有开通微店').then(function(){
            Page.open('../consumer2/myhome.html')
          });
        }

        var shareUrl = 'http://' + Fn.getHostName() + '/consumer2/register-editjoin.html?teamuuid=' + self.userObj.team.teamuuid


        app.wechat.SHARE_TITLE = '欢迎加入我的好房子微店！'
        app.wechat.SHARE_DESC = '欢迎加入我的好房子微店！'
        app.wechat.SHARE_TIMELINE_TITLE = '欢迎加入我的好房子微店！'
        app.wechat.SHARE_LINK = shareUrl

        self.tpl('common-home-icon', {}, self.find('.vpage-content'))

        self.tpl('share-layer', {qrcodesrc: shareUrl}, self.find('.vpage-content'))

        app.wechat.SHARE_CALLBACK_OK = function(type){
          $('.home-share-note').addClass('hide')
        }

        wechat.init();

      })
    },

    share: function() {
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

  }
})