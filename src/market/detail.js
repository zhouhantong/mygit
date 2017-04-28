"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-detail",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-detail');
      var listEl = page.find('.list');
      var id = query.id
    
      //客户信息
      api.request.get({
        obj: {
          id: id
        }
      }, {action: (query.expire ? '/hfz/HfzChannelManageAction/getExpireCustomer' : '/hfz/HfzChannelManageAction/getCustomer')}).then(function(response){ var msg = response.data;
        if(true) {
          var isAgentCus = (msg.type == 1 && msg.agentname && msg.agentopenid != app.session.openid);
          $.createElements([{
            classes: 'info-box',
            components: [{
              classes: 'username',
              text: msg.name,
              components: [{
                tag: 'span',
                classes: (isAgentCus ? '' : 'hide'),
                text: msg.agentname
              }]
            }]
          },{
            classes: 'info-box',
            components: [{
              text: '电话'
            },{
              classes: 'mobile',
              onSingleTap: function() {
                location.href = 'tel:' + msg.mobile;
                return;
              },
              text: msg.mobile
            }]
          },{
            classes: 'info-box',
            components: [{
              text: '项目名称'
            },{
              text: msg.projectName
            }]
          },{
            classes: 'info-box',
            components: [{
              text: '当前状态'
            },{
              text: msg.statename
            }]
          // },{
          //   classes: 'info-box ' + (msg.intentionprice ? '' : 'hide'),
          //   components: [{
          //     text: '意向总价(元)'
          //   },{
          //     text: msg.intentionprice
          //   }]
          // },{
          //   classes: 'info-box ' + (msg.intentionarea ? '' : 'hide'),
          //   components: [{
          //     text: '意向面积(m²)'
          //   },{
          //     text: msg.intentionarea
          //   }]
          // },{
          //   classes: 'info-box ' + (msg.intentionhouse ? '' : 'hide'),
          //   components: [{
          //     text: '意向户型'
          //   },{
          //     text: msg.intentionhouse
          //   }]
          }, (msg.houses && msg.houses.length) ? {
            classes: 'house-box',
            text: '房源信息',
            components: msg.houses.map(function(item){
              return {
                classes: 'house-block',
                components: [{
                  classes: 'house-info',
                  components: [{
                    text: '成交编号：' + (item.dealno ? item.dealno : '')
                  },{
                    text: '合同编号：' + (item.contractno ? item.contractno : '')
                  }]
                },{
                  classes: 'house-info',
                  components: [{
                    text: '房源信息：' + (item.roomno ? item.roomno : '')
                  },{
                    text: '身份证号：' + (item.idnumber ? item.idnumber : '')
                  }]
                },{
                  classes: 'house-info',
                  components: [{
                    text: '物业类型：' + (item.propertytype ? item.propertytype : '')
                  },{
                    text: '客户职业：' + (item.occupation ? item.occupation : '')
                  }]
                },{
                  classes: 'house-info',
                  components: [{
                    text: '认购时间：' + (item.subscribetime ? Fn.getTime(item.subscribetime) : '')
                  },{
                    text: '签约时间：' + (item.dealtime ? Fn.getTime(item.dealtime) : '')
                  }]
                },{
                  classes: 'house-info',
                  components: [{
                    text: '全款到账：' + (item.paidtime ? Fn.getTime(item.paidtime) : '')
                  },{
                    text: '房源状态：' + (item.state >= 0 ? app.COMMON_AWARD_TYPES[item.state] : '')
                  }]
                },{
                  classes: 'house-info',
                  components: [{
                    text: '结佣状态：' + item.brokeragestatename
                  },{
                    text: '佣金总额：' + (item.brokerage ? item.brokerage : '')
                  }]
                },{
                  classes: 'house-info hh2',
                  components: [{
                    text: '现居住地：' + (item.currentaddress ? item.currentaddress : '')
                  }]
                // },{
                //   classes: 'house-btn',
                //   text: '查看佣金明细'
                }]
              }
            })
          } : $.nop ,{
            classes: 'info-box ' + (isAgentCus ? '' : 'hide'),
            components: [{
              text: '经纪人电话'
            },{
              classes: 'mobile',
              onSingleTap: function() {
                location.href = 'tel:' + msg.agentmobile;
                return;
              },
              text: (msg.agentmobile ? msg.agentmobile : '')
            }]
          },{
            classes: 'info-box ' + (isAgentCus ? '' : 'hide'),
            components: [{
              text: '经纪人所属公司'
            },{
              text: (msg.companyname ? msg.companyname : '')
            }]
          }], '.infopannel');
          //客户记录
          getCustomerLog();
        }
      });
    
      function getCustomerLog() {
        api.request.get("/hfz/HfzChannelManageAction/listCustomerChg", {
          obj:{
            offset: 0,
            size: 100,
            id: id
          }
        }).then(function(response){ var msg = response.data;
          page.find('.listpannel').removeClass('hide');
          if(true) {
            if(msg.total  == 0) {
              $.createElements({
                classes: 'nodata-item',
                text: '暂无记录'
              }, listEl)
            }else {
              msg.list.forEach(function(obj) {
                $.createElements({
                  classes: 'info-box',
                  components: [{
                    text: Fn.getFullTime(obj.changetime)
                  },{
                    text: obj.statename
                  }]
                }, listEl)
              })
            }
          }
        });
      }
    }
    
  }
})