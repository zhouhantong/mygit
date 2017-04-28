"use strict";
Page.ready(function ($, query) {

  var ival

  return {

    name: "blgl-share",

    options: {
      scroller: true,
      wxShortUrl: true,
      wxSharable: false,
      sharable: true
    },

    onRender: function () {
      var self = this
      var flag = query.flag ? query.flag : '';
      var id = parseInt(query.id);
      var showid = parseInt(query.showid) | 0;
      var count = 59;
      var agentopenid = query.rsvopenid;
      var preopenid = query.preopenid;
      var prepassport = query.prepassport;
      var preappid = query.preappid;
      var hostname = query.hostname;
      var acode = query.acode;
      var channel = (query.channel ? query.channel : '');
      var baseUrl = 'http://' + hostname;
      var apiUrl = baseUrl + '/qc-webapp/qcapi.do';

      var needVericode = true;
      var page = $('#page-blgl-share');
      var popup = $('.appointment-popup');


      //添加浏览记录
      api.request.get("/hfz/HfzSpecialAction/saveVisitLog", {
        obj: {
          specialid: showid || id,
          type: (channel ? parseInt(channel) : 0)
        }
      }, {
        mask: false,
        ljsonp: true,
        jdomain: hostname,
        japi: "/qc-webapp/qcapi.do"
      }).then(function (response) {
        var msg = response.data;
      });

      // console.log(apiUrl);

      api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
        obj: {
          openid: preopenid
        }
      }, {
        ljsonp: true,
        jdomain: hostname,
        japi: "/qc-webapp/qcapi.do"
      }).then(function (response) {
        var userObj = response.data;
        var rsvopenid = ''
        if (userObj.agent && userObj.agent.state == 1 && userObj.agent.workstate != 0 && userObj.agent.type != 3) {
          //是经纪人
          rsvopenid = preopenid
        } else if (userObj.teammember && userObj.teammember.state == 1) {
          //是队员或队长  
          rsvopenid = preopenid
        }
        api.request.get("/hfz/HfzSpecialAction/getSpecialAndAgent", {
          obj: {
            id: showid || id,
            agentOpenid: preopenid
          }
        }, {
          ljsonp: true,
          jdomain: hostname,
          japi: "/qc-webapp/qcapi.do"
        }).then(function (response) {
          var msg = response.data;
          var special = msg.special;
          var agent = msg.agent;
          self.pid = msg.special.projectid
          //设置分享
          var url = baseUrl + '/consumer2/common-hfz-share.html?flag=' + flag + '&id=' + id + '&showid=' + showid + '&rsvopenid=' + (rsvopenid ? rsvopenid : '') + (channel ? '&channel=' + channel : '');
          // console.log(url);
          app.wechat.SHARE_TITLE = special.publicizetitle;
          app.wechat.SHARE_DESC = special.sharedesc;
          app.wechat.SHARE_TIMELINE_TITLE = special.sharetitle;
          app.wechat.SHARE_LINK = url;
          app.wechat.SHARE_IMG_URL = baseUrl + special.sharelogo;

          // app.wxjsapk.shortUrl = true;
          /* app.wxjsapk.init() */
          wechat.init();

          //设置背景
          if (special.publicizepic.indexOf('http://') >= 0) {
            page.find('img').attr('src', special.publicizepic);
          } else {
            page.find('img').attr('src', baseUrl + special.publicizepic);
          }
          //设置按钮
          $('.btn-appointment > img').attr('src', baseUrl + special.appointmentpicurl);
          $('.btn-appointment').removeClass('hide');
          if (special.hasslid && special.hasslid == 1) {
            $('.btn-arrow').removeClass('hide');
          }
          if (special.appointmenttype == 0) {
            needVericode = false;
            $('.vericodeType').addClass('hide');
            $('.appointment-popup').removeClass('a2');
          }
        });
      });

      if (flag) {
        $('.appointment-popup').removeClass('hide');
      }

      $('.btn-appointment').singleTap(function () {
        popup.find('#mname').val("");
        popup.find('#telnum').val("");
        popup.find('#vericode').val("");
        clearInterval(ival)
        popup.find('.btn-vericode').removeClass('disabled')
        popup.find('.btn-vericode').html('免费获取验证码')
        $('.appointment-popup').removeClass('hide');
      });

      popup.find('.cancel').singleTap(function () {
        $('.appointment-popup').addClass('hide');
      });

      popup.find('#telnum').on('input', function () {
        var mobile = $('#telnum').val();
        if (mobile) {
          clearInterval(ival)
          popup.find('.btn-vericode').removeClass('disabled')
          popup.find('.btn-vericode').html('免费获取验证码')
        }
      })

      //发送验证码 按钮
      popup.find('.btn-vericode').singleTap(function () {
        if (popup.find('.btn-vericode').hasClass('disabled')) {
          return;
        }
        var mobile = $('#telnum').val();
        if (Fn.isMobile(mobile)) {

          popup.find('.btn-vericode').addClass('disabled');
          ival = window.setInterval(function () {
            popup.find('.btn-vericode').html(count + '秒后重新获取');
            if (count <= 0) {
              count = 59;
              clearInterval(ival);
              popup.find('.btn-vericode').removeClass('disabled');
              popup.find('.btn-vericode').html('免费获取验证码');
            } else {
              count--;
            }
          }, 1000);

          api.request.get("/global/App/getHfzVericode", {
            mobile: mobile
          }, {
            ljsonp: true,
            jdomain: hostname,
            japi: "/qc-webapp/qcapi.do"
          }).then(function (response) {
            var msg = response.data;
            v.ui.alert('验证码已通过短信发送到您的手机，稍等一会儿哦');
          });
        } else if (mobile) {
          v.ui.alert('请输入正确的手机号码');
        } else {
          v.ui.alert('请输入您的手机号码');
        }
      });

      // 提交申请
      popup.find('.submit').singleTap(function () {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
        var vericode = $('#vericode').val();

        if (!name || !mobile) {
          return v.ui.alert('所有项均为必填项');
        }
        if (!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        var parames = {
          obj: {
            name: name,
            mobile: mobile,
            ispublic: 1,
            projectid: self.pid
          }
        };
        if (agentopenid) {
          $.mixin(parames.obj, {memberopenid: agentopenid, ispublic: 2}, true);
        }
        if (needVericode) {
          if (!vericode) {
            return v.ui.alert('请输入短信验证码');
          }
          app.session.vericode = vericode;
        }
        var action = '/hfz/HfzTeamManageAction/addAppointment'
        api.request.get(parames, {
          action: action,
          ljsonp: true,
          jdomain: hostname,
          japi: "/qc-webapp/qcapi.do"
        }).then(function (response) {
          var msg = response.data;
          v.ui.alert('预约成功').then(function () {
            $('.appointment-popup').addClass('hide');
          });
        }).catch(e => {
          v.ui.alert(e.response.errmsg).then(()=>{
            if(e.response.code != -1004){
              $('.appointment-popup').addClass('hide');
            }
          });
        });
      });

      app.wechat.SHARE_CALLBACK_OK = function (type) {
        if (type == 2) {
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
          }).then(function (response) {
            var msg = response.data;
            if (true) {
              if (msg.info) {
                api.request.get("/activity/comm/CommActivityAction/share", {
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
                }).then(function (response) {
                  var msg = response.data;
                });
              } else {
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
                }).then(function (response) {
                  var msg = response.data;
                  if (true) {
                    api.request.get("/activity/comm/CommActivityAction/share", {
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
                    }).then(function (response) {
                      var msg = response.data;
                    });
                  }
                });
              }
            }
          });
        }
        api.request.get("/hfz/HfzSpecialAction/saveShareLog", {
          obj: {
            openid: preopenid,
            specialid: showid || id,
            type: type
          }
        }, {
          mask: false,
          ljsonp: true,
          jdomain: hostname,
          japi: "/qc-webapp/qcapi.do",
          otherAppid: preappid,
          otherOpenid: preopenid,
          otherPassport: prepassport
        }).then(function (response) {
          var msg = response.data;
        });
      }
    }

  }
})