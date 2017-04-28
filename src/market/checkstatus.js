"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-check",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-check');
      var userType;
      var checkFlag = $.cookie.get(md5(app.session.openid + app.id + 'check-flag'));
      if(checkFlag && checkFlag == 1) {
        //审核通过
        Page.open('./card.html',{},true);
      } else {
        //通过接口获取用户是否注册、状态
        api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}).then(function(response){ var msg = response.data;
          if(msg.agent || msg.saler) {
            var obj = (msg.agent ? msg.agent : msg.saler);
            userType = (msg.agent ? 1: 2);
            //0 审核中 1审核通过 2审核失败
            var state = obj.state;
            if(state == 1) {
              if($.defined(obj.workstate) && obj.workstate == 0) {
                $.cookie.set(md5(app.session.openid + app.id + 'check-flag'), null, 1 * 60 * 60);
                v.ui.alert('用户已离职');
              }else{
                $.cookie.set(md5(app.session.openid + app.id + 'check-flag'), 1, 1 * 60 * 60);
                Page.open('./card.html',{},true);
              }
            }else{
              $.createElements({
                classes: 'infopannel',
                components: [{
                  classes: 'checkstatus ' + (state == 0 ? 'sh' : 'sb'),
                  components: [{
                    tag: 'img',
                    src: (state == 0 ? 'images/check_sh.png' : 'images/check_sb.png'),
                  },{
                    text: (state == 0 ? '待审核' : '审核失败')
                  }]
                },{
                  classes: 'content',
                  html: '您申请的 <span>'+(obj.pathname ? obj.pathname : '')+' '+(obj.positionname ? obj.positionname : '')+' </span>'+(state == 0 ? '正在审核中' : '审核未通过')
                },{
                  onSingleTap: function() {
                    api.request.get({
                      obj: {
                        id: obj.id
                      }
                    }, {action: (userType == 1 ? '/hfz/HfzChannelManageAction/delManager' : '/hfz/HfzSalerProjectAction/deleteSaler')}).then(function(response){ var msg = response.data;
                      if(true){
                        $.cookie.set(md5(app.session.openid + app.id + 'check-flag'), null, 1 * 60 * 60);
                        location.reload();
                      }
                    });
                  },
                  classes: 'reset-btn',
                  html: '重新注册'
                }]
              }, '.vpage-content');
            }
          } else {
            //未注册
            $.createElements([{
              classes: 'header',
              components:[{
                classes: 'bg'
              }]
            },{
              classes: 'form-table-view',
              components: [{
                classes: 'input-area hasactive',
                onSingleTap: function() {
                  Page.open('./register.html?type=agent',{},true);
                },
                components: [{
                  tag: 'label',
                  classes: 'l1'
                },{
                  classes: 'text-value',
                  text: '经纪人注册'
                }]
              },{
                classes: 'input-area hasactive',
                onSingleTap: function() {
                  Page.open('./register.html?type=saler',{},true);
                },
                components: [{
                  tag: 'label',
                  classes: 'l2'
                },{
                  classes: 'text-value',
                  text: '案场注册'
                }]
              }]
            }],'.vpage-content');
          }
        });
      }
    }
    
  }
})