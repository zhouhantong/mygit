"use strict";
Page.ready(function($, query) {

  var self
  var pid = parseInt(query.projectid)
  var fopenid = (query.fopenid ? query.fopenid : '')
  var teamuuid = (query.teamuuid ? query.teamuuid : '')
  var scroller
  var sliders
  var scale = 1
  var data = []
  var titles = ['','区域介绍','沙盘介绍','楼盘价格图解','户型解析','项目优惠信息']
  var infoObj,userObj,preUserObj,defaultUserObj,houseListObj
  var weixinurl
  var targetEl
  var projectInfo

  var memberopenid = (query.memberopenid ? query.memberopenid : '')
  var popup
  var count = 59
  var projectroomid
  var appmemo

  var cacheKey = 'houseonline-index-' + pid
  var indexCache = $.cache.get(cacheKey) | 0

  var ival
  
  return {

    showContact: false,

    options: {
      scroller: true,
      wxSharable: false,
      sharable: true
    },

    onRender: function() {
      self = this
      popup = $('.appointment-popup2')

      var list = [
        api.request.get("/hfz/HfzOnlineSaleAction/listHfzPic", {
          obj: {
            projectid: pid
          }
        }),
        api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
          obj: {
            openid: app.session.openid
          }
        }),
        api.request.get("/hfz/HfzChannelManageAction/getProjectDefaultAgent", {
          obj: {
            projectid: pid
          }
        }),
        api.request.get('/hfz/HfzAppointmentAction/listHouse', {
          obj: {
            preprojectid: pid,
            // state: 1
          },
          offset: 0,
          size: 100
        }),
        api.request.get('/global/Project/info', { projectid: pid })
      ];
      if(fopenid) {
        list.push(api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
          obj: {
            openid: fopenid
          }
        }))
      }
      list.push(api.request.get("/hfz/HfzTeamManageAction/saveProjectClickLog", {
        obj: {
          projectid: pid
        }
      }))
      list.push(api.addhistory.get({
        projectid: pid
      }))
      Promise.all(list).then((datas) => {
        infoObj = datas[0].data
        userObj = datas[1].data
        defaultUserObj = datas[2].data
        houseListObj = datas[3].data
        projectInfo = datas[4].data
        if (fopenid) {
          preUserObj = datas[5].data
        }
        //设置联系人
        if(preUserObj) {
          this.showContact = true
          //判断是否经纪人
          if(preUserObj.agent && preUserObj.agent.state == 1 && preUserObj.agent.workstate != 0 && preUserObj.agent.type != 3) {
            this.contactName = preUserObj.agent.name
            this.contactMobile = preUserObj.agent.mobile
            weixinurl = getImagePath(preUserObj.agent.wxqrcode)
            $('.qrcode-box img').attr('src',getImagePath(preUserObj.agent.wxqrcode))
          } else if(preUserObj.teammember && preUserObj.teammember.state == 1) {
            this.contactName = preUserObj.teammember.name
            this.contactMobile = preUserObj.teammember.mobile
            weixinurl = getImagePath(preUserObj.teammember.wxqrcode)
            $('.qrcode-box img').attr('src',getImagePath(preUserObj.teammember.wxqrcode))
          } else {
            if(defaultUserObj && defaultUserObj.state == 1 && defaultUserObj.workstate != 0) {
              this.contactName = defaultUserObj.name
              this.contactMobile = defaultUserObj.mobile
              weixinurl = getImagePath(defaultUserObj.wxqrcode)
              $('.qrcode-box img').attr('src',getImagePath(defaultUserObj.wxqrcode))
            } else {
              this.showContact = false
            }
          }
        } else if(defaultUserObj && defaultUserObj.state == 1 && defaultUserObj.workstate != 0) {
          this.contactName = defaultUserObj.name
          this.contactMobile = defaultUserObj.mobile
          weixinurl = getImagePath(defaultUserObj.wxqrcode)
          $('.qrcode-box img').attr('src',getImagePath(defaultUserObj.wxqrcode))
          //默认置业顾问
          this.showContact = true
        } else {
          this.showContact = false
        }
        //设置分享链接
        if(userObj) {
          if(userObj.agent && userObj.agent.state == 1 && userObj.agent.workstate != 0 && userObj.agent.type != 3) {
            //是经纪人
            app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/house-online.html?fopenid='+app.session.openid+'&projectid='+pid+'&memberopenid='+app.session.openid;
          } else if(userObj.teammember && userObj.teammember.state == 1) {
            //是队员或队长
            app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/house-online.html?fopenid='+userObj.teammember.leaderopenid+'&projectid='+pid+'&memberopenid='+app.session.openid;
          }
        }
        //设置分享文案
        if(projectInfo.base) {
          if(projectInfo.base.sharelogurl) {
            app.wechat.SHARE_IMG_URL = projectInfo.base.sharelogurl;
          }
          if(projectInfo.base.sharedesc) {
            app.wechat.SHARE_TITLE = projectInfo.base.sharedesc;
            app.wechat.SHARE_DESC = projectInfo.base.sharedesc;
            app.wechat.SHARE_TIMELINE_TITLE = projectInfo.base.sharedesc;
          }
        }

        if(app.wechat.SHARE_LINK) {
          app.wechat.SHARE_LINK = v.url.build({
            hsrc: 'hfz20160623'
          }, app.wechat.SHARE_LINK)
        } else {
          if(!query.hsrc) {
            app.wechat.SHARE_LINK = v.url.build({
              hsrc: 'hfz20160623'
            }, location.href)
          }
        }
        
        /* app.wxjsapk.init() */;
        wechat.init();

        if(infoObj.total) {
          // page.find('.index-layer .right').text(infoObj.total);
          setSliderPage(infoObj.list);
        }
      });

      function setSliderPage(list) {
        list.forEach(function(item,index){
          setPage(item,index,list.length)
        })
    
        sliders = new v.ui.Carousel({
          index: indexCache | 0,
          length: data.length,
          mode: 'book'
        }).on('change', function(event) {
          var idx = this.index
          var el = this.el
          var pageEl = el.find('.online-article');
          if (pageEl && pageEl.length) {
            var layerEl = el.find('.right-layer');
            if (idx == data.length - 1) {
              layerEl.addClass('hide')
            } else {
              layerEl.removeClass('hide')
            }
            Page.setTitle(data[idx].dataTitle)
            $.cache.set(cacheKey, idx, 60 * 60)
          }
        }).on('update', function(event) {
          var el = event.el.empty()
          var index = event.index
          var pageEl = $(this.centerEl).find('.online-article');
          var centerEl = this.centerEl[0]
          if (index < 0 || index >= data.length) {
            if (scroller) {
              scroller.destroy()
            }
            if (pageEl && pageEl.length && centerEl.scrollHeight > $.env.screen.height) {
              scroller = new IScroll(centerEl, {hScroll: false})
            }
            return false;
          }
          $.createElements(data[index], el);


          el.find('img').forEach(function (img) {
            img.onload = function () {
              if (centerEl.scrollHeight > $.env.screen.height) {
                if (scroller) {
                  scroller.destroy()
                }
                scroller = new IScroll(centerEl, {hScroll: false})
              }
            }
          })
        }).render(self.find('.vpage-content'));
      }
    
      // var listenScroller = function() {
      //   if(scroller) {
      //     scroller.on('scrollEnd',function(){
      //       !function(){
      //         sliders.dragging = false
      //         sliders.snapping = false
      //       }.defer(200)
      //     },false);
      //     scroller.on('scroll',function(){
      //       if(Math.abs(Math.abs(this.y)-Math.abs(this.absStartY)) >= 5) {
      //         sliders.dragging = true
      //         sliders.snapping = true
      //       }
      //     },false);
      //   }else {
      //     setTimeout(listenScroller, 100);
      //   }
      // };
      // setTimeout(listenScroller, 100);
    
      function setPage(obj,idx,total) {
        switch(obj.type) {
          case 1:
            data.push({
              classes: 'online-article',
              dataIdx: idx,
              dataTitle: obj.projectname,
              components: [{
                classes: 'homebg',
                tag: 'img',
                // style: 'height: '+$.env.screen.height+'px;widht: '+$.env.screen.widht+'px;background:url("'+obj.bpicurl+'") no-repeat center center;background-size: cover'
                src: obj.bpicurl
              }]
            })
            break;
          case 6:
            data.push({
              classes: 'online-article',
              dataIdx: idx,
              dataTitle: titles[obj.type - 1],
              components: [{
                classes: 'top-layer ' + (self.showContact ? '' : 'hide'),
                components: [{
                  classes: 'left',
                  components: [{
                    text: '您好！我是好房子置业顾问'+self.contactName+'，'
                  },{
                    text: '更多信息请给我打电话或者加我微信噢！'
                  }]
                },{
                  classes: 'mobile',
                  onSingleTap: function(){
                    location.href = 'tel:' + self.contactMobile
                  }
                },{
                  classes: 'weixin ' + (weixinurl ? '' : 'disabled'),
                  onSingleTap: function() {
                    if(weixinurl) {
                      if(!$.env.ios) {
                        $('.qrcode-box').removeClass('hide')
                        $('.qrcode-box').addClass('hasanimation')
                      }else {
                        wechat.previewImage({
                          current: weixinurl,
                          urls: [weixinurl]
                        });
                      }
                    }
                  }
                }]
              },{
                classes: 'title-bar',
                components: [{
                  classes: 'title nobefore',
                  text: '价格信息'
                },{
                  classes: 'page-index',
                  html: '<span>'+(idx+1)+'</span>/' + total
                }]
              },{
                classes: 'desc-box',
                components: [obj.price1 ? {
                  classes: 'subdesc',
                  text: obj.price1
                } : $.nop,obj.price2 ? {
                  classes: 'subdesc',
                  text: obj.price2
                } : $.nop,obj.price3 ? {
                  classes: 'subdesc',
                  text: obj.price3
                } : $.nop,obj.price4 ? {
                  classes: 'subdesc',
                  text: obj.price4
                } : $.nop]
              },{
                classes: 'title-bar',
                components: [{
                  classes: 'title nobefore',
                  text: obj.title
                }]
              },{
                classes: 'desc-box',
                components: [obj.line1 ? {
                  classes: 'subdesc',
                  text: obj.line1
                } : $.nop,obj.line2 ? {
                  classes: 'subdesc',
                  text: obj.line2
                } : $.nop,obj.line3 ? {
                  classes: 'subdesc',
                  text: obj.line3
                } : $.nop,obj.line4 ? {
                  classes: 'subdesc',
                  text: obj.line4
                } : $.nop]
              },{
                classes: 'btn-bar ',
                components: [{
                  text: '预约看房',
                  onSingleTap: function() {
                    appointment('')
                  }
                }]
              },houseListObj.total > 0 ? {
                classes: 'subtitle',
                text: '项目特惠好房列表'
              } : $.nop,{
                classes: 'list',
                components: houseListObj.list.map(function(item){
                  return {
                    classes: 'item',
                    onSingleTap: function(event) {
                      if($(event.target).hasClass('yybtn')) {
                        return
                      }
                      Page.open("./house-preferential-detail.html", {
                        projectid: item.id,
                        fopenid: fopenid,
                        memberopenid: memberopenid,
                      });
                    },
                    components: [{
                      tag: 'img',
                      src: item.picurl
                    },{
                      classes: 'center-pannel',
                      components: [{
                        classes: 'ititle',
                        text: item.structure
                      },{
                        classes: 'old-price',
                        text: '原价：' + item.propertyexpense
                      },{
                        classes: 'price',
                        text: '线上专享价：' + item.price
                      }]
                    },{
                      classes: 'right-pannel',
                      components: [{
                        // classes: 'yybtn',
                        // text: '预约',
                        // onSingleTap: function(event) {
                        //   projectroomid = item.id
                        //   targetEl = $(event.target).closest('.item')
                        //   appointment(item.structure)
                        // }
                        text: '详情'
                      },{
                        html: '<span>' + (item.type == 2 ? item.reportcnt : item.num) + '</span>人预约'
                      },{
                        text: ''
                      }]
                    }]
                  }
                })
              }]
            })
            break;
          default:
            if(obj.type == 5 && DEVMODE) {
              console.log('====>',obj.area,obj.price)
            }
            data.push({
              classes: 'online-article',
              dataIdx: idx,
              dataTitle: titles[obj.type - 1],
              components: [{
                classes: 'top-layer ' + (self.showContact ? '' : 'hide'),
                components: [{
                  classes: 'left',
                  components: [{
                    text: '您好！我是好房子置业顾问'+self.contactName+'，'
                  },{
                    text: '更多信息请给我打电话或者加我微信噢！'
                  }]
                },{
                  classes: 'mobile',
                  onSingleTap: function(){
                    location.href = 'tel:' + self.contactMobile
                  }
                },{
                  classes: 'weixin ' + (weixinurl ? '' : 'disabled'),
                  onSingleTap: function() {
                    if(weixinurl) {
                      if(!$.env.ios) {
                        $('.qrcode-box').removeClass('hide')
                        $('.qrcode-box').addClass('hasanimation')
                      }else {
                        wechat.previewImage({
                          current: weixinurl,
                          urls: [weixinurl]
                        });
                      }
                    }
                  }
                }]
              },{
                classes: 'title-bar',
                components: [{
                  classes: 'title',
                  text: obj.title
                },{
                  classes: 'page-index',
                  html: '<span>'+(idx+1)+'</span>/' + total
                }]
              },{
                classes: 'pic-layer',
                // onSingleTap: function() {
                //   app.loading.start();
                //   var img = new Image()
                //   img.onload = function() {
                //     app.loading.stop();
                //     $('.bigimg-box img').attr('src',obj.bpicurl)
                //     $('.bigimg-box').removeClass('hide')
                //     $('.bigimg-box').addClass('hasanimation')
                //     // new IScroll($('.bigimg-box')[0])
                //     var zooming = false
                //     $('.bigimg-box img').on('pinch',function(event) {
                //       if(!zooming) {
                //         zooming = true
                //         var zoomValue = (event.scale < 1 ? 1 : (event.scale > 3 ? 3 : event.scale))
                //         new $.Animator({
                //           startValue: scale,
                //           endValue: zoomValue,
                //           duration: 500,
                //           onStep: function() {
                //             $('.bigimg-box img').style('transform', 'scale('+this.value+')')
                //           },
                //           onEnd: function() {
                //             scale = zoomValue
                //             zooming = false
                //           }
                //         }).start();
                //       }
                //     })
                //   }
                //   img.src = obj.bpicurl
                // },
                components: [{
                  tag: 'img',
                  src: obj.spicurl,
                  onSingleTap: function() {
                    wechat.previewImage({
                      current: obj.bpicurl,
                      urls: [obj.bpicurl]
                    });
                  }
                },{
                  classes: 'icon-large'
                }]
              // },{
              //   classes: 'btn-layer ' + (obj.type == 2 ? '' : 'hide'),
              //   components: [{
              //     classes: 'jj ' + (projectInfo.base.streetpanorama ? '' : hide),
              //     onSingleTap: function() {
              //       Page.open('http://map.qq.com/#pano='+projectInfo.base.streetpanorama+'&heading=0&pitch=0&zoom=1');
              //     },
              //     text: '实时街景'
              //   },{
              //     classes: 'ms',
              //     onSingleTap: function() {
              //       Page.open('../local-detail.html?latitude='+projectInfo.base.latitude+'&longitude='+projectInfo.base.longitude+'&category=美食');
              //     },
              //     text: '周边美食'
              //   },{
              //     classes: 'gw',
              //     onSingleTap: function() {
              //       Page.open('../local-detail.html?latitude='+projectInfo.base.latitude+'&longitude='+projectInfo.base.longitude+'&category=购物');
              //     },
              //     text: '周边购物'
              //   },{
              //     classes: 'jc',
              //     onSingleTap: function() {
              //       Page.open('./local-more.html',{
              //         latitude: projectInfo.base.latitude,
              //         longitude: projectInfo.base.longitude,
              //         projectid: pid,
              //       },false);
              //     },
              //     text: '更多精彩'
              //   }]
              },{
                // classes: 'btn-bar ' + (obj.type == 2 ? 'hide' : ''),
                classes: 'btn-bar ',
                components: [{
                  text: '预约看房',
                  onSingleTap: function() {
                    appointment(obj.type == 5 ? obj.title : '')
                  }
                },{
                  onSingleTap: function(event){
                    if($(event.target).hasClass('disabled')) {
                      return
                    }
                    Page.open('./house-calculate.html',{
                      fopenid: fopenid,
                      memberopenid: memberopenid,
                      id: obj.id,
                      projectid: obj.projectid,
                      title: encodeURIComponent(obj.title),
                      price: obj.price,
                      area: obj.area,
                      lowtotal: (obj.lowtotal ? obj.lowtotal : ''),
                      hightotal: (obj.hightotal ? obj.hightotal : '')
                    })
                  },
                  classes: (obj.type == 5 ? ((obj.area && obj.area > 0 && obj.price && obj.price > 0) ? '' : 'disabled') : 'hide'),
                  text: '我要算价'
                }]
              },{
                classes: 'subtitle',
                text: obj.subtitle
              },{
                classes: 'desc-box',
                components: [obj.line1 ? {
                  classes: 'subdesc',
                  text: obj.line1
                } : $.nop,obj.line2 ? {
                  classes: 'subdesc',
                  text: obj.line2
                } : $.nop,obj.line3 ? {
                  classes: 'subdesc',
                  text: obj.line3
                } : $.nop,obj.line4 ? {
                  classes: 'subdesc',
                  text: obj.line4
                } : $.nop]
              }]
            })
            break;
        }
      }
    
      function getImagePath(path) {
        if(path) {
          if (DEBUG) {
            return 'http://htzs.dev.wx.webhante.com' + path;
          }
          return location.protocol + '//' + location.host + path
        }else {
          return ''
        }
      }
    
      // $('.bigimg-box').singleTap(function(){
      //   $('.bigimg-box').addClass('hide')
      //   $('.bigimg-box').removeClass('hasanimation')
      //   $('.bigimg-box img').style('transform', 'scale(1)')
      // })
    
      $('.qrcode-box').singleTap(function(){
        $('.qrcode-box').addClass('hide')
        $('.qrcode-box').removeClass('hasanimation')
      })
    
      //预约
      function appointment(memo) {
        popup.removeClass('hide')
        appmemo = memo
      }
    
      popup.find('.cancel').singleTap(function(){
        targetEl = ''
        projectroomid = ''
        popup.addClass('hide');
      });

      popup.find('#telnum').on('input', function(){
        var mobile = $('#telnum').val();
        if(mobile){
          clearInterval(ival)
          popup.find('.btn-vericode').removeClass('disabled')
          popup.find('.btn-vericode').html('免费获取验证码')
        }
      })
    
      //发送验证码 按钮
      popup.find('.btn-vericode').singleTap(function() {
        if(popup.find('.btn-vericode').hasClass('disabled')) {
          return;
        }
        var mobile = $('#telnum').val();
        if (Fn.isMobile(mobile)) {
    
          popup.find('.btn-vericode').addClass('disabled');
          ival = window.setInterval(function(){
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
            v.ui.alert('验证码已通过短信发送到您的手机，稍等一会儿哦');
          }).catch(e=>v.ui.alert(e.response.errmsg));
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
          if(targetEl && projectroomid) {
            var c = parseInt(targetEl.find('span').text())
            c++
            targetEl.find('span').text(c)
          }
          targetEl = '';
          projectroomid = '';
          v.ui.alert('预约成功');
          popup.addClass('hide');
        }).catch(e=>v.ui.alert(e.response.errmsg));
      });
    
      app.wechat.SHARE_CALLBACK_OK = function(type){
        var params = {
          openid: app.session.openid,
          projectid: pid
        }
        if(teamuuid) {
          $.mixin(params,{teamuuid: teamuuid},true)
        }
        api.request.get("/hfz/HfzTeamManageAction/addShareLog", {
          obj: params
        }, {
          mask: false
        }).then(function(response){ var msg = response.data;
    
        });
      }
    }
    
  }
})