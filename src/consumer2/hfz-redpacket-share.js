"use strict";
Page.ready(function($, query) {
  
  return {

    name: "blgl-share",
    
    options: {
      scroller: true,
      wxShortUrl: true
    },

    onRender: function() {
      var preopenid = query.preopenid;
      var prepassport = query.prepassport;
      var preappid = query.preappid;
      var hfzopenid = query.hfzopenid;
      var hfzpassport = query.hfzpassport;
      var hfzappid = query.hfzappid;
      var specialhost = query.specialhost;
      var specialid = parseInt(query.specialid);
      var specialshowid = parseInt(query.specialshowid) | 0;
      var sharetimes = parseInt(query.sharetimes) | 0;
      var redpacketcode = query.redpacketcode;
      var hostname = query.hostname;
      var acode = query.acode;
      var channel = (query.channel ? query.channel : '');
      var originApiUrl = 'http://' + hostname + '/qc-webapp/qcapi.do';
      var hfzApiUrl = 'http://' + specialhost + '/qc-webapp/qcapi.do';
      var page = $('#page-blgl-share');
    
    
      //添加浏览记录
      api.request.get("/hfz/HfzSpecialAction/saveVisitLog", {
        obj: {
          specialid: specialshowid || specialid,
          type: (channel ? parseInt(channel) : 0)
        }
      }, {
        mask: false,
        ljsonp: true,
        jdomain: specialhost,
        japi: "/qc-webapp/qcapi.do",
        otherOpenid: hfzopenid,
        otherPassport: hfzpassport,
        otherAppid: hfzappid
      }).then(function(response){ var msg = response.data;
      });
    
      //获取专场信息
      api.request.get("/hfz/HfzSpecialAction/getSpecialAndAgent", {
        obj: {
          id: specialshowid || specialid,
          agentOpenid: hfzopenid
        }
      }, {
        ljsonp: true,
        jdomain: specialhost,
        japi: "/qc-webapp/qcapi.do",
        otherOpenid: hfzopenid,
        otherPassport: hfzpassport,
        otherAppid: hfzappid
      }).then(function(response){ var msg = response.data;
        if(true) {
          var special = msg.special;
          var agent = msg.agent;
          //设置分享
          var url = 'http://' + specialhost + '/consumer2/common-hfz-share.html?id='+specialid+'&showid='+specialshowid+'&rsvopenid='+(agent ? hfzopenid : '')+'&channel='+channel;
    
          app.wechat.SHARE_TITLE = special.publicizetitle;
          app.wechat.SHARE_DESC = special.sharedesc;
          app.wechat.SHARE_TIMELINE_TITLE = special.sharetitle;
          app.wechat.SHARE_LINK = url;
          app.wechat.SHARE_IMG_URL = 'http://' + specialhost + special.sharelogo;
    
          app.wxjsapk.shortUrl = true;
          /* app.wxjsapk.init() */;
          //设置背景
          if(special.publicizepic.indexOf('http://') >= 0) {
            page.find('img').attr('src',special.publicizepic);
          }else{
            page.find('img').attr('src','http://' + specialhost + special.publicizepic);
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
        api.request.get("/hfz/HfzSpecialAction/saveShareLog", {
          obj: {
            openid : hfzopenid,
            type: type
          }
        }, {
          mask: false,
          ljsonp: true,
          jdomain: specialhost,
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