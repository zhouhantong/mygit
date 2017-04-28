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
    
      var json = (query.info ? JSON.parse(query.info) : '');
      page.find('.common-topheader').text(json.projectname);
    
      //搜索
      page.find('.next-button').singleTap(function() {
        var starttime = $('#starttime').val();
        var endtime = $('#endtime').val();
        // var project = page.find('.type-project select')[0].value;
        // if(!starttime || !endtime) {
        //   return v.ui.alert('请选择开始时间和结束时间');
        // }
        //调用接口查询
        var params = {
          obj: {
            projectid: json.projectid
          }
        };
        if(starttime) {
          params.obj.starttime = starttime
        }
        if(endtime) {
          params.obj.endtime = endtime
        }
        api.request.get("/hfz/HfzChannelManageAction/getPerformance", params).then(function(response){ var msg = response.data;
          if(true){
    
          searchEl.empty();
    
          $.createElements([{
            classes: 'header',
            text: '统计结果'
          },{
            classes: 'info-box ' + (json.type == 1 ? '' : 'hide'),
            components: [{
              text: '佣金金额'
            },{
              text: '¥' + (msg.brokerage ? msg.brokerage : 0)
            }]
          },{
            classes: 'info-box ' + (msg.dealcnt > 0 ? 'hasafter' : ''),
            onSingleTap: function() {
              if(msg.dealcnt > 0) {
                Page.open('./clist.html',{
                  awardtype: 5,
                  starttime: starttime,
                  endtime: endtime,
                  projectid: json.projectid,
                  type: json.type,
                  position: json.position
                },false);
              }
            },
            components: [{
              text: '签约人数'
            },{
              text: (msg.dealcnt ? msg.dealcnt : 0)
            }]
          },{
            classes: 'info-box ' + (msg.subscribecnt > 0 ? 'hasafter' : ''),
            onSingleTap: function() {
              if(msg.subscribecnt > 0) {
                Page.open('./clist.html',{
                  awardtype: 4,
                  starttime: starttime,
                  endtime: endtime,
                  projectid: json.projectid,
                  type: json.type,
                  position: json.position
                },false);
              }
            },
            components: [{
              text: '认购人数'
            },{
              text: (msg.subscribecnt ? msg.subscribecnt : 0)
            }]
          },{
            classes: 'info-box ' + (msg.pledgecnt > 0 ? 'hasafter' : ''),
            onSingleTap: function() {
              if(msg.pledgecnt > 0) {
                Page.open('./clist.html',{
                  awardtype: 3,
                  starttime: starttime,
                  endtime: endtime,
                  projectid: json.projectid,
                  type: json.type,
                  position: json.position
                },false);
              }
            },
            components: [{
              text: '认筹人数'
            },{
              text: (msg.pledgecnt ? msg.pledgecnt : 0)
            }]
          },{
            classes: 'info-box ' + (msg.visitcnt > 0 ? 'hasafter' : ''),
            onSingleTap: function() {
              if(msg.visitcnt > 0) {
                Page.open('./clist.html',{
                  awardtype: 2,
                  starttime: starttime,
                  endtime: endtime,
                  projectid: json.projectid,
                  type: json.type,
                  position: json.position
                },false);
              }
            },
            components: [{
              text: '到访人数'
            },{
              text: (msg.visitcnt ? msg.visitcnt : 0)
            }]
          },{
            classes: 'info-box ' + (msg.customercnt > 0 ? 'hasafter' : ''),
            onSingleTap: function() {
              if(msg.customercnt > 0) {
                Page.open('./clist.html',{
                  awardtype: 0,
                  starttime: starttime,
                  endtime: endtime,
                  projectid: json.projectid,
                  type: json.type,
                  position: json.position
                },false);
              }
            },
            components: [{
              text: '推荐人数'
            },{
              text: (msg.customercnt ? msg.customercnt : 0)
            }]
          }], searchEl);
          }
        });
      });
    
      // page.find('select').on('change', function() {
      //   $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
      // });
    }
    
  }
})