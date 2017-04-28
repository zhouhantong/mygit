"use strict";
Page.ready(function ($, query) {

  return {

    name: "personal-hfz",

    options: {
      scroller: true,
      wxShortUrl: true,
      wxSharable: false
    },

    onRender: function () {
      var page = $('#page-personal-hfz');
      var id = parseInt(query.id);
      var baseUrl = location.protocol + '//' + location.host;
      var url;
      var isagent = false;

      var showids = query.showids ? JSON.parse(query.showids) : [];

      var special, agent;

      //检查是否注册
      api.request.get("/hfz/HfzSpecialAction/getSpecialAndAgent", {
        obj: {
          id: id,
          agentOpenid: app.session.openid
        }
      }).then(function (response) {
        var msg = response.data;
        if (!msg.agent || (msg.agent && msg.agent.state != 1)) {
          Page.open(baseUrl + '/consumer2/common-hfz-share.html?id=' + id + '&rsvopenid=' + (agent ? app.session.openid : ''));
        } else {
          if (msg.user) {
            isagent = true;
          }
          special = msg.special;
          agent = msg.agent;
          //设置分享
          // if(special.publicizeurl.indexOf('//') < 0) {
          //   url = baseUrl + special.publicizeurl;
          // }else{
          //   url = special.publicizeurl;
          // }
          // if(url.indexOf('?') < 0) {
          //   url += '?id='+id+'&openid=' + app.session.openid;
          // } else {
          //   url += '&id='+id+'&openid=' + app.session.openid;
          // }
          url = baseUrl + '/consumer2/common-hfz-share.html?id=' + id + '&rsvopenid=' + (agent ? app.session.openid : '');
          app.wechat.SHARE_TITLE = special.publicizetitle;
          app.wechat.SHARE_DESC = special.sharedesc;
          app.wechat.SHARE_TIMELINE_TITLE = special.sharetitle;
          app.wechat.SHARE_LINK = url;
          app.wechat.SHARE_IMG_URL = baseUrl + special.sharelogo;

          // app.wxjsapk.shortUrl = true;
          /* app.wxjsapk.init() */
          wechat.init();
          //生成页面
          createHeader(agent, special);
          createCenter();
          createBottom();
          //生成二维码
          api.request.get("/global/Qrcode/getQRCodeByKey", {
            obj: url
          }).then(function (response) {
            var msg = response.data;
            if (true) {
              $('.qrcode-popup img').attr('src', msg);
            }
          });
          //预约列表
          loadData();

          $('.next-button').singleTap(function () {
            Page.open('../market/recommend.html?projectid=' + special.projectid + '&type=1&needback=1');
          });

        }

      });

      $(document.body).on('touchstart', function () {
        $('.qrcode-popup').addClass('hide');
        $('.share-popup').addClass('hide');
      });

      $(".publicizepic-popup").find(".closebt").tap(function () {
        $(".publicizepic-popup").addClass("hide");
      })

      function createHeader(agent, special) {
        $.createElements([{
          classes: 'top-header',
          components: [{
            tag: 'img',
            src: agent.headimgurl || 'images/head.jpg'
          }, {
            classes: 'centerpannel',
            components: [{
              text: agent.name
            }, {
              text: agent.mobile
            }]
          }, {
            classes: 'rightpannel',
            components: [{
              text: special.name,
            }, {
              text: special.projectname
            }]
          }]
        }], '.vpage-content .info-area');
      }

      function createCenter() {
        var components = [{
          classes: 'center-item',
          onSingleTap: function () {
            $('.qrcode-popup').removeClass('hide');
          },
          components: [{
            classes: 'actname qrcode',
            text: '个人二维码'
          }]
        }];
        components = components.concat([{
          classes: 'center-item',
          onSingleTap: function () {
            Page.open(url);
          },
          components: [{
            classes: 'actname link',
            text: '我的宣传页' + (showids.length > 0 ? "1" : "")
          }]
        }, {
          classes: 'center-item',
          onSingleTap: function () {
            api.request.get("/hfz/HfzSpecialAction/getSpecialAndAgent", {
              obj: {
                id: id,
                agentOpenid: app.session.openid
              }
            }).then(function (response) {
              var msg = response.data;
              if (true) {
                if (msg.agent.publicizepic) {
                  $('.publicizepic-popup img').attr('src', msg.agent.publicizepic);
                  $('.publicizepic-popup').removeClass('hide');
                } else {
                  api.request.get("/hfz/HfzCqblAction/createSpecialPlacard", {
                    obj: {
                      specialid: id,
                      qrcode: baseUrl + '/consumer2/common-hfz-share.html' + $.queryString({
                        id: id,
                        rsvopenid: (agent ? app.session.openid : ''),
                        flag: 1
                      }, "?")
                    }
                  }).then(function (response) {
                    var msg = response.data;
                    if (true) {
                      $('.publicizepic-popup img').attr('src', msg.publicizepic);
                      $('.publicizepic-popup').removeClass('hide');
                    }
                  });
                }
              }
            });
          },
          components: [{
            classes: 'actname link',
            text: '我的宣传海报' + (showids.length > 0 ? "1" : "")
          }]
        }])
        components = components.concat(showids.map(function (showid, index) {
          return {
            classes: 'center-item',
            onSingleTap: function () {
              Page.open(url, {showid: showid});
            },
            components: [{
              classes: 'actname link',
              text: '我的宣传页' + (index + 2)
            }]
          }
        }).concat(showids.map(function (showid, index) {
          return {
            classes: 'center-item',
            onSingleTap: function () {
              api.request.get("/hfz/HfzSpecialAction/getSpecialAndAgent", {
                obj: {
                  id: showid,
                  agentOpenid: app.session.openid
                }
              }).then(function (response) {
                var msg = response.data;
                if (true) {
                  if (msg.agent.publicizepic) {
                    $('.publicizepic-popup img').attr('src', msg.agent.publicizepic);
                    $('.publicizepic-popup').removeClass('hide');
                  } else {
                    api.request.get("/hfz/HfzCqblAction/createSpecialPlacard", {
                      obj: {
                        specialid: showid,
                        qrcode: baseUrl + '/consumer2/common-hfz-share.html' + $.queryString({
                          id: id,
                          showid: showid,
                          rsvopenid: (agent ? app.session.openid : ''),
                          flag: 1
                        }, "?")
                      }
                    }).then(function (response) {
                      var msg = response.data;
                      if (true) {
                        $('.publicizepic-popup img').attr('src', msg.publicizepic);
                        $('.publicizepic-popup').removeClass('hide');
                      }
                    });
                  }
                }
              });
            },
            components: [{
              classes: 'actname link',
              text: '我的宣传海报' + (index + 2)
            }]
          }
        })))
        components = components.concat([special.h5exhibition ? {
          classes: 'center-item',
          onSingleTap: function () {
            return Page.open(baseUrl + special.h5exhibition);
          },
          components: [{
            classes: 'actname link',
            text: '我的H5推广'
          }]
        } : $.nop, {
          classes: 'center-item',
          onSingleTap: function () {
            var json = {
              projectid: special.projectid,
              projectname: special.projectname,
              type: 1
            };
            Page.open('../market/cus-list.html?info=' + encodeURIComponent(JSON.stringify(json)));
            // Page.open("../market/pdetail.html", {
            //   projectid: special.projectid,
            //   type: 1,
            //   position: agent.position
            // });
          },
          components: [{
            classes: 'actname consumer',
            text: '我的客户'
          }]
        }, {
          classes: 'center-item',
          onSingleTap: function () {
            var json = {
              projectid: special.projectid,
              projectname: special.projectname,
              type: 1,
              position: agent.position
            };
            Page.open('../market/performance.html?info=' + encodeURIComponent(JSON.stringify(json)));
          },
          components: [{
            classes: 'actname project',
            text: '项目报表'
          }]
        }])
        $.createElements([{
          classes: 'center-box',
          components: components
        }, {
          style: 'height: 5px;background: #E9F1F7'
        }], '.vpage-content .info-area');
      }

      function createBottom() {
        api.request.get("/hfz/HfzCustomerAction/getSpecialCustomerCnt", {
          obj: {
            specialid: id
          }
        }).then(function (response) {
          var msg = response.data;
          if (true) {
            $.createElements([{
              classes: 'headerbottom-top-txt',
              text: '本专场微信预约客户',
              components: [{
                text: '活动中通过微信预约客户可以点击【一键报备】到系统后台报备查询排重，报备后该预约客户标记为【已报备】，如果该客户已经被其他经纪人报备，该客户标记为【无法报备】'
              }]
            }, {
              classes: 'headerbottom-top',
              components: [{
                classes: 'infopannel x1',
                components: [{
                  text: '总预约客户数'
                }, {
                  html: '<span>' + (msg.totalCnt || 0) + '</span>人'
                }]
              }, {
                classes: 'infopannel',
                onSingleTap: function () {
                  Page.open('./common-hfz-unreport.html?id=' + id + '&isagent=' + (isagent ? 1 : ''));
                },
                components: [{
                  text: '未报备客户'
                }, {
                  html: '<span>' + (msg.unReportCnt || 0) + '</span>人'
                }]
              }]
            }], '.vpage-content .info-area');
          }
        });
      }

      var orderListEl = page.find('.order-list');
      var body = document.body;
      var pageIndex = 0
      var pageSize = 10
      var pageCount = 0
      var loading = false
      var hasMore = true
      $(window).on('scroll', function (event) {
        var bottom = body.scrollHeight - (body.scrollTop + window.innerHeight);
        if (bottom <= 200 && !loading && hasMore) {
          loadData()
          DEBUG && console.debug('debug');
        }
      });

      function loadData() {
        loading = true

        var params = {
          obj: {
            specialid: id
          },
          offset: pageIndex,
          size: pageSize,
        };

        if (pageIndex == 0) {
          orderListEl.empty()
        }

        api.request.get("/hfz/HfzCustomerAction/listSpecialCustomer", params).then(function (response) {
          var msg = response.data;
          if (true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'common-nohfz-item',
              text: '暂无预约'
            }, orderListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function (obj) {
              $.createElements({
                classes: 'order-item',
                components: [{
                  classes: 'leftpannel',
                  components: [{
                    text: '姓名：' + obj.name
                  }, {
                    text: '电话：' + obj.mobile
                  }, {
                    text: '提交时间：' + Fn.getFullTime(obj.createtime)
                  }]
                }, {
                  onSingleTap: function () {
                    if (!obj.reportopenid) {
                      if (isagent) {
                        Page.open('../market/recommend.html?info=' + encodeURIComponent(JSON.stringify({
                            name: obj.name,
                            mobile: obj.mobile
                          })) + '&projectid=' + obj.projectid + '&type=1');
                      } else {
                        Page.open('../market/checkstatus.html');
                      }
                    }
                  },
                  classes: 'rightpannel ' + (obj.reportopenid ? 'r1' : 'r2'),
                  text: (obj.reportopenid ? (obj.reportopenid == app.session.openid ? '己报备' : '无法报备') : '一键报备')
                }]
              }, orderListEl)
            })
            var size = msg.list.length
            var total = msg.total
            pageCount += size
            hasMore = (size >= pageSize && (total < 0 || pageCount < total))
            if (hasMore) {
              pageIndex += size
            }
          }
          loading = false
        })
      }
    }

  }
})