"use strict";
Page.ready(function($, query) {
  
  return {
    
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-register');
    
      var depttype = query.depttype || 1;
      var selectdept = (depttype != 12);
      var defaultdept;
    
      api.request.get("/sdh/user/UserAction/getUserInfo", {
        obj: {
          openid: app.session.openid
        }
      }).then(function(response){ var msg = response.data;
        if(true){
          if(msg) {
            //已注册
            Page.open('./info.html', {depttype: depttype}, true);
          }
        }
      });
    
      var count = 59;
    
      //设置部门
      api.request.get("/sdh/SdhDeptAction/list", {
        obj: {
          depttype: depttype
        }
      }).then(function(response){ var msg = response.data;
        if(msg && msg.total > 0) {
    
          if(selectdept){
            msg.list.unshift({
              id: '',
              name: ''
            });
            $.createElements(msg.list.map(function(item,index) {
              return {
                tag: 'option',
                value: item.id,
                text: item.name
              };
            }), '#page-register .type-bm > select');
            page.find(".type-bm").removeClass("hide")
          }else{
            defaultdept = msg.list[0].id;
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
    
      page.find('select').on('change', function() {
        $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
      });
    
      page.find('.bottom-act').singleTap(function(){
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
        var vericode = $('#vericode').val();
        var dept = defaultdept || page.find('.type-bm select')[0].value;
        if(!name || !mobile || !dept) {
          return v.ui.alert('所有项均为必填项');
        }
        if(!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        if (!vericode) {
          return v.ui.alert('请输入短信验证码');
        }
        app.session.vericode = vericode;
        api.request.get("/sdh/user/UserAction/register", {
          obj:{
            name: name,
            mobile: mobile,
            deptid: parseInt(dept)
          }
        }).then(function(response){ var msg = response.data;
          if(true) {
            api.request.get("/sdh/user/UserAction/pending", {
              obj:{
                state: "0",
                openid: app.session.openid
              }
            }).then(function(response){ var msg = response.data;
              if(true) {
                // Page.open('./myhome.html');
                Page.open('./info.html', {depttype: depttype}, true);
              }
            });
          }
        });
      });
    }
    
  }
})