"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-card",
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-card');
      api.request.get("/hfz/HfzChannelManageAction/getManagerByOpid", {}).then(function(response){ var msg = response.data;
        if(true){
          //取用户信息
          // var data = {
          //   name: msg.name,
          //   mobile: msg.mobile,
          //   agency: msg.companyname,
          //   headimageurl: '',
          //   sh: 3,
          //   tj: 25,
          //   df: 2
          // };
          //信息展示
          page.find('.txt').text(msg.name);
          page.find('.bg > img').attr('src',(msg.headimgurl ? msg.headimgurl : 'images/head.jpg'));
          page.find('.infoarea').html('手机：'+msg.mobile+'<br>公司：'+msg.companyname+'<br>职位：渠道经理');
          $.createElements({
            classes: 'act-bar',
            components: [{
              classes: 'act-block',
              components: [{
                tag: 'img',
                classes: 'imagestyle',
                src: 'images/icon_dsh.png'
              },{
                // classes: (msg.sh > 0 ? 'numnote' : 'hide'),
                classes: 'numnote',
                text: (msg.pendAgentCnt ? msg.pendAgentCnt : 0)
              },{
                classes: 'txtstyle t2',
                text: '待审核'
              }]
            },{
              classes: 'act-block',
              components: [{
                tag: 'img',
                classes: 'imagestyle',
                src: 'images/icon_jrtj.png'
              },{
                // classes: (msg.tj > 0 ? 'numnote' : 'hide'),
                classes: 'numnote',
                text: (msg.todaysnew ? msg.todaysnew : 0)
              },{
                classes: 'txtstyle t2',
                text: '今日推荐'
              }]
            },{
              classes: 'act-block',
              components: [{
              tag: 'img',
              classes: 'imagestyle',
              src: 'images/icon_jrdf.png'
              },{
                // classes: (msg.df > 0 ? 'numnote' : 'hide'),
                classes: 'numnote',
                text: (msg.todaysvisit ? msg.todaysvisit : 0)
              },{
                classes: 'txtstyle t2',
                text: '今日到访'
              }]
            }]
          }, '.infopannel');
        }
      });
    
      //操作栏
      var data = [{
        content: '活动说明',
        url: './hdsm.html',
        imgsrc: 'images/icon_hdsm.png'
      },{
        content: '团队成员',
        url: './teammember.html',
        imgsrc: 'images/icon_tdcy.png'
      },{
        content: '团队成绩',
        url: './teamperformance.html',
        imgsrc: 'images/icon_tdcj.png'
      },{
        content: '我的消息',
        url: './notice.html',
        imgsrc: 'images/icon_wdxx.png'
      },{
        content: '归属变更',
        url: './changebelong.html',
        imgsrc: 'images/icon_gsbg.png'
      }];
      if(data.length > 0) {
        var len = data.length;
        var groupData = [];
        var tmp = [];
        for(var i=0;i<len;i++) {
          tmp.push(data[i]);
          if(i % 3 == 2 || i == len - 1) {
            groupData.push(tmp);
            tmp = [];
          }
        }
        var components = [];
        for(var i=0;i<groupData.length;i++) {
          components.push({
            classes: 'act-bar',
            components: groupData[i].map(function(item) {
              return {
                classes: 'act-block',
                onSingleTap: function() {
                  Page.open(item.url);
                },
                components: [{
                  tag: 'img',
                  src: item.imgsrc
                },{
                  text: item.content
                }]
              }
            })
          });
        }
        $.createElements(components, '.actpannel');
      }
    }
    
  }
})