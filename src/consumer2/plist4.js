"use strict";
Page.ready(function ($, query) {

  var page
  var banners = [];
  var tmpArray = [];
  var hid = 0;
  var rsvcount = 0;
  var agentopenid = (query.agentopenid ? query.agentopenid : '');
  var channel = (query.channel ? query.channel : '');
  var curIdx = 0;
  var ctype = query.ctype ? parseInt(query.ctype) : '';

  return {
    name: 'zy-plist4',

    options: {
      menu: true,
      pagingEnabled: true,
      wxSharable: false,
      sharable: true
    },

    init: function () {
      page = this
    },

    onRender: function () {
      $('.vpage').style('min-height', window.innerHeight + 'px');

      new IScroll(page.find('aside')[0]);

      api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo").then(function (response) {
        var msg = response.data;
        var agent = msg.agent;
        api.listItemCache.get({
          titleids: [20151207, 20151210]
        }).then(function(response) {
          var msg = response.data;
          if (msg[20151207].length > 0) {
            var json = JSON.parse(msg[20151207][0].itemtext);
            app.wechat.SHARE_TITLE = json.sharetitle;
            app.wechat.SHARE_DESC = json.sharedesc;
            app.wechat.SHARE_TIMELINE_TITLE = json.sharefriendstitle;
            if (json.sharelogurl) {
              app.wechat.SHARE_IMG_URL = json.sharelogurl;
            }
          }
          if (agent && agent.workstate != 0 && agent.state == 1) {
            app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/plist4.html?agentopenid=' + app.session.openid + '&channel=' + channel;
          } else {
            if (channel) {
              app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/plist4.html?channel=' + channel;
            }
          }
          app.wechat.SHARE_CALLBACK_OK = function(type) {
            api.request.get("/hfz/HfzAppointmentAction/saveShareLog", {
              obj: {
                openid: app.session.openid,
                type: type
              }
            }, {
              mask: false
            }).then(function(response) {
              var msg = response.data;
            });
          }
          wechat.init();
          if (msg[20151210].length > 0) {
            var color = msg[20151210][0].itemtext;
            var colors = color.split(',');
            $('.vpage').style('background', 'transparent -webkit-gradient(linear, left top, left bottom,from(' + colors[0] + '),color-stop(0.5,' + colors[1] + '),to(' + colors[2] + '))');
          }
        });
      })

      //初始化banner
      api.listItemCache.get({
        titleids: [20151203]
      }).then(response => {
        banners = response.data[20151203].map(item => {
          var tmpStr = item.itemtext.split('[##]');
          return { img: tmpStr[0], url: tmpStr[1] };
        });
        this.initBanners(banners);
      });


      //设置区域列表
      api.request.get("/hfz/HfzAppointmentAction/getValidDisplayTypeList").then(function (response) {
        var list = [{displaytype: -1, displayvalue: "全部"}];
        list.concat(response.msg).forEach(function (item) {
          item.current = (item.displaytype == (ctype ? ctype : -1));
          page.tpl('cate-item', item, page.find('ul'));
        })
      })

      app.wechat.SHARE_CALLBACK_OK = function (type) {
        api.request.get("/hfz/HfzAppointmentAction/saveShareLog", {
          obj: {
            openid: app.session.openid,
            type: type
          }
        }, {mask: false})
      }

      this.paging.load()
    },

    onPaging: function (paging) {
      var listEl = page.find(".list");
      if (paging.isFirst()) {
        listEl.empty()
      }

      var type = (ctype ? ctype : -1);
      curIdx = 0;
      var params = {
        state: 1
      };
      if (type > 0) {
        params.displaytype = type
      }

      paging.start().then(paging => {
        return api.request.get('/hfz/HfzAppointmentAction/listHouse', {
          obj: params,
          offset: paging.count,
          size: paging.size
        })
      }).then(response => {
        var obj = response.data
        paging.done(obj.list.length, obj.total)
        if (obj.total == 0) {
          page.tpl("noitem", {}, listEl);
          page.tpl("yybtn", {}, listEl);
          return;
        }

        obj.list.forEach(item => {
          item.booknum = (item.owneropenid ? item.reportcnt : item.num);
          if (tmpArray.includes(item.projectname)) {
            item.HEADER = false;
            // rsvcount += item.booknum;
          } else {
            item.HEADER = true;
            tmpArray.push(item.projectname);
            // rsvcount = item.booknum;
            // hid = item.preprojectid;
          }
          item.id = (item.Id ? item.Id : item.id);
          item.time = this.getRTime(item.deadline);
          page.tpl("item", item, page.find(".list"));
          // page.find('#header-item-'+hid+ ' > span').text('(已预约'+rsvcount+'人)');
          curIdx++;
          console.log(curIdx, obj.total);
          if (curIdx == obj.total) {
            page.tpl("yybtn", {}, page.find(".list"));
          }
        })
      })
    },

    initBanners: function (picList) {
      !function () {
        var h = Math.floor((window.innerWidth * 100) / 320);
        page.find(".banner").style("height", h + "px");
        page.find('aside').style('top', h + 1 + "px");
        page.find('.vpage-content').style('margin-top', h + 1 + "px");
        page.find('aside').removeClass('hide');
      }.defer(250);
      var picUrl = '';
      var len = picList.length;
      if (len > 1) {
        $.createElements({
          classes: 'banner-indicate',
          components: [{
            tag: 'ul',
            components: picList.map(function () {
              return {
                tag: 'li'
              }
            })
          }]
        }, '.vpage-content .banner');
      }

      var data = [];
      for (var i = 0; i < len; i++) {
        data.push({
          classes: 'banner-img',
          dataIdx: picList[i].idx,
          dataUrl: picList[i].url,
          onSingleTap: function () {
            if ($(this).data('url')) {
              Page.open($(this).data('url'));
            }
          },
          dataIndex: i,
          components: [{
            tag: 'img',
            src: picUrl + picList[i].img
          }]
        });
      }
      var duration = 5000;
      var _auto = function () {
        if (!slides.dragging && !slides.snapping) {
          slides.next();
          _auto.defer(duration);
        }
      };
      var slides = new v.ui.Carousel({
        wrap: true,
        enabled: (data.length > 1)
      }).on('change', function () {
        if (this.enabled) {
          _auto.cancel()
          _auto.defer(duration);
        }
      }).on('update', function (event) {
        var header = $(this.centerEl).find('.banner-img');
        if (header && header.length) {
          var idx = parseInt(header.data('index'));
          $('.vpage-content .banner li').removeClass('hightlight')
          $('.vpage-content .banner li:nth-child(' + (idx + 1) + ')').addClass('hightlight')
        }
        $(this.leftEl).vendor('z-index', '1');
        var index = ((event.index % len) + len) % len;
        event.el.empty().append(data[index]);
      }).render($('.vpage-content .banner'));
    },

    onCateTap: function (event, type) {
      page.find('li').removeClass('selected');
      $(event.target).addClass('selected');
      page.find('.list').empty();
      tmpArray = [];
      ctype = type | 0
      this.paging.reset().load()
    },

    goDetail: function (event, id) {
      Page.open("./house-detail.html", {
        projectid: id,
        fromsrc: 2,
        agentopenid: agentopenid,
        channel: channel
      });
    },
    bookFun: function () {
      var time = 59;
      $.createElements({
        classes: "booking-fixed",
        components: [{
          classes: "booking-box",
          components: [{
            classes: "booking-title",
            html: '预约优惠'
          }, {
            classes: 'note-txt',
            html: '请您填写姓名及联系方式，专属置业顾问将很快联系您。'
          }, {
            classes: "input-box i2",
            components: [{
              classes: "input-title",
              html: "姓名"
            }, {
              classes: "inputpanel",
              components: [{
                tag: "input",
                classes: "name"
              }]
            }]
          }, {
            classes: "input-box",
            components: [{
              classes: "input-title",
              html: "电话"
            }, {
              classes: "inputpanel",
              components: [{
                tag: "input",
                classes: "mobile"
              }]
            }]
          }, {
            classes: "input-box",
            components: [{
              classes: "input-title",
              html: "验证码"
            }, {
              classes: "inputpanel",
              components: [{
                tag: "input",
                classes: "vericode"
              }]
            }, {
              classes: "input-verify",
              html: "获取验证码",
              onTap: function () {
                var fixed = $(".booking-fixed");
                var dom = $(this);
                if (dom.hasClass('disabled')) {
                  return;
                }
                var mobile = fixed.find(".mobile").val();
                if (Fn.isMobile(mobile)) {
                  dom.addClass('disabled');
                  var ival = setInterval(function () {
                    dom.html(time + '秒');
                    if (time <= 0) {
                      time = 59;
                      clearInterval(ival);
                      dom.removeClass('disabled');
                      dom.html('获取验证码');
                    } else {
                      time--;
                    }
                  }, 1000);

                  api.request.get("/global/App/getHfzVericode", {
                    mobile: mobile,
                  }).then(function (response) {
                    var msg = response.data;
                    if (true) {
                      v.ui.alert('验证码已通过短信发送到您的手机，稍等一会儿哦');
                    }
                  });
                } else if (mobile) {
                  v.ui.alert('请输入正确的手机号码');
                } else {
                  v.ui.alert('请输入您的手机号码');
                }
              }
            }]
          }, {
            classes: "input-box",
            components: [{
              classes: "input-title",
              html: "留言"
            }, {
              classes: "inputpanel",
              components: [{
                tag: "input",
                classes: "remark"
              }]
            }]
          }, {
            classes: "bts",
            components: [{
              classes: "bt",
              html: "取消",
              onTap: function () {
                var fixed = $(".booking-fixed");
                fixed.remove();
              }
            }, {
              classes: "bt ok",
              html: "确定",
              onTap: function () {
                var fixed = $(".booking-fixed");
                var name = fixed.find(".name").val();
                var mobile = fixed.find(".mobile").val();
                var remark = fixed.find(".remark").val();
                var vericode = fixed.find(".vericode").val();
                if (!name || !mobile || !vericode) {
                  return v.ui.alert("姓名、电话不能为空");
                }
                if (!Fn.isMobile(mobile)) {
                  return v.ui.alert("电话格式不正确");
                }
                app.session.vericode = vericode;
                var params = {
                  mobile: mobile,
                  name: name,
                };
                if (remark) {
                  $.mixin(params, {remark: remark}, true);
                }
                if (agentopenid) {
                  $.mixin(params, {agentopenid: agentopenid}, true);
                }
                if (channel) {
                  $.mixin(params, {type: parseInt(channel)}, true);
                }
                api.request.get("/hfz/HfzAppointmentAction/saveAppointmentCustomer", {
                  obj: params
                }).then(function (response) {
                  var msg = response.data;
                  if (true) {
                    fixed.remove();
                    return v.ui.alert(msg < 0 ? "预约失败" : "提交成功");
                  }
                });
              }
            }]
          }]
        }]
      }, document.body);
    },

    getRTime: function (time) {
      var timestamp = new Date().getTime();
      var t = time - timestamp;
      if (t > 24 * 60 * 60 * 1000) {
        return '剩' + Math.ceil(t / (24 * 60 * 60 * 1000)) + '天'
      } else {
        return '今日截止'
      }
      // if(t > 24 * 60 * 60 * 1000) {
      //   return '剩' + Math.ceil(t/(24 * 60 * 60 * 1000)) + '天'
      // }else if(t > 60 * 60 * 1000) {
      //   return '剩' + Math.ceil(t/(60 * 60 * 1000)) + '小时'
      // }else if(t > 60 * 1000){
      //   return '剩' + Math.ceil(t/(60 * 1000)) + '分钟'
      // }else {
      //   return '剩' + Math.ceil(t/(1000)) + '秒'
      // }
    }

  }
})