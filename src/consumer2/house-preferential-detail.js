"use strict";
Page.ready(function($, query) {
  
  return {

    options: {
      wxShareUrl: true
    },
    
    onRender: function() {
      var page = this // 自动生成的代码
      var fopenid = (query.fopenid ? query.fopenid : '')
      var projectid = query.projectid | 0
    
      var memberopenid = (query.memberopenid ? query.memberopenid : '')
      var popup = $('.appointment-popup2')
      var count = 59
      var projectroomid = projectid
      var appmemo
      var pid
      var agentopenid
      var agent = false
    
      //设置分享链接
      setShareUrl(query)

      api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}).then(function(response){ var msg = response.data;
        if((msg.agent && msg.agent.state == 1 && msg.agent.workstate != 0 && msg.agent.type != 3) || (msg.teammember && msg.teammember.state == 1)) {
          agent = true
          agentopenid = app.session.openid
        }
        initPage()
      })
    
    
      function initPage() {
        api.request.get("/global/Project/info", {
          projectid: projectid
        }, {mask:false}).then(function(response){ var msg = response.data;
          if(msg.banner && msg.banner.length) {
            page.find('.banner').removeClass('hide');
            createBanner(msg.banner);
          }
          if(msg.base) {
            // var tmp_datetime = msg.base.deadline.replace(/:/g,'-');
            // tmp_datetime = tmp_datetime.replace(/ /g,'-');
            // var arr = tmp_datetime.split("-");
            // var now = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
            // var time = now.getTime();
            msg.base.booknum = (msg.base.type == 2 ? msg.base.reportcnt : msg.base.num);
            msg.base.id = msg.base.Id;
            // msg.base.time = getRTime(time);
            msg.base.COMMISSION = ((msg.base.commission && agent) ? true : false)
            msg.base.AREADESC = (msg.base.areadesc ? true : false)
            msg.base.NEARBYDESC = (msg.base.nearbydesc ? true : false)
            page.tpl("info", msg.base, page.find(".vpage-content"));
          }
        })
      }
    
      function getRTime(time) {
        var timestamp = new Date().getTime();
        var t = time - timestamp;
        if(t > 24 * 60 * 60 * 1000) {
          return '剩' + Math.ceil(t/(24 * 60 * 60 * 1000)) + '天'
        }else{
          return '今日截止'
        }
      }
    
      //banner
      function createBanner(picList) {
        !function(){
          var h = Math.floor((window.innerWidth * 150) / 320);
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
    
      page.goDetail = function(event, id) {
        Page.open("./detail-new.html", {
          projectid: id,
          fopenid: fopenid,
          memberopenid: memberopenid
        });
      }
    
      page.bookFun = function(event,id) {
        appointment()
        pid = parseInt(id)
      }
    
      //预约
      function appointment() {
        popup.removeClass('hide')
      }
    
      popup.find('.cancel').singleTap(function(){
        popup.addClass('hide');
      });
    
      //发送验证码 按钮
      popup.find('.btn-vericode').singleTap(function() {
        if(popup.find('.btn-vericode').hasClass('disabled')) {
          return;
        }
        var mobile = $('#telnum').val();
        if (Fn.isMobile(mobile)) {
    
          popup.find('.btn-vericode').addClass('disabled');
          var ival = window.setInterval(function(){
            popup.find('.btn-vericode').html(count+'秒后重新获取');
            if(count <= 0) {
              count = 59;
              clearInterval(ival);
              popup.find('.btn-vericode').removeClass('disabled');
              popup.find('.btn-vericode').html('免费获取验证码');
            }else {
              count--;
            }
          },1000);
    
          api.request.get("/global/App/getHfzVericode", {
            mobile: mobile
          }).then(function(response){ var msg = response.data;
            v.ui.alert(code === 0 ? '验证码已通过短信发送到您的手机，稍等一会儿哦' : msg);
          });
        } else if (mobile) {
          return v.ui.alert('请输入正确的手机号码');
        } else {
          return v.ui.alert('请输入手机号码');
        }
      });
    
      popup.find('.submit').singleTap(function() {
        var name = $('#mname').val();
        var mobile = $('#telnum').val();
        var vericode = $('#vericode').val();
    
        if(!name || !mobile) {
          return v.ui.alert('所有项均为必填项');
        }
        if(!Fn.isMobile(mobile)) {
          return v.ui.alert('请输入正确的手机号码');
        }
        if (!vericode) {
          return v.ui.alert('请输入短信验证码');
        }
        var parames = {
          obj:{
            name: name,
            mobile: mobile,
            ispublic: 1,
            projectid: pid
          }
        };
        if(memberopenid){
          $.mixin(parames.obj,{memberopenid:memberopenid, ispublic: 2},true);
        }
        if(projectroomid) {
          $.mixin(parames.obj,{projectroomid:projectroomid},true);
        }
        if(appmemo) {
          $.mixin(parames.obj,{memo:appmemo},true);
        }
        app.session.vericode = vericode;
    
        api.request.get("/hfz/HfzTeamManageAction/addAppointment", parames).then(function(response){ var msg = response.data;
          $('#vericode').val('')
          if(true){
            v.ui.alert('预约成功');
            popup.addClass('hide');
          }
        });
      });
    }
    
  }
})