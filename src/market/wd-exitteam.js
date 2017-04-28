"use strict";
Page.ready(function ($, query) {

  return {
    name: 'wd-exitteam',

    options: {
    },

    onRender: function () {
      var self = this
      
      var v = Math.floor(Math.random() * 1000000);
      var ycode = app.API_URL + '?j=' + JSON.stringify({
                  openid: app.session.openid || '',
                  passport: app.session.passport || '',
                  vericode: app.session.vericode || '',
                  url: location.href,
                  action: '/ad/AdAction/getValidateCode',
                  requestParam: {}
              }) + '&v=' + v

      self.tpl("header-layer",{
        ycode: ycode
      },self.find('.vpage-content'))

    },

    exitteam: function() {
      var self = this
      var code = self.find('input').val();
      if(!code){
        return v.ui.alert('请输入验证码')
      }

      api.request.get('/hfz/HfzTeamManageAction/quitTeam',{
        obj: {
          graphiccode: code
        },
      },{quiet: true}).then(function(result){
        v.ui.alert('您已退出微店').then(function() {
          Page.open('../consumer2/myhome.html')
        })
      })   
    }

  }
})