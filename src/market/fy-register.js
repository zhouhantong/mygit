"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-register",
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-register');
      var count = 59;
    
      //发送验证码 按钮
      page.find('.button-vericode').singleTap(function() {
        if(page.find('.button-vericode').hasClass('disabled')) {
          return;
        }
        var mobile = $('#telnum').val();
        if (Fn.isMobile(mobile)) {
    
          page.find('.button-vericode').addClass('disabled');
          var ival = window.setInterval(function(){
            page.find('.button-vericode').html(count+'秒后<br>重新获取');
            if(count <= 0) {
              count = 59;
              clearInterval(ival);
              page.find('.button-vericode').removeClass('disabled');
              page.find('.button-vericode').html('获取<br>验证码');
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
      page.find('.next-button').singleTap(function() {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
        var vericode = $('#vericode').val();
    
        if(!name || !mobile) {
          return v.ui.alert('姓名、电话为必填项');
        }
        if(!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        if (!vericode) {
          return v.ui.alert('请输入短信验证码');
        }
    
        app.session.vericode = vericode;
        var parames = {
          obj:{
            name: name,
            mobile: mobile
          }
        };
        api.request.get("/hfz/HfzAppointmentAction/registerOwner", parames).then(function(response){ var msg = response.data;
          if(true){
            alert('注册成功');
          }
        });
      });
    }
    
  }
})