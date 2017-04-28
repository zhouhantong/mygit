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
      var lastindex = 1;
      var companyData;
    
      page.find('.select-company-1').removeClass('hide');
      createSelectCompany('0', 1);
    
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
        var c1 = page.find('.select-company-1 >  select')[0].value;
        var c2 = page.find('.select-company-2 >  select')[0].value;
        var c3 = page.find('.select-company-3 >  select')[0].value;
        var c4 = page.find('.select-company-4 >  select')[0].value;
    
        if(!c1 && !c2 && !c3 && !c4) {
          return v.ui.alert('请选择公司');
        }
    
        var companyid = '';
        if(c1) {
          companyid = c1;
        }
        if(c2) {
          companyid = c2;
        }
        if(c3) {
          companyid = c3;
        }
        if(c4) {
          companyid = c4;
        }
    
        api.request.get("/hfz/HfzChannelManageAction/updateAgentCompany", {
          obj: {
            companyid: companyid
          }
        }).then(function(response){ var msg = response.data;
          if(true){
            Page.open('./card.html');
          }
        });
      });
    }
    
  }
})