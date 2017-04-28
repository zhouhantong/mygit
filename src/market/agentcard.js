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
    
      api.request.get("/hfz/HfzChannelManageAction/getAgentByOpid", {}).then(function(response){ var msg = response.data;
        if(true){
          // var data = {
          //   name: msg.name,
          //   mobile: msg.mobile,
          //   agency: msg.companyname,
          //   headimageurl: '',
          //   tj: msg.customercnt,
          //   df: 25,
          //   yj: 2000
          // };
      //信息展示
        page.find('.txt').text(msg.name);
        page.find('.bg > img').attr('src',(msg.headimgurl ? msg.headimgurl : 'images/head.jpg'));
        page.find('.infoarea').html('手机：'+msg.mobile+'<br>公司：'+msg.companyname+'<br>职位：经纪人');
        $.createElements({
          classes: 'act-bar',
          components: [{
            classes: 'act-block',
            components: [{
              tag: 'img',
              classes: 'imagestyle',
              src: 'images/icon_jrtj.png'
            },{
              text: (msg.customercnt ? msg.customercnt : 0) + '人'
            },{
              text: '总推荐'
            }]
          },{
            classes: 'act-block',
            components: [{
              tag: 'img',
              classes: 'imagestyle',
              src: 'images/icon_jrdf.png'
            },{
              //classes: (msg.df > 0 ? 'numnote' : 'hide'),
              classes: 'numnote',
              text: (msg.todaysvisit ? todaysvisit : 0)
            },{
              classes: 'txtstyle',
              text: '今日到访'
            }]
          },{
            classes: 'act-block',
            components: [{
            tag: 'img',
            classes: 'imagestyle',
            src: 'images/icon_yj.png'
            },{
              text: (msg.brokerage ? msg.brokerage : 0) + '元'
            },{
              text: '我的佣金'
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
        content: '报备客户',
        url: './recommend.html',
        imgsrc: 'images/icon_bbkh.png'
      },{
        content: '我的客户',
        url: './customer.html',
        imgsrc: 'images/icon_wdkh.png'
      },{
        content: '我的消息',
        url: './notice.html',
        imgsrc: 'images/icon_wdxx.png'
      },{
        content: '我的佣金',
        url: './commission.html',
        imgsrc: 'images/icon_wdyj.png'
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