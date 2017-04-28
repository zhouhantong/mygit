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
      var specialhost = query.specialhost;
      var sharetimes = parseInt(query.sharetimes) | 0;
      var redpacketcode = query.redpacketcode;
      var hostname = query.hostname;
      var acode = query.acode;
      var titleid = parseInt(query.titleid);
      var originApiUrl = 'http://' + hostname + '/qc-webapp/qcapi.do';
      var page = $('#page-blgl-share');
    
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
          app.wechat.SHARE_TITLE = json.sharetitle;
          app.wechat.SHARE_DESC = json.sharedesc;
          app.wechat.SHARE_TIMELINE_TITLE = json.sharefriendstitle;
          app.wechat.SHARE_IMG_URL = json.sharelogurl;
          app.wechat.SHARE_LINK = 'http://'+specialhost+'/activity/hfz-write2/write.html';
          app.wxjsapk.shortUrl = true;
          /* app.wxjsapk.init() */;
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
        otherAppid: preappid,
        otherOpenid: preopenid,
        otherPassport: prepassport
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
              otherAppid: preappid,
              otherOpenid: preopenid,
              otherPassport: prepassport
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
            otherAppid: preappid,
            otherOpenid: preopenid,
            otherPassport: prepassport
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
                otherAppid: preappid,
                otherOpenid: preopenid,
                otherPassport: prepassport
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
                      otherAppid: preappid,
                      otherOpenid: preopenid,
                      otherPassport: prepassport
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
            otherAppid: preappid,
            otherOpenid: preopenid,
            otherPassport: prepassport
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
                  otherAppid: preappid,
                  otherOpenid: preopenid,
                  otherPassport: prepassport}).then(function(response){ var msg = response.data;
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
                  otherAppid: preappid,
                  otherOpenid: preopenid,
                  otherPassport: prepassport
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
                      otherAppid: preappid,
                      otherOpenid: preopenid,
                      otherPassport: prepassport
                    }).then(function(response){ var msg = response.data;
                    });
                  }
                });
              }
            }
          });
        }
      }
    }
    
  }
})