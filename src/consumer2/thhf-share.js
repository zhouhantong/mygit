"use strict";
Page.ready(function($, query) {
  
  return {
    name: "blgl-share",
    options: {
      scroller: true,
      wxShortUrl: true
    },

    onRender: function() {
      var page = $('#page-blgl-share');
    
      var titleid = parseInt(query.titleid);
      var agentopenid = (query.agentopenid ? query.agentopenid : '');
      var hostname = query.hostname;
      var originApiUrl = 'http://' + hostname + '/qc-webapp/qcapi.do';
      var preappid = query.preappid;
      var channel = (query.channel ? query.channel : '');
    
      //添加浏览记录
      api.request.get("/hfz/HfzAppointmentAction/saveVisitLog", {
        obj: {
          type: (channel ? parseInt(channel) : 0)
        }
      }, {mask: false}).then(function(response){ var msg = response.data;
      });
    
      //获取配置信息
      api.request.get("/global/Select/listItemFromCache", {
        titleids: [titleid]
      }, {
        mask: false,
        ljsonp: true,
        jdomain: hostname,
        japi: "/qc-webapp/qcapi.do",
        otherAppid: preappid
      }).then(function(response){ var msg = response.data;
        if(true) {
          var json = JSON.parse(msg[titleid][0].itemtext);
          page.find('img').attr('src',json.imgurl);
          $('.btn-appointment > img').attr('src', json.btnimgurl);
          $('.btn-appointment').removeClass('hide');
          if(json.slider == 1) {
            $('.btn-arrow').removeClass('hide');
          }
          //获取经纪人信息
          api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}).then(function(response){ var msg = response.data;
            if(true) {
              var special = msg.special;
              var agent = msg.agent;
              //设置分享
              if(agent && agent.workstate != 0 && agent.state == 1){
                var url = location.protocol + '//' + location.host + '/consumer2/thhf-share.html?preappid='+preappid+'&titleid='+titleid+'&hostname='+hostname+'&agentopenid='+app.session.openid+'&channel='+channel;
              }else{
                var url = location.protocol + '//' + location.host + '/consumer2/thhf-share.html?preappid='+preappid+'&titleid='+titleid+'&hostname='+hostname+'&channel='+channel;
              }
    
              app.wechat.SHARE_TITLE = json.sharetitle;
              app.wechat.SHARE_DESC = json.sharedesc;
              app.wechat.SHARE_TIMELINE_TITLE = json.sharefriendstitle;
              app.wechat.SHARE_IMG_URL = json.sharelogurl;
              app.wechat.SHARE_LINK = url;
    
              app.wxjsapk.shortUrl = true;
              /* app.wxjsapk.init() */;
            }
          });
        }
      });
    
      $('.btn-appointment').singleTap(function(){
        Page.open('./plist4.html',{agentopenid: agentopenid,channel: channel});
      });
    
      app.wechat.SHARE_CALLBACK_OK = function(type){
        api.request.get("/hfz/HfzAppointmentAction/saveShareLog", {
          obj: {
            openid : app.session.openid,
            type: type
          }
        }, {mask: false}).then(function(response){ var msg = response.data;
        });
      }
    }
    
  }
})