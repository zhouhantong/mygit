"use strict";
Page.ready(function($, query) {
  
  return {
    name: "zy-house-detail",
    options: {
      scroller: true,
      wxSharable: false
    },

    onRender: function() {
      var page = $('#page-zy-house-detail');
    
      var projectid = parseInt(query.projectid) || 0;
      var fromsrc = query.fromsrc;
    
      var agentopenid = query.agentopenid ? query.agentopenid : '';
      var channel = query.channel ? query.channel : '';
    
      var agent;
    
      api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}).then(function(response){ var msg = response.data;
        agent = msg.agent;
        //设置学区、地铁、品牌显示
        getListItem(11, getInfo);
      })
    
      // 添加浏览记录
      api.request.get("/hfz/HfzAppointmentAction/saveVisitLog", {
        obj: {
          projectid : projectid,
          type: (channel ? parseInt(channel) : 0)
        }
      }, {mask: false}).then(function(response){ var msg = response.data;
      });
    
      //获取楼盘信息
      function getInfo() {
        api.listItemCache.get({
          titleids:[20151207]
        }).then(function(response){ var msg = response.data;
          var json = {};
          if(msg[20151207].length > 0) {
            json = JSON.parse(msg[20151207][0].itemtext);
            // app.wechat.SHARE_TITLE = json.sharetitle;
            // app.wechat.SHARE_DESC = json.sharedesc;
            // app.wechat.SHARE_TIMELINE_TITLE = json.sharefriendstitle;
            // if(json.sharelogurl) {
            //   app.wechat.SHARE_IMG_URL = json.sharelogurl;
            // }
          }
          // /* app.wxjsapk.init() */;
          api.info.get({
            projectid: projectid
          }, {wx: true}).then(function(response){ var msg = response.data;
            if(true) {
              $.createElements([{
                classes: "house-title",
                html: msg.base.projectname
              },json.houseicon ? {
                classes: "home",
                onTap: function() {
                  return Page.open('./plist4.html?agentopenid='+(agentopenid ? agentopenid : '')+'&channel='+(channel ? channel : ''));
                }
              } : $.nop ,{
                classes: "favorite" + hide(msg.isfavorate == 1),
                onTap: function(){
                  var dom = $(this);
                  api.addfavorite.get({
                    projectid: projectid
                  }).then(function(response){ var msg = response.data;
                    if(true) {
                      dom.addClass("hide");
                    }
                  });
                }
              },{
                classes: "nav" + hide(!msg.base.latitude || !msg.base.longitude),
                onTap: function(){
                  Page.open('http://api.map.baidu.com/marker?location=' + msg.base.latitude + ',' + msg.base.longitude + '&title='+msg.base.projectname+'&content='+msg.base.projectname+'&output=html');
                }
              }], page.find(".house-detail-header"));
              page.find(".house-detail-header").removeClass("hide");
              if(msg.banner && msg.banner.length) {
                //创建banner
                page.find('.banner').removeClass('hide');
                createBanner(msg.banner);
              }
              var flag = (agent && msg.base.owneropenid);
              _createDetail(msg.base);
              _createBt(msg.base, flag);
              _createSaler();
              // if(agent && msg.base.owneropenid){
              //   _createRecord(msg.base);
              // }
              app.wechat.SHARE_TITLE = msg.base.projectname + '特惠房';
              app.wechat.SHARE_DESC = msg.base.structure + '，' + '线上专享' + msg.base.price;
              app.wechat.SHARE_TIMELINE_TITLE = msg.base.projectname + msg.base.structure + '，' + '线上专享' + msg.base.price;
              if(agent && agent.workstate != 0 && agent.state == 1){
                app.wechat.SHARE_LINK = location.protocol + "//" + location.hostname + "/consumer2/house-detail.html" + $.queryString({agentopenid: app.session.openid, projectid: projectid, fromsrc: fromsrc,channel: channel}, "?")
              }
              wechat.init();
            }
          });
        });
      }
    
      //banner
      function createBanner(picList) {
        !function(){
          var h = Math.floor((window.innerWidth * 178) / 320);
          page.find(".banner").style("height", h + "px");
        }.defer(250);
        var len = picList.length;
        if(len > 1) {
          $.createElements({
            classes: 'banner-indicate',
            components: [{
              tag: 'ul',
              components: picList.map(function(){
                return {
                  tag: 'li'
                }
              })
            }]
          }, '.vpage-content .banner');
          var data = [];
          for(var i=0;i<len;i++) {
            data.push({
              classes: 'banner-img',
              onTap: function(){},
              dataIndex: i,
              components: [{
                tag: 'img',
                src: picList[i].picurl
              }]
            });
          }
          var duration = 3500;
          var _auto = function() {
            if (!slides.dragging && !slides.snapping) {
              slides.next();
              _auto.defer(duration);
            }
          };
          var slides = new v.ui.Carousel({
            wrap: true
          }).on('change', function() {
            _auto.cancel()
            _auto.defer(duration);
          }).on('update', function(event) {
            var header = $(this.centerEl).find('.banner-img');
            if (header && header.length) {
              var idx = parseInt(header.data('index'));
              $('.vpage-content .banner li').removeClass('hightlight')
              $('.vpage-content .banner li:nth-child('+(idx+1)+')').addClass('hightlight')
            }
            // if (index < 0 || index >= data.length) {
            //   return false;
            // }
            var index = ((event.index % len) + len) % len;
            event.el.empty().append(v.$(data[index]));
          }).render($('.vpage-content .banner'));
        } else {
          $.createElements({
            tag: 'img',
            src: picList[0].picurl
          }, '.vpage-content .banner');
        }
      }
    
      function _createDetail(obj){
        var tmp_datetime = obj.deadline.replace(/:/g,'-');
        tmp_datetime = tmp_datetime.replace(/ /g,'-');
        var arr = tmp_datetime.split("-");
        var now = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
        var time = now.getTime();
        $.createElements({
          classes: "detail-box",
          components: [{
            classes: "detail-value1",
            html: "区域：" + obj.address + ' (' + getRTime(time) + ')'
          },{
            classes: "detail-value1",
            html: "楼栋房号：" + obj.propertycompany
          },{
            classes: "detail-value1",
            html: "户型：" + obj.structure
          },{
            classes: "detail-value1",
            html: "面积：" + obj.floorarearatio
          },{
            classes: "detail-prize-box",
            components: [{
              classes: "detail-prize-value1",
              html: "原价:¥"
            },{
              classes: "detail-prize-value2",
              html: obj.propertyexpense
            }]
          },{
            classes: "detail-prize-box",
            components: [{
              classes: "detail-prize-value3",
              html: (obj.housetype==2?"秒杀价¥":"线上专享¥")+obj.price
            }]
          },{
            classes: "detail-value1",
            html: "交通状况：" + obj.nearbydesc
          },{
            classes: "detail-tags",
            components: [{
              classes: "detail-tag " + (obj.issubway == 1 ? '' : 'hide'),
              html: commonListItem[1]
            },{
              classes: "detail-tag " + (obj.isxuequ == 1 ? '' : 'hide'),
              html: commonListItem[2]
            },{
              classes: "detail-tag " + (obj.brand == 1 ? '' : 'hide'),
              html: commonListItem[0]
            }]
          },{
            classes: "detail-value2" + hide(!obj.commission || !agent),
            html: "佣金详情：" + obj.commission
          },{
            classes: "detail-value2" + hide(!obj.areadesc),
            html: "备注：" + obj.areadesc
          },{
            classes: "surplus" + hide(obj.housetype != 1),
            html: "已预约：{num}人".replace("{num}", obj.owneropenid ? obj.reportcnt | 0 : obj.num | 0)
          },{
            classes: "surplus" + hide(obj.housetype != 2),
            html: "剩余{num}个名额".replace("{num}", obj.maxnum - obj.num)
          },{
            classes: "surplusdesc" + hide(obj.housetype != 2),
            html: "秒杀时限:" + obj.opentime
          }]
        }, page.find(".vpage-content"));
      }
    
      function _createBt(obj, flag){
        var name = '';
        if(flag && fromsrc) {
          if(obj.owneropenid == app.session.openid){
            name = '我的客户';
          }else{
            name = '快速报备';
          }
        }
        $.createElements({
          classes: "bts house-detail",
          components: [{
            classes: "bt",
            onTap: function(){
              if(agentopenid) {
                Page.open("./detail.html", {projectid: obj.preprojectid,agentopenid: agentopenid, houseid: projectid});
              } else {
                Page.open("./detail.html", {projectid: obj.preprojectid});
              }
            },
            components: [{
              classes: "name xq",
              html: "楼盘详情"
            }]
          },{
            classes: "bt",
            onTap: function(){
              if(flag && fromsrc) {
                if(obj.owneropenid == app.session.openid) {
                  Page.open("../market/record-customer.html", {pagetype: 4,projectid: projectid});
                } else {
                  Page.open("../market/recommend-record.html", {type: 1, info: JSON.stringify({}), projectid: projectid});
                }
              } else {
                if(obj.housetype == 2){
                  if(obj.opening != 1 || (obj.maxnum - obj.num) <= 0){
                    return v.ui.alert("当前不能秒杀");
                  }
                }
                _createBooking((obj.housetype == 2?"马上秒杀":"领取优惠劵"),(obj.housetype == 2? 2 : 1),obj);
              }
            },
            components: [{
              classes: "name " + (obj.housetype == 2?"ms":"yy"),
              html: (name ? name : (obj.housetype == 2?"马上秒杀":"领取优惠劵"))
            }]
          }]
        }, page);
      }
    
      function _createSaler(){
        api.request.get("/sq/yx/Agent/getProjectAgent", {
          obj: {
            projectid: projectid
          },
          offset: 0,
          size: 1
        }, {mask:false,}).then(function(response){ var msg = response.data;
          if(true && msg.total > 0) {
    
            var saler = msg.list[0];
    
            $.createElements([{
              classes: "detail-saler",
              onTap: function(){
                location.href = "tel:" + saler.mobile;
              },
              components: [{
                classes: "saler-headimg",
                tag: "img",
                src: saler.imgurl
              },{
                classes: "saler-nickname",
                html: "经理姓名:" + saler.name
              }, {
                classes: "saler-tel",
                html: "联系电话:" + saler.mobile
              }]
            }], document.body);
          }else{
            page.find(".bts").addClass("nobottom");
          }
        });
      }
    
      function _createBooking(title, type, obj){
        var time = 59;
        $.createElements({
          classes: "booking-fixed",
          components: [{
            classes: "booking-box",
            components: [{
              classes: "booking-title",
              html: title
            },{
              classes: 'note-txt',
              html: '请您填写姓名及联系方式，专属置业顾问将很快联系您。'
            },{
              classes: "input-box i2",
              components: [{
                classes: "input-title",
                html: "姓名"
              },{
                classes: "inputpanel",
                components: [{
                  tag: "input",
                  classes: "name"
                }]
              }]
            },{
              classes: "input-box",
              components: [{
                classes: "input-title",
                html: "电话"
              },{
                classes: "inputpanel",
                components: [{
                  tag: "input",
                  classes: "mobile"
                }]
              }]
            },{
              classes: "input-box",
              components: [{
                classes: "input-title",
                html: "验证码"
              },{
                classes: "inputpanel",
                components: [{
                  tag: "input",
                  classes: "vericode"
                }]
              },{
                classes: "input-verify",
                html: "获取验证码",
                onTap: function(){
                  var fixed = $(".booking-fixed");
                  var dom = $(this);
                  if (dom.hasClass('disabled')) {
                    return;
                  }
                  var mobile = fixed.find(".mobile").val();
                  if (Fn.isMobile(mobile)) {
                    dom.addClass('disabled');
                    var ival = setInterval(function() {
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
                    }).then(function(response){ var msg = response.data;
                      if(true){
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
            },{
              classes: "bts",
              components: [{
                classes: "bt",
                html: "取消",
                onTap: function(){
                  var fixed = $(".booking-fixed");
                  fixed.remove();
                }
              },{
                classes: "bt ok",
                html: "确定",
                onTap: function(){
                  var fixed = $(".booking-fixed");
                  var name = fixed.find(".name").val();
                  var mobile = fixed.find(".mobile").val();
                  var vericode = fixed.find(".vericode").val();
                  if(!name || !mobile || !vericode){
                    return v.ui.alert("信息不能为空");
                  }
                  if(!Fn.isMobile(mobile)){
                    return v.ui.alert("电话格式不正确");
                  }
                  app.session.vericode = vericode;
                  var params = {
                      mobile: mobile,
                      name: name,
                      projectid: projectid
                  };
                  if(agentopenid) {
                    $.mixin(params,{agentopenid: agentopenid} ,true);
                  }
                  if(channel) {
                    $.mixin(params,{type: parseInt(channel)} ,true);
                  }
                  api.request.get("/hfz/HfzAppointmentAction/addPreferentialAppointment", {
                    obj: params
                  }).then(function(response){ var msg = response.data;
                    if(true){
                      fixed.remove();
                      return v.ui.alert(msg<0?(type==1?"预约失败": "没有名额了"):"提交成功");
                    }
                  });
                  // if(obj.owneropenid){
                  //   api.request.get("/hfz/HfzAppointmentAction/addPreferentialAppointment", {
                  //     obj: {
                  //       mobile: mobile,
                  //       name: name,
                  //       projectid: projectid,
                  //       agentopenid: agentopenid || obj.owneropenid
                  //     }
                  //   }).then(function(response){ var msg = response.data;
                  //     if(true){
                  //       fixed.remove();
                  //       return v.ui.alert(msg<0?(type==1?"预约失败": "没有名额了"):"提交成功");
                  //     }
                  //   });
                  // }else{
                  //   api.request.get("/sq/my/Reserve/save", {
                  //     obj: {
                  //       mobile: mobile,
                  //       name: name,
                  //       projectid: projectid
                  //     }
                  //   }).then(function(response){ var msg = response.data;
                  //     if(true){
                  //       fixed.remove();
                  //       return v.ui.alert(msg<0?(type==1?"您已经预约过了": "没有名额了"):"提交成功");
                  //     }
                  //   });
                  // }
                }
              }]
            }]
          }]
        }, document.body);
      }
    
      function _createRecord(obj){
        if(obj.owneropenid == app.session.openid){
          $.createElements({
            classes: "recordbt",
            html: "我的客户",
            onTap: function(){
              Page.open("../market/record-customer.html", {pagetype: 4,projectid: projectid});
            }
          }, page.find(".vpage-content"));
        }else{
          $.createElements({
            classes: "recordbt",
            html: "快速报备",
            onTap: function(){
              Page.open("../market/recommend-record.html", {type: 1, info: JSON.stringify({}), projectid: projectid});
            }
          }, page.find(".vpage-content"));
        }
      }
    
      function hide(obj){
        return classname(obj, "hide");
      }
    
      function classname(obj, classname){
        return obj ? " " + classname : ""
      }
    
      app.wechat.SHARE_CALLBACK_OK = function(type){
        api.request.get("/hfz/HfzAppointmentAction/saveShareLog", {
          obj: {
            openid : app.session.openid,
            projectid : projectid,
            type: type
          }
        }, {mask: false}).then(function(response){ var msg = response.data;
        });
      }
    
      function getRTime(time) {
        var timestamp = new Date().getTime();
        var t = time - timestamp;
        if(t > 24 * 60 * 60 * 1000) {
          return '剩' + Math.ceil(t/(24 * 60 * 60 * 1000)) + '天'
        }else{
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
    
  }
})