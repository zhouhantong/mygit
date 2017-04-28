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
      var lastindex = 1;
      var companyData;
      var sdhuser = {};
    
      var type = query.type ? query.type : '';
    
      api.request.get("/sdh/user/UserAction/getUserInfo", {
        obj: {
          openid: app.session.openid
        }
      }).then(function(response){ var msg = response.data;
        if(true){
          sdhuser = msg || {};
          page.find("#mname").val(sdhuser.name);
          page.find("#telnum").val(sdhuser.mobile);
        }
      });
    
      if(type == 'agent') {
        page.find('.txt').text('经纪人注册');
        page.find('.select-company-1').removeClass('hide');
        createSelectCompany('0', 1);
        page.find('.type-position > select').attr('disabled','disabled');
      }else {
        page.find('.txt').text('案场注册');
        createSalerPostion();
      }
      // 设置职位
      function createSalerPostion() {
        var data = [{id:'',name:''},{id:'1',name:'项目经理'},{id:'3',name:'项目助理'},{id:'4',name:'案场顾问'}];
        $.createElements(data.map(function(item,index) {
          return {
            tag: 'option',
            value: item.id,
            text: item.name
          };
        }), '.type-position > select');
      }
      function createAgentPostion(type) {
        api.request.get("/hfz/HfzChannelManageAction/listCompanyPosition", {
          obj: {
            type: type
          }
        }).then(function(response){ var msg = response.data;
          if (true) {
            if(msg.total) {
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
              }), '.type-position > select');
            }
          }
        });
      }
    
      page.find('select').on('change', function() {
        $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
        var index = $(this).parent().find('div.text-value').data('index');
        if(index) {
          var v = this.value;
          resetSelect(index);
          if(index == 1) {
            //设置职位
            page.find('.type-position >  select')[0].innerHTML = '';
            page.find('.type-position .text-value').html('');
            if(v) {
              page.find('.type-position > select').removeAttr('disabled');
            } else {
              page.find('.type-position > select').attr('disabled','disabled');
            }
            companyData.forEach(function(item,index){
              if(item.id == v) {
                createAgentPostion(item.type);
              }
            });
          }
          if(v) {
            createSelectCompany(v,++index);
          }
        }
      });
    
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
    
      //设置公司下拉框
      function createSelectCompany(preid,index) {
        if(index <= 4) {
          page.find('.select-company-'+index+' >  select')[0].innerHTML = '';
          page.find('.select-company-'+index+' .text-value').html('');
        }
        api.request.get("/hfz/HfzCompanyManageAction/layerCompany", {
          obj: {
            preid: preid
          }
        }).then(function(response){ var msg = response.data;
          if (true) {
            if(msg.list && msg.list.length) {
              if(preid == '0') {
                companyData = msg.list;
              }
              page.find('.select-company-'+index).removeClass('hide');
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
              }), '.select-company-'+index+' > select');
            }
          }
        });
      }
    
      //重置公司和门店下拉框
      function resetSelect(index) {
        ++index;
        for(var i = index; i <= 4 ; i++) {
          page.find('.select-company-'+i).addClass('hide');
          page.find('.select-company-'+i+' >  select')[0].innerHTML = '';
          page.find('.select-company-'+i+' .text-value').html('');
        }
      }
    
      // 提交申请
      page.find('.next-button').singleTap(function() {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
        var vericode = $('#vericode').val();
        var c1 = page.find('.select-company-1 >  select')[0].value;
        var c2 = page.find('.select-company-2 >  select')[0].value;
        var c3 = page.find('.select-company-3 >  select')[0].value;
        var c4 = page.find('.select-company-4 >  select')[0].value;
        var position = page.find('.type-position select')[0].value;
        var memo = $('#memo').val();
    
        if(!name || !mobile || !position) {
          return v.ui.alert('姓名、电话、职位为必填项');
        }
        if(!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        if (!vericode) {
          return v.ui.alert('请输入短信验证码');
        }
        if(type == 'agent' && !c1 && !c2 && !c3 && !c4) {
          return v.ui.alert('请选择公司');
        }
    
        session.vericode = vericode;
        var parames = {
          obj:{
            name: name,
            mobile: mobile,
            remark: memo,
            position: parseInt(position)
          }
        };
        if(type == 'agent') {
          var path = '';
          var companyid = '';
          if(c1) {
            path = c1;
            companyid = c1;
          }
          if(c2) {
            path += ',' + c2;
            companyid = c2;
          }
          if(c3) {
            path += ',' + c3;
            companyid = c3;
          }
          if(c4) {
            path += ',' + c4;
            companyid = c4;
          }
          $.mixin(parames.obj,{path: path,companyid: companyid},true);
        }
    
        api.request.get(parames, {action: (type == 'agent' ? '/hfz/HfzMemberManageAction/agentRegister' : '/hfz/HfzSalerProjectAction/addSaler')}).then(function(response){ var msg = response.data;
          if(true){
            Page.open('./checkstatus.html');
          }
        });
      });
    }
    
  }
})