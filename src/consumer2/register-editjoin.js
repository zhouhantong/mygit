"use strict";
Page.ready(function ($, query) {

  var ival;

  return {
    name: 'register-editjoin',

    options: {
      // menu: true
      // pagingEnabled: true
    },

    onRender: function () {
      var self = this
      var params = self.params
      Page.setTitle(self.params.teamuuid ? '添加店员' : '修改资料')

      if(self.params.teamuuid) {
        api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function (response) {
          self.userObj = response.data
          if(self.userObj.teammember) {
            v.ui.alert('您已是店长或已加入微店').then(function(){
              Page.open('./myhome.html')
            })
          } else if(self.userObj.agent) {
            if(self.userObj.agent.state == 1) {
              api.request.get("/hfz/HfzTeamManageAction/joinTeam", {
                obj: {
                  teamuuid: self.params.teamuuid
                }
              }).then(function(response){ 
                v.ui.alert('加入微店成功').then(function(){
                  Page.open('./myhome.html')
                })
              })              
            } else {
              v.ui.alert('您申请的经纪人状态未审核通过，暂不能加入微店').then(function(){
                Page.open('./myhome.html')
              })
            }
          } else {
            self.tpl('form-layer', {name: '', mobile: ''} , self.find('.vpage-content'))
            self.tpl('reg-layer',{
              btntxt: (self.params.teamuuid ? '提交' : '确认修改')
            }, self.find('.vpage-content'))
          }
        })
      } else {      
        self.tpl('form-layer', self.params.userinfo , self.find('.vpage-content'))
        self.tpl('reg-layer',{
          btntxt: (self.params.teamuuid ? '提交' : '确认修改')
        }, self.find('.vpage-content'))
      }

    },

    onInput: function () {
      var mobile = $('#telnum').val();
      if(mobile){
        clearInterval(ival)
        this.find('.btn-vericode').removeClass('disabled')
        this.find('.btn-vericode').html('获取验证码')
      }
    },

    getVericode: function() {
      var self = this
      if(self.find('.btn-vericode').hasClass('disabled')) {
        return
      }
      var count = 60
      var mobile = $('#telnum').val()
      if(Fn.isMobile(mobile)) {
          self.find('.btn-vericode').addClass('disabled')
          ival = window.setInterval(function () {
            self.find('.btn-vericode').html(count + '秒后重新获取')
            if (count <= 0) {
              count = 59
              clearInterval(ival)
              self.find('.btn-vericode').removeClass('disabled')
              self.find('.btn-vericode').html('获取验证码')
            } else {
              count--
            }
          }, 1000)
          api.request.get("/global/App/getHfzVericode", {
            mobile: mobile
          }).then(function(response){ 
            v.ui.alert('验证码已通过短信发送到您的手机，稍等一会儿哦')
          })
      } else if (mobile) {
        v.ui.alert('请输入正确的手机号码')
      } else {
        v.ui.alert('请输入您的手机号码')
      }
    },

    register: function() {
      var self = this
      var name = self.find('#mname').val()
      var mobile = self.find('#telnum').val()
      var vericode = self.find('#vericode').val()
      
      if(!name) {
        return v.ui.alert('请输入姓名');
      }
      if(name.length>16){
        return v.ui.alert('输入姓名过长');
      }
      if(!mobile) {
        return v.ui.alert('请输入手机号');
      }
      if(!vericode) {
        return v.ui.alert('请输入验证码');
      }      
      if (!Fn.isMobile(mobile)) {
        return v.ui.alert('请输入正确的手机号码');
      }

      app.session.vericode = vericode
      var params = {
        name: name,
        mobile: mobile
      }
      if(self.params.teamuuid) {
        params.toteamuuid = self.params.teamuuid
        params.type = 3
        self.action ='/hfz/HfzChannelManageAction/addAgent'
        self.backurl = '../market/wd-memberhome.html'
      }else {
        self.action ='/hfz/HfzChannelManageAction/updAgentInfo'
        self.backurl = './myhome.html'
      }
      api.request.get(self.action, {
        obj: params
      }).then(function (response) {
        v.ui.alert('提交成功').then(function(){
          if(self.params.teamuuid){
            Page.open(self.backurl, {}, true);
          }else{
            Page.back();
          }
        })
      }).catch(e=>v.ui.alert(e.response.errmsg));
    }
  }
})