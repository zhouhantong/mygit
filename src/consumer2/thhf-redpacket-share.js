"use strict";
Page.ready(function($, query) {
  
  return {
    name: "blgl-share",
    options: {
      scroller: true,
      wxShortUrl: true
    },

    onRender: function() {
      var titleid = parseInt(query.titleid);
      var preopenid = query.preopenid;
      var prepassport = query.prepassport;
      var preappid = query.preappid;
      var hfzopenid = query.hfzopenid;
      var hfzpassport = query.hfzpassport;
      var hfzappid = query.hfzappid;
      var hfzhost = query.hfzhost;
      var sharetimes = parseInt(query.sharetimes) | 0;
      var redpacketcode = query.redpacketcode;
      var hostname = query.hostname;
      var acode = query.acode;
      var channel = query.channel ? query.channel : '';
      var originApiUrl = 'http://' + hostname + '/qc-webapp/qcapi.do';
      var hfzApiUrl = 'http://' + hfzhost + '/qc-webapp/qcapi.do';
      var page = $('#page-blgl-share');
      var needProjectId = false
    
      //添加浏览记录
      api.request.get("/hfz/HfzAppointmentAction/saveVisitLog", {
        obj: {
          type: (channel ? parseInt(channel) : 0)
        }
      }, {
        mask: false,
        ljsonp: true,
        jdomain: hfzhost,
        japi: "/qc-webapp/qcapi.do",
        otherOpenid: hfzopenid,
        otherPassport: hfzpassport,
        otherAppid: hfzappid
      }).then(function(response){ var msg = response.data;
      });
    
      //获取配置信息
      api.request.get("/global/Select/listItemFromCache", {
        titleids: [titleid]
      }, {
        mask: false,
        ljsonp: true,
        jdomain: hostname,
        japi: "/qc-webapp/qcapi.do",
        otherOpenid: preopenid,
        otherPassport: prepassport,
        otherAppid: preappid
      }).then(function(response){ var msg = response.data;
        if(true) {
          var json = JSON.parse(msg[titleid][0].itemtext);
          page.find('img').attr('src',json.imgurl);
    
          if(json.shareurl) {
            needProjectId = true
            //有配置分享链接
            app.wechat.SHARE_TITLE = json.sharetitle;
            app.wechat.SHARE_DESC = json.sharedesc;
            app.wechat.SHARE_TIMELINE_TITLE = json.sharefriendstitle;
            app.wechat.SHARE_IMG_URL = json.sharelogurl;
            app.wechat.SHARE_LINK = json.shareurl + '&fopenid=' + hfzopenid + '&memberopenid=' + hfzopenid;
            app.wxjsapk.shortUrl = true;
            /* app.wxjsapk.init() */;
          } else {
            //获取经纪人信息
            api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}, {
              ljsonp: true,
              jdomain: hfzhost,
              japi: "/qc-webapp/qcapi.do",
              otherOpenid: hfzopenid,
              otherPassport: hfzpassport,
              otherAppid: hfzappid
            }).then(function(response){ var msg = response.data;
              if(true) {
                var special = msg.special;
                var agent = msg.agent;
                //设置分享
                if(agent && agent.workstate != 0 && agent.state == 1){
                  var url = 'http://' + hfzhost + '/consumer2/thhf-share.html?preappid='+preappid+'&titleid='+titleid+'&hostname='+hostname+'&agentopenid='+hfzopenid+'&channel='+channel;
                }else{
                  var url = 'http://' + hfzhost + '/consumer2/thhf-share.html?preappid='+preappid+'&titleid='+titleid+'&hostname='+hostname+'&channel='+channel;
                }
    
                app.wechat.SHARE_TITLE = json.sharetitle;
                app.wechat.SHARE_DESC = json.sharedesc;
                app.wechat.SHARE_TIMELINE_TITLE = json.sharefriendstitle;
                app.wechat.SHARE_IMG_URL = json.sharelogurl;
                app.wechat.SHARE_LINK = url;
    
                app.wxjsapk.shortUrl = true;
                app.wxjsapk.init();
              }
            });
          }
    
        }
      });
    
      api.request.get("/activity/comm/CommActivityAction/info", {
        obj: {
          acode: redpacketcode
        }
      }, {
        mask: false,
        ljsonp: true,
        jdomain: hostname,
        japi: "/qc-webapp/qcapi.do",
        otherOpenid: preopenid,
        otherPassport: prepassport,
        otherAppid: preappid
      }).then(function(response){ var msg = response.data;
        if(true){
          if(msg.info){
          }else{
            api.request.get("/activity/comm/CommActivityAction/join", {
              obj: {
                acode: redpacketcode,
                drawcounts: 1
              }
            }, {
              mask: false,
              ljsonp: true,
              jdomain: hostname,
              japi: "/qc-webapp/qcapi.do",
              otherOpenid: preopenid,
              otherPassport: prepassport,
              otherAppid: preappid
            }).then(function(response){ var msg = response.data;
            });
          }
        }
      });
    
      app.wechat.SHARE_CALLBACK_OK = function(type){
        if(type == 2) {
          //红包
          api.request.get("/activity/comm/CommActivityAction/share", {
            obj:{
              acode: redpacketcode
            }
          }, {
            mask: false,
            ljsonp: true,
            jdomain: hostname,
            japi: "/qc-webapp/qcapi.do",
            otherOpenid: preopenid,
            otherPassport: prepassport,
            otherAppid: preappid
          }).then(function(response){ var msg = response.data;
            if(true){
              api.request.get("/activity/comm/CommActivityAction/info", {
                obj: {
                  acode: redpacketcode
                }
              }, {
                mask: false,
                ljsonp: true,
                jdomain: hostname,
                japi: "/qc-webapp/qcapi.do",
                otherOpenid: preopenid,
                otherPassport: prepassport,
                otherAppid: preappid
              }).then(function(response){ var msg = response.data;
                if(true){
                  if(msg.info && msg.info.sharecounts >= sharetimes){
                    api.request.get("/activity/comm/CommActivityAction/draw", {
                      obj: {
                        acode: redpacketcode
                      }
                    }, {
                      mask: false,
                      ljsonp: true,
                      jdomain: hostname,
                      japi: "/qc-webapp/qcapi.do",
                      otherOpenid: preopenid,
                      otherPassport: prepassport,
                      otherAppid: preappid
                    }).then(function(response){ var msg = response.data;
                    });
                  }
                }
              });
            }
          });
    
          //分享
          api.request.get("/activity/comm/CommActivityAction/info", {
            obj: {
              acode: acode
            }
          }, {
            mask: false,
            ljsonp: true,
            jdomain: hostname,
            japi: "/qc-webapp/qcapi.do",
            otherOpenid: preopenid,
            otherPassport: prepassport,
            otherAppid: preappid
          }).then(function(response){ var msg = response.data;
            if(true){
              if(msg.info){
                api.request.get("/activity/comm/CommActivityAction/share", {
                  obj:{
                    acode: acode
                  }
                }, {
                  mask: false,
                  ljsonp: true,
                  jdomain: hostname,
                  japi: "/qc-webapp/qcapi.do",
                  otherOpenid: preopenid,
                  otherPassport: prepassport,
                  otherAppid: preappid
                }).then(function(response){ var msg = response.data;
                });
              }else{
                api.request.get("/activity/comm/CommActivityAction/join", {
                  obj: {
                    acode: acode
                  }
                }, {
                  mask: false,
                  ljsonp: true,
                  jdomain: hostname,
                  japi: "/qc-webapp/qcapi.do",
                  otherOpenid: preopenid,
                  otherPassport: prepassport,
                  otherAppid: preappid
                }).then(function(response){ var msg = response.data;
                  if(true){
                    api.request.get("/activity/comm/CommActivityAction/share", {
                      obj:{
                        acode: acode
                      }
                    }, {
                      mask: false,
                      ljsonp: true,
                      jdomain: hostname,
                      japi: "/qc-webapp/qcapi.do",
                      otherOpenid: preopenid,
                      otherPassport: prepassport,
                      otherAppid: preappid
                    }).then(function(response){ var msg = response.data;
                    });
                  }
                });
              }
            }
          });
        }
        api.request.get("/hfz/HfzAppointmentAction/saveShareLog", {
          obj: {
            openid : hfzopenid,
            type: type,
            projectid: (needProjectId ? -102 : 0)
          }
        }, {
          mask: false,
          ljsonp: true,
          jdomain: hfzhost,
          japi: "/qc-webapp/qcapi.do",
          otherOpenid: hfzopenid,
          otherPassport: hfzpassport,
          otherAppid: hfzappid
        }).then(function(response){ var msg = response.data;
        });
      }
    }
    
  }
})