"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-recommend",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-recommend');
      var projectid = parseInt(query.projectid);
      var type = parseInt(query.type);
    
      page.find('.common-topheader').text(type == 1 ? '报备客户' : '添加客户');
    
      page.find('select').on('change', function() {
        $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
      });
    
      //一键报备
      var info = (query.info ? JSON.parse(query.info) : '');
      if(info) {
        page.find('#mname').val(info.name);
        page.find('#telnum').val(info.mobile);
        $.storage.set(app.session.openid + app.id + 'recommend-data','');
      }
    
      //缓存
      initCache();
      function initCache() {
        var data = $.storage.get(app.session.openid + app.id + 'recommend-data');
        if(data) {
          var json = JSON.parse(data);
          $('#mname').val(json.name);
          $('#telnum').val(json.mobile);
          // checkMobile();
        }
      }
    
      // 提交申请
      page.find('.next-button').singleTap(function() {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
    
        if(!name || !mobile) {
          return v.ui.alert('姓名、电话为必填项');
        }
        if(!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        var parames = {
          obj:{
            name: name,
            mobile: mobile,
            // type: (type == 1 ? 1 : (type == 2 ? 3 : '')),
            projectid: projectid,
            agentopenid: app.session.openid
          }
        };
        if(type == 2) {
          //置业顾问添加客户
          api.request.get("/hfz/HfzChannelManageAction/getCustomer", {
            obj: {
              mobile: mobile,
              projectid: projectid
            }
          }).then(function(response){ var msg = response.data;
            if (true) {
              if(msg) {
                //存在
                if(msg.salerid) {
                  //已绑定
                  v.ui.alert('该客户已被案场工作人员接待');
                }else{
                  //未绑定
                  api.request.get("/hfz/HfzCustomerAction/bindCustomer", {
                    obj: {
                      id: msg.id
                    }
                  }).then(function(response){ var msg = response.data;
                    if (true) {
                      $.storage.set(app.session.openid + app.id + 'recommend-data','');
                      alert('添加客户成功');
                      location.reload();
                    }
                  });
                }
              } else {
                //不存在
                addUser(parames);
              }
            }
          });
        }else {
          //经纪人报备客户
          addUser(parames);
        }
      });
    
      function addUser(parames) {
        api.request.get("/hfz/HfzAppointmentAction/addPreferentialReport", parames).then(function(response){ var msg = response.data;
          if(true){
            $.storage.set(app.session.openid + app.id + 'recommend-data','');
            if(msg <= 0){
              alert(type == 1 ? '报备客户失败' : '添加客户失败');
            }else{
              alert(type == 1 ? '报备客户成功' : '添加客户成功');
            }
            if(info) {
              history.go(-1);
            }else{
              location.reload();
            }
          }
        });
      }
    
      page.find('.chgbtn').singleTap(function(){
        var obj = {
          name: $('#mname').val(),
          mobile: $('#telnum').val(),
        };
        $.storage.set(app.session.openid + app.id + 'recommend-data',JSON.stringify(obj));
        //通讯录
        Page.open('./contacts.html',{
          projectid: projectid,
          type: type
        },false);
      });
    
      //手机号码检测
      // page.find('.input-area > input').on('blur',function(){
      //   checkMobile();
      // });
      // function checkMobile() {
      //   var mobile = $('#telnum').val();
      //   if(mobile) {
      //     api.request.get("/hfz/HfzChannelManageAction/getCustomer", {
      //       obj: {
      //         mobile: mobile,
      //         projectid: projectid
      //       }
      //     }).then(function(response){ var msg = response.data;
      //       if (true) {
    
      //       }
      //     });
      //   }
      // }
    }
    
  }
})