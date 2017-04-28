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
    
      var companyid;
      var ids = $.storage.get(app.session.openid + app.id + 'user-select');
    
      //设置公司
      api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}).then(function(response){ var msg = response.data;
        if(code == 0 && (msg.agent || msg.saler)) {
          var obj = (msg.agent ? msg.agent : msg.saler);
          page.find('.select-company-1').removeClass('hide');
          companyid = obj.companyid;
          createSelectCompany(companyid, 1);
        }
      });
      //设置职位
      createPostion();
      function createPostion() {
        api.request.get("/hfz/HfzChannelManageAction/listPositionForTransfer", {}).then(function(response){ var msg = response.data;
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
          if(v) {
            createSelectCompany(v,++index);
          }
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
        var c1 = page.find('.select-company-1 >  select')[0].value;
        var c2 = page.find('.select-company-2 >  select')[0].value;
        var c3 = page.find('.select-company-3 >  select')[0].value;
        var c4 = page.find('.select-company-4 >  select')[0].value;
        var position = page.find('.type-position select')[0].value;
    
        if(!c1 && !c2 && !c3 && !c4 && !position) {
          return v.ui.alert('公司和职位至少选择一项');
        }
    
        var parames = {
          obj:{
            ids: ids
          }
        };
    
        if(position) {
          $.mixin(parames.obj,{position: parseInt(position)},true);
        }
    
        var cid = '';
        if(c1) {
          cid = c1;
        }
        if(c2) {
          cid = c2;
        }
        if(c3) {
          cid = c3;
        }
        if(c4) {
          cid = c4;
        }
        if(cid) {
          $.mixin(parames.obj,{companyid: cid},true);
        }
    
        api.request.get("/hfz/HfzChannelManageAction/jobTransfer", parames).then(function(response){ var msg = response.data;
          if(true){
            alert('修改成功');
            Page.open('./card.html');
          }
        });
      });
    }
    
  }
})