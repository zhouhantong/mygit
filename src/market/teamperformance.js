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
      var mode;
    
      // var data = {
      //   total: 2320000,
      //   qy: 10,
      //   df: 20,
      //   tj: 30,
      //   time: '2015.08.01-08.21',
      // };
      api.request.get("/hfz/HfzChannelManageAction/getCompanyPerformance", {
        obj:{
          mode: 'month'
        }
      }).then(function(response){ var msg = response.data;
        if(true){
    
      $.createElements([{
        classes: 'infopannel i2',
        components: [{
          classes: 'header',
          text: '月报表',
          // components: [{
          //   text: data.time
          // }]
        },{
          classes: 'info-box',
          components: [{
            text: '佣金总金额'
          },{
            text: '¥' + (msg.brokerage ? msg.brokerage : 0)
          }]
        },{
          classes: 'info-box',
          components: [{
            text: '总签约人数'
          },{
            text: (msg.dealcnt ? msg.dealcnt : 0) + '组'
          }]
        },{
          classes: 'info-box',
          components: [{
            text: '总到访人数'
          },{
            text: (msg.visitcnt ? msg.visitcnt : 0)+ '组'
          }]
        },{
          classes: 'info-box',
          components: [{
            text: '总推荐人数'
          },{
            text: (msg.customercnt ? msg.customercnt : 0) + '组'
          }]
        }]
      }], '.datapannel');
        }
      });
    
      //设置项目下拉框
      api.request.get("/hfz/HfzChannelManageAction/listProjectForCombo", {
        obj: {
          agentid: 1,
          mode: 'agent'
        }
      }).then(function(response){ var msg = response.data;
        if (true) {
          if(msg) {
            msg.list.unshift({
              Id: '',
              projectname: ''
            });
            $.createElements(msg.list.map(function(item,index) {
              return {
                tag: 'option',
                value: item.Id,
                text: item.projectname
              };
            }), '.type-project > select');
          }
        }
      });
    
      //搜索
      page.find('.next-button').singleTap(function() {
        var begintime = $('#begintime').val();
        var endtime = $('#endtime').val();
        var project = page.find('.type-project select')[0].value;
        // if(!begintime || !endtime) {
        //   return v.ui.alert('请选择开始时间和结束时间');
        // }
        //调用接口查询
      api.request.get("/hfz/HfzChannelManageAction/getCompanyPerformance", {
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
          classes: 'info-box ',
          // + (msg.dealcnt > 0 ? 'hasafter' : ''),
          onSingleTap: function() {
            if(msg.dealcnt > 0) {
              Page.open('./cus-list.html?type=4&begintime='+begintime+'&endtime='+endtime+'&project='+project)
            }
          },
          components: [{
            text: '签约人数'
          },{
            text: (msg.dealcnt ? msg.dealcnt : 0) + '组'
          }]
        },{
          classes: 'info-box ' ,
          //+ (data.df > 0 ? 'hasafter' : ''),
          onSingleTap: function() {
            if(msg.visitcnt > 0) {
              Page.open('./cus-list.html?type=5&begintime='+begintime+'&endtime='+endtime+'&project='+project)
            }
          },
          components: [{
            text: '到访人数'
          },{
            text: (msg.visitcnt ? msg.visitcnt : 0)+ '组'
          }]
        },{
          classes: 'info-box ',
          //+ (data.tj > 0 ? 'hasafter' : ''),
          onSingleTap: function() {
            if(msg.customercnt > 0) {
              Page.open('./cus-list.html?type=6&begintime='+begintime+'&endtime='+endtime+'&project='+project)
            }
          },
          components: [{
            text: '推荐人数'
          },{
            text: (msg.customercnt ? msg.customercnt : 0) + '组'
          }]
        }], searchEl);
        }
      });
    
      });
    
      page.find('select').on('change', function() {
        $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
      });
    }
    
  }
})