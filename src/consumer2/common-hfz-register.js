"use strict";
Page.ready(function($, query) {
  
  return {

    name: "register-hfz",
    
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-register-hfz');
      var count=59;
      var id = parseInt(query.id);
    
      //检查是否注册
      api.request.get("/hfz/HfzSpecialAction/getSpecialAndAgent", {
        obj: {
          id: id,
          agentOpenid: app.session.openid
        }
      }).then(function(response){ var msg = response.data;
        if(true) {
          if(msg.agent && msg.agent.state == 1) {
            //已注册
            Page.open('./common-hfz-list.html');
          }else{
            page.find('.header-bar').text(msg.special.projectname ? msg.special.projectname : '');
          }
        }
      });
    
      // 发送验证码 按钮
      page.find('.btn-vericode').singleTap(function() {
        if(page.find('.btn-vericode').hasClass('disabled')) {
          return;
        }
        var mobile = $('#telnum').val();
        if (Fn.isMobile(mobile)) {
    
          page.find('.btn-vericode').addClass('disabled');
          var ival = window.setInterval(function(){
            page.find('.btn-vericode').html(count+'秒后重新获取');
            if(count <= 0) {
              count = 59;
              clearInterval(ival);
              page.find('.btn-vericode').removeClass('disabled');
              page.find('.btn-vericode').html('免费获取验证码');
            }else {
              count--;
            }
          },1000);
    
          api.request.get("/global/App/getHfzVericode", {
            mobile: mobile
          }).then(function(response){ var msg = response.data;
            v.ui.alert(code === 0 ? '验证码已通过短信发送到您的手机，稍等一会儿哦' : msg);
          });
        } else if (mobile) {
          v.ui.alert('请输入正确的手机号码');
        } else {
          v.ui.alert('请输入您的手机号码');
        }
      });
    
      // 提交申请
      page.find('.sbtn-next').singleTap(function() {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
        var vericode = $('#vericode').val();
        if(!name || !mobile) {
          return v.ui.alert('所有项均为必填项');
        }
        if(!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        if (!vericode) {
          return v.ui.alert('请输入短信验证码');
        }
        var parames = {
          obj:{
            name: name,
            mobile: mobile,
            specialid: id
          }
        };
    
        app.session.vericode = vericode;
    
        api.request.get("/hfz/HfzCqblAction/agentRegister", parames).then(function(response){ var msg = response.data;
          if(true){
            alert('注册成功');
            Page.open('./common-hfz-list.html');
          }
        });
      });
    }
    
  }
})