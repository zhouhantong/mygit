"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-commission",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-commission');
      var searchEl = page.find('.search');
      var mode = 'month';
      api.request.get("/hfz/HfzChannelManageAction/getAgentPerformance", {
        obj:{
          mode: mode
        }
      }).then(function(response){ var msg = response.data;
        if(true){
          // var data = {
          //   m1: 120000,
          //   c1: 10,
          //   m2: 340000,
          //   c2: 32,
          // };
    
        $.createElements([{
          classes: 'infopannel',
          components: [{
            classes: 'header',
            text: '当月佣金'
          },{
            classes: 'info-box',
            components: [{
              text: '佣金金额'
            },{
              text: '¥' + (msg.brokerage ? msg.brokerage : 0)
            }]
          },{
            classes: 'info-box ' + (msg.cnt > 0 ? 'hasafter' : ''),
            onSingleTap: function() {
              if(msg.cnt > 0) {
                Page.open('./cus-list.html?type=1')
              }
            },
            components: [{
              text: '佣金单数'
            },{
              text: msg.cnt + '单'
            }]
          }]
        }],'.datapannel');
        }
      });
        // },{
        //   classes: 'infopannel',
      api.request.get("/hfz/HfzChannelManageAction/getAgentPerformance", {
        obj:{
    
        }
      }).then(function(response){ var msg = response.data;
        if(true){
          $.createElements([{
          classes: 'infopannel',
          components: [{
            classes: 'header',
            text: '总佣金'
          },{
            classes: 'info-box',
            components: [{
              text: '总佣金金额'
            },{
              text: '¥' + msg.brokerage
            }]
          },{
            classes: 'info-box ' + (msg.cnt > 0 ? 'hasafter' : ''),
            onSingleTap: function() {
              if(msg.cnt > 0) {
                Page.open('./cus-list.html?type=2')
              }
            },
            components: [{
              text: '总佣金单数'
            },{
              text: msg.cnt + '单'
            }]
          }]
        }], '.datapannel');
        }
      });
    
      page.find('.next-button').singleTap(function() {
        var begintime = $('#begintime').val();
        var endtime = $('#endtime').val();
        // if(!begintime || !endtime) {
        //   return v.ui.alert('请选择开始时间和结束时间');
        // }
        //调用接口查询
      api.request.get("/hfz/HfzChannelManageAction/getAgentPerformance", {
        obj:{
          starttime: begintime,
          endtime: endtime
        }
      }).then(function(response){ var msg = response.data;
        if(true){
    
        searchEl.empty();
    
        $.createElements([{
          classes: 'header',
          text: '统计结果'
        },{
          classes: 'info-box',
          components: [{
            text: '佣金金额'
          },{
            text: '¥' + (msg.brokerage ? msg.brokerage : 0)
          }]
        },{
          classes: 'info-box ' + (msg.cnt > 0 ? 'hasafter' : ''),
          onSingleTap: function() {
            if(msg.cnt > 0) {
              Page.open('./cus-list.html?type=3&begintime='+begintime+'&endtime='+endtime)
            }
          },
          components: [{
            text: '佣金单数'
          },{
            text: msg.cnt + '单'
          }]
        }], searchEl);
        }
      });
      });
    }
    
  }
})