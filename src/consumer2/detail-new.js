"use strict";
Page.ready(function($, query) {

  var self;

  var fopenid = (query.fopenid ? query.fopenid : '')
  var memberopenid = (query.memberopenid ? query.memberopenid : '')
  var projectid = query.projectid ? parseInt(query.projectid) : ''

  var userObj, preUserObj, defaultUserObj

  return {
    name: 'detail',
    options: {
      autoRender: false,
      sharable: true
    },
    init: function(){
      self = this;

      //添加浏览记录
      api.addhistory.get({
        projectid: projectid
      }, {
        mask: false
      }).then(function(response) {
        var msg = response.data;
      });

      getListItem(11, self.newInit);

      self.find(".actbtn.x2").singleTap(function(){
        self.createBooking("看房预约", 1);
      });
      self.find(".actbtn.x1").singleTap(function(){
        self.createBooking("优惠及开盘通知", 2);
      });
    },
    newInit: function(){
      var list = [
        api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
          obj: {
            openid: app.session.openid
          }
        }),
        api.request.get("/hfz/HfzChannelManageAction/getProjectDefaultAgent", {
          obj: {
            projectid: projectid
          }
        })
      ];
      if (fopenid) {
        list.push(api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
          obj: {
            openid: fopenid
          }
        }))
      }
      list.push(api.request.get("/hfz/HfzTeamManageAction/saveProjectClickLog", {
        obj: {
          projectid: projectid
        }
      }))
      Promise.all(list).then(function(datas) {
        userObj = datas[0].msg
        defaultUserObj = datas[1].msg
        if (fopenid) {
          preUserObj = datas[2].msg
        }
        //设置分享链接
        if (userObj) {
          if (userObj.agent && userObj.agent.state == 1 && userObj.agent.workstate != 0 && userObj.agent.type != 3) {
            //是经纪人
            app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/detail-new.html?fopenid=' + app.session.openid + '&projectid=' + projectid + '&memberopenid=' + app.session.openid;
          } else if (userObj.teammember && userObj.teammember.state == 1) {
            //是队员或队长
            app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/detail-new.html?fopenid=' + userObj.teammember.leaderopenid + '&projectid=' + projectid + '&memberopenid=' + app.session.openid;
          }
        }
        wechat.init();
        self.getInfo();
      });
    },
    getInfo: function(){
      api.info.get({
        projectid: projectid
      }).then(function(response) {
        var msg = response.data;
        if (msg) {

          app.wechat.SHARE_FRIEND = {
            SHARE_TITLE: msg.base.projectname,
            SHARE_DESC: '',
          };
          app.wechat.SHARE_TIMELINE = {
            SHARE_TITLE: msg.base.projectname,
          };

          // $('title').text(msg.base.projectname);
          Page.setTitle(msg.base.projectname)
          if (msg.banner && msg.banner.length) {
            //创建banner
            self.find('.banner').removeClass('hide');
            self.createBanner(msg.banner);
          }
          //楼盘简介
          self.createLpDesc(msg.base, msg.isfavorate);
          //周边精彩
          self.createZbIcons(msg.base);
          //一网打尽
          self.createAllSearch(msg.base);
          if (msg.base.sofunnew || msg.base.lejunew) {
            //最新动态
            // createZxdt(msg.base);
          }
          //精彩评论
          if (msg.replies && msg.replies.length) {
            createReplies(msg.replies, msg.base);
            self.find('.project-reply').removeClass('hide');
          }
          //操作
          self.find('.actbar').removeClass('hide');
          //底部菜单
          // app.createXkbMenu(projectid, msg.base.tourl);
          //置业顾问
          // if(app.id == 'wxf086e007bcb43b69') {
          //   api.request.get("/global/Project/hasValidPreferen", {
          //     obj: {
          //       projectid: projectid
          //     }
          //   }).then(function(response){ var msg = response.data;
          //     if(msg <= 0) {
          //       createSaler();
          //     }
          //   })
          // } else {
          //   createSaler();
          // }
          self.createSaler();
        }
      });
    },
    createBanner: function(picList){
      var len = picList.length;
      if (len > 1) {
        $.createElements({
          classes: 'banner-indicate',
          components: [{
            tag: 'ul',
            components: picList.map(function() {
              return {
                tag: 'li'
              }
            })
          }]
        }, '.vpage-content .banner');
        var data = [];
        for (var i = 0; i < len; i++) {
          data.push({
            classes: 'banner-img',
            onTap: function() {},
            dataIndex: i,
            components: [{
              tag: 'img',
              src: app.BASE_URL + picList[i].picurl
            }]
          });
        }
        new v.ui.Carousel({
          index: 0,
          length: data.length,
          mode: 'book'
        }).on('update', function(event){
          var el = event.el.empty()
          var index = event.index
          $.createElements(data[index], el);
        }).on('change', function(event){
          var idx = this.index
          var el = this.el
          el.find("li").removeClass('hightlight')
          el.find('li:nth-child('+(idx + 1)+')').addClass('hightlight')
        }).render(self.find('.banner'));
      } else {
        $.createElements({
          tag: 'img',
          src: app.BASE_URL + picList[0].picurl
        }, '.vpage-content .banner');
      }
    },
    createLpDesc: function(info,favorite) {
      $.createElements({
        classes: 'pro-infomation',
        components: [{
          classes: 'header-info hflexbox',
          components: [{
            classes: 'title',
            text: info.projectname
          }, {
            classes: 'favorite ' + (favorite == 1 ? ' f2' : '')
          }, {
            onSingleTap: function() {
              Page.open('http://api.map.baidu.com/marker?location=' + info.latitude + ',' + info.longitude + '&title=' + info.projectname + '&content=' + info.projectname + '&output=html');
            },
            classes: 'navigation ' + ((info.longitude && info.latitude) ? '' : 'hide'),
          }]
        }, {
          classes: 'info-desc hflexbox',
          components: [{
            text: '价格：' + info.price,
          }, {
            onSingleTap: function() {
              api.request.get("/global/Project/listManagerPrice", {
                obj: {
                  projectid: projectid,
                }
              }).then(function(response) {
                var msg = response.data;
                if (true) {
                  if (msg.total > 0) {
                    $.createElements({
                      classes: 'scrim popup-manage-price',
                      components: [{
                        classes: 'rank-wrapper',
                        components: [{
                          classes: 'info-box',
                          components: [{
                            classes: 'info-head',
                            text: '经理报价列表'
                          }, {
                            classes: 'info-top',
                            components: [{
                              classes: 'scroll-list',
                              components: [{
                                classes: 'rank-list',
                                components: msg.list.map(function(item) {
                                  return {
                                    classes: 'rank-item',
                                    components: [{
                                      classes: 'title',
                                      text: item.housetype
                                    }, {
                                      text: '面积：' + item.area
                                    }, {
                                      text: '房号：' + item.roomno
                                    }, {
                                      text: '原总价：' + item.price
                                    }, {
                                      html: '本周经理报价：<span>' + item.managerprice + '</span>'
                                    }]
                                  }
                                })
                              }]
                            }]
                          }, {
                            classes: 'info-bottom',
                            text: '关 闭',
                            onSingleTap: function() {
                              $('.popup-manage-price').remove();
                            }
                          }]
                        }]
                      }]
                    }, document.body);
                    new IScroll('.scroll-list');
                  } else {
                    alert('暂无经理报价');
                  }
                }
              });

              api.request.get("/hfz/HfzChannelManageAction/saveManagerRecord", {
                obj: {
                  projectid: projectid,
                }
              }, {
                mask: false
              }).then(function(response) {
                var msg = response.data;
              });

            },
            classes: 'hasmanagerprice ' + (info.hasmanagerprice ? '' : 'hide'),
            text: '本周经理报价'
          }]
        }, {
          classes: 'info-desc wy',
          text: '物业类型：',
        }, {
          classes: 'info-desc',
          // html: '接待处地址：<span class="addr">' + info.address + '</span>'
          html: '接待处地址：' + info.address
            // },{
            //   classes: 'info-desc',
            //   html: '开盘时间：<span>' + info.opentime + '</span>'
        }, {
          classes: 'info-desc ' + (info.discountdesc ? '' : 'hide'),
          html: '优惠描述：' + info.discountdesc
        }, {
          classes: 'tagheader',
          components: [{
            classes: 'tagborder ' + (info.issubway == 1 ? '' : 'hide'),
            text: commonListItem[1]
          }, {
            classes: 'tagborder ' + (info.isxuequ == 1 ? '' : 'hide'),
            text: commonListItem[2]
          }, {
            classes: 'tagborder ' + (info.brand ? '' : 'hide'),
            text: commonListItem[0]
          }, {
            classes: 'more',
            text: '更多',
            onTap: function() {
              Fn.addHistoryLog(projectid, 1);
              Page.open('./detail-more.html', {
                projectid: projectid
              }, false);
            }
          }]
        }]
      }, '.vpage-content .project-info');

      var str = '';
      api.listItemCache.get({
        titleids: [3]
      }).then(function(response) {
        var msg = response.data;
        msg[3].forEach(function(item) {
          if (item.itemid == info.properties1 || item.itemid == info.properties2 || item.itemid == info.properties3 || item.itemid == info.properties4 || item.itemid == info.properties5) {
            str = str + item.itemtext + '、';
          }
        });
        if (str) {
          self.find('.info-desc.wy').html('物业类型：' + str.substring(0, str.length - 1));
        }
      });

      self.find('.project-info').removeClass('hide');
      self.find('.favorite').singleTap(function() {
        if (self.find('.favorite').hasClass('f2')) {
          return;
        } else {
          api.addfavorite.get({
            projectid: projectid
          }, {
            mask: false
          }).then(function(response) {
            var msg = response.data;
            self.find('.favorite').addClass('f2');
          });
        }
      });
    },
    createZbIcons: function(info){
      $.createElements([{
        // classes: 'common-header-item',
        // text: '周边精彩'
      }, {
        classes: 'icons-item',
        components: [{
          classes: 'item-icon-txt hasafter ' + (info.streetpanorama ? '' : 'hide'),
          onTap: function() {
            Fn.addHistoryLog(projectid, 3);
            if (projectid == 230) {
              Page.open('./vtour/tour.html');
            } else {
              Page.open('http://map.qq.com/#pano=' + info.streetpanorama + '&heading=0&pitch=0&zoom=1');
            }
            // Page.open('./pano.html',{
            //   streetpanorama: info.streetpanorama
            // },false);
          },
          components: [{
            classes: 'icon jj',
          }, {
            text: '实时街景'
          }]
        }, {
          classes: 'item-icon-txt hasafter',
          onTap: function() {
            Fn.addHistoryLog(projectid, 8);
            Page.open('../local-detail.html?latitude=' + info.latitude + '&longitude=' + info.longitude + '&category=美食');
          },
          components: [{
            classes: 'icon ms',
          }, {
            text: '周边美食'
          }]
        }, {
          classes: 'item-icon-txt hasafter',
          onTap: function() {
            Fn.addHistoryLog(projectid, 8);
            Page.open('../local-detail.html?latitude=' + info.latitude + '&longitude=' + info.longitude + '&category=购物');
          },
          components: [{
            classes: 'icon gw',
          }, {
            text: '周边购物'
          }]
        }, {
          classes: 'item-icon-txt',
          onTap: function() {
            Fn.addHistoryLog(projectid, 8);
            Page.open('./local-more.html', {
              latitude: info.latitude,
              longitude: info.longitude,
              projectid: projectid,
            }, false);
          },
          components: [{
            classes: 'icon more',
          }, {
            text: '更多精彩'
          }]
        }]
      }], '.vpage-content .project-zb');
      self.find('.project-zb').removeClass('hide');
    },
    createAllSearch: function(info) {
      var data = [{
        //   src: 'images/icon-xkb.png',
        //   text: '新快网有关<span>'+info.projectname+'</span>的精彩文章集合',
        //   url: (app.id == 'wx723631547c0fc984' ? 'http://www.baidu.com/baidu?word='+info.projectname+'&tn=bds&cl=3&si=xkb.com.cn&ct=2097152' : '')
        // },{
        src: 'images/icon-weixin.png',
        text: '微信里搜索有关<span>' + info.projectname + '</span>的所有最新资讯和公众号',
        url: 'http://weixin.sogou.com/weixinwap?type=2&query=' + info.projectname + '&city=广州&latitude=' + info.latitude + '&longitude=' + info.longitude
      }, {
        src: 'images/icon-baidu.png',
        text: '全球最大中文搜索引擎的<span>' + info.projectname + '</span>搜索结果',
        url: 'http://m.baidu.com/s?word=' + info.projectname + '&city=广州&latitude=' + info.latitude + '&longitude=' + info.longitude
      }, {
        //   src: 'images/icon-soufang.png',
        //   text: '国内主流的房地产网络搜房里看<span>'+info.projectname+'</span>',
        //   url: (info.soufunurl ? info.soufunurl : '')
        // },{
        src: 'images/icon-txfc.png',
        text: ' 腾讯房产里关于<span>' + info.projectname + '</span>的新鲜资讯，首次进入需要选一下城市呦',
        url: info.qqurl || 'http://m.db.house.qq.com/index.php?mod=searchhouse&act=searchlist&all=' + info.projectname
          // },{
          //   src: 'images/icon-kdlj.png',
          //   text: '在中国房地产家居网络传媒市场主流媒体口袋乐居查看<span>'+info.projectname+'</span>',
          //   url: info.lejuurl || 'http://m.leju.com/?site=touch&ctl=house&act=search&city=gz&keyword='+info.projectname
      }, {
        src: 'images/icon-shjd.png',
        text: '在搜狐焦点搜索及时全面的<span>' + info.projectname + '</span>资讯',
        url: (info.sohuurl ? info.sohuurl : '')
      }];
      var items = data.map(function(item) {
        return {
          classes: 'common-cell-item ' + (item.url ? '' : 'hide'),
          onTap: function() {
            Fn.addHistoryLog(projectid, 4);
            if (item.url) {
              Page.open(item.url);
            }
          },
          components: [{
            tag: 'img',
            src: item.src
          }, {
            classes: 'common-cell-body',
            components: [{
              classes: 'common-cell-content',
              components: [{
                classes: 'common-cell-text',
                html: item.text
              }]
            }]
          }]
        };
      });
      $.createElements([{
        classes: 'common-header-item',
        text: '一网打尽',
        components: [{
          onTap: function() {
            Page.open('./search-inter.html', {
              projectid: projectid,
            }, false);
          },
          classes: 'more',
          text: '更多'
        }]
      }, {
        components: items
      }], '.vpage-content .project-all');
      self.find('.project-all').removeClass('hide');
    },
    createSaler: function(){
      var showContact = false
      var list = []

      if (preUserObj) {
        this.showContact = true
          //判断是否经纪人
        if (preUserObj.agent && preUserObj.agent.state == 1 && preUserObj.agent.workstate != 0 && preUserObj.agent.type != 3) {
          list.push({
            name: preUserObj.agent.name,
            mobile: preUserObj.agent.mobile,
            headimgurl: preUserObj.agent.headimgurl
          })
        } else if (preUserObj.teammember && preUserObj.teammember.state == 1) {
          list.push({
            name: preUserObj.teammember.name,
            mobile: preUserObj.teammember.mobile,
            headimgurl: preUserObj.team.headimgurl
          })
        } else {
          if (defaultUserObj && defaultUserObj.state == 1 && defaultUserObj.workstate != 0) {
            list.push({
              name: defaultUserObj.name,
              mobile: defaultUserObj.mobile,
              headimgurl: defaultUserObj.headimgurl
            })
          } else {
            showContact = false
          }
        }
      } else if (defaultUserObj && defaultUserObj.state == 1 && defaultUserObj.workstate != 0) {
        list.push({
            name: defaultUserObj.name,
            mobile: defaultUserObj.mobile,
            headimgurl: defaultUserObj.headimgurl
          })
          //默认置业顾问
        showContact = true
      } else {
        showContact = false
      }
      if (showContact) {
        $.createElements([{
          classes: 'common-header-item hflexbox',
          text: '置业顾问',
          components: [{
            classes: 'saler-txt',
            text: '点击头像拨打电话'
          }]
        }, {
          classes: 'saler-common-item',
          components: list.map(function(item, index) {
            return {
              classes: 'saler-common-body',
              onSingleTap: function() {
                location.href = 'tel:' + item.mobile;
                return false;
              },
              components: [{
                classes: 'imgheader',
                components: [{
                  tag: 'img',
                  src: item.headimgurl
                }, {
                  classes: 'headbg'
                }]
              }, {
                classes: 'name',
                text: item.name
              }, {
                classes: 'stars',
                components: self.starts(5)
              }]
            }
          })
        }], '.vpage-content .project-saler');
        self.find('.project-saler').removeClass('hide');
      }
    },
    createReplies: function(replies,info) {
      var items = replies.map(function(item) {
        preloadImage(item.headimgurl);
        return {
          classes: 'reply-cell-item',
          components: [{
            tag: 'img',
            src: item.headimgurl || '../images/head.jpg',
          }, {
            classes: 'reply-cell-body',
            components: [{
              classes: 'reply-cell-header',
              components: [{
                classes: 'name',
                text: item.name || item.nickname || '游客'
              }, {
                classes: 'time',
                text: Fn.getTime(item.createtime)
                  // },{
                  //   classes: 'icon stamp'
                  // },{
                  //   classes: 'icon assist'
              }]
            }, {
              classes: 'reply-cell-desc',
              text: item.content
            }]
          }]
        };
      });
      $.createElements([{
        classes: 'common-header-item hflexbox',
        // html: '精彩评论 <span>('+count+'评)</span>'
        html: '精彩评论',
        components: [{
          classes: 'comment-detail hflexbox',
          components: [{
            html: '&nbsp;(' + info.replyamount + '评 '
          }, {
            classes: 'assist',
            html: '&nbsp;&nbsp;' + info.likeamount
          }, {
            classes: 'stamp',
            html: '&nbsp;&nbsp;' + info.dislikeamount
          }, {
            text: ')'
          }]
        }, {
          onTap: function() {
            Page.open('./forum.html', {
              projectid: projectid,
            }, false);
          },
          classes: 'more',
          text: '更多'
        }]
      }, {
        components: items
      }], '.vpage-content .project-reply');
    },
    starts: function(num){
      var count = 5;
      var starts = [];
      for(var i = 1;i <= count; i++){
        if(num > i && num < i+1) {
          starts.push({
            classes: ('star-hl')
          });
        } else if(num < i) {
          starts.push({
            classes: ('star-dark')
          });
        } else {
          starts.push({
            classes: ('star')
          });
        }
      }
      return starts;
    },
    createBooking: function(title, type){
      var time = 59;
      $.createElements({
        classes: "booking-fixed",
        components: [{
          classes: "booking-box",
          components: [{
            classes: "booking-title",
            html: title
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
              onTap: function() {
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
                  }).then(function(response) {
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
            classes: "bts",
            components: [{
              classes: "bt",
              html: "取消",
              onTap: function() {
                var fixed = $(".booking-fixed");
                fixed.remove();
              }
            }, {
              classes: "bt ok",
              html: "确定",
              onTap: function() {
                var fixed = $(".booking-fixed");
                var name = fixed.find(".name").val();
                var mobile = fixed.find(".mobile").val();
                var vericode = fixed.find(".vericode").val();
                if (!name || !mobile || !vericode) {
                  return v.ui.alert("信息不能为空");
                }
                if (!Fn.isMobile(mobile)) {
                  return v.ui.alert("电话格式不正确");
                }
                app.session.vericode = vericode;

                if (type == 1) {
                  var parames = {
                    obj: {
                      name: name,
                      mobile: mobile,
                      ispublic: 1,
                      projectid: projectid
                    }
                  };
                  if (memberopenid) {
                    $.mixin(parames.obj, {
                      memberopenid: memberopenid,
                      ispublic: 2
                    }, true);
                  }
                  app.session.vericode = vericode;

                  api.request.get("/hfz/HfzTeamManageAction/addAppointment", parames).then(function(response) {
                    var msg = response.data;
                    if (true) {
                      v.ui.alert('预约成功');
                      fixed.remove();
                    }
                  });
                } else {
                  api.request.get("/sq/my/Reserve/notice", {
                    obj: {
                      mobile: mobile,
                      name: name,
                      projectid: projectid,
                      agentopenid: memberopenid
                    }
                  }).then(function(response) {
                    var msg = response.data;
                    if (true) {

                      fixed.remove();
                      return v.ui.alert(msg < 0 ? "您已经预约过了" : "提交成功");
                    }
                  });
                }

              }
            }]
          }]
        }]
      }, document.body);
    },
    onRender: function(){
    }
  }
  
  // return {
    
  //   options: {
  //     scroller: true,
  //     trademark: true
  //   },

  //   onRender: function() {
  //     var page = $('#page-detail');
    
  //     var fopenid = (query.fopenid ? query.fopenid : '')
  //     var memberopenid = (query.memberopenid ? query.memberopenid : '')
  //     var projectid = query.projectid ? parseInt(query.projectid) : ''
    
  //     var userObj,preUserObj,defaultUserObj
    
  //     //设置分享链接
  //     // setShareUrl(query);
    
  //     //添加浏览记录
  //     api.addhistory.get({
  //       projectid: projectid
  //     }, {mask:false}).then(function(response){ var msg = response.data;
  //     });
    
  //     //设置学区、地铁、品牌显示
  //     getListItem(11,newInit);
    
  //     function newInit() {
  //       var list = [
  //         api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
  //           obj: { openid: app.session.openid }
  //         }),
  //         api.request.get("/hfz/HfzChannelManageAction/getProjectDefaultAgent", {
  //           obj: { projectid: projectid }
  //         })
  //       ];
  //       if(fopenid) {
  //         list.push(api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
  //           obj: {
  //             openid: fopenid
  //           }
  //         }))
  //       }
  //       Promise.all(list).then(function(datas){
  //         userObj = datas[0].msg
  //         defaultUserObj = datas[1].msg
  //         if(fopenid) {
  //           preUserObj = datas[2].msg
  //         }
  //         //设置分享链接
  //         if(userObj) {
  //           if(userObj.agent && userObj.agent.state == 1 && userObj.agent.workstate != 0) {
  //             //是经纪人
  //             app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/detail-new.html?fopenid='+app.session.openid+'&projectid='+projectid+'&memberopenid='+app.session.openid;
  //           } else if(userObj.teammember && userObj.teammember.state == 1) {
  //             //是队员或队长
  //             app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/detail-new.html?fopenid='+userObj.teammember.leaderopenid+'&projectid='+projectid+'&memberopenid='+app.session.openid;
  //           }
  //         }
  //         /* app.wxjsapk.init() */;
  //         getInfo();
  //       });
  //     }
    
  //     //获取楼盘信息
  //     function getInfo() {
  //       api.info.get({
  //         projectid: projectid
  //       }).then(function(response){ var msg = response.data;
  //         if(code == 0 && msg) {
    
  //           app.wechat.SHARE_FRIEND = {
  //             SHARE_TITLE : msg.base.projectname,
  //             SHARE_DESC : '',
  //           };
  //           app.wechat.SHARE_TIMELINE = {
  //             SHARE_TITLE : msg.base.projectname,
  //           };
    
  //           // $('title').text(msg.base.projectname);
  //           Page.setTitle(msg.base.projectname)
  //           if(msg.banner && msg.banner.length) {
  //             //创建banner
  //             page.find('.banner').removeClass('hide');
  //             createBanner(msg.banner);
  //           }
  //           //楼盘简介
  //           createLpDesc(msg.base,msg.isfavorate);
  //           //周边精彩
  //           createZbIcons(msg.base);
  //           //一网打尽
  //           createAllSearch(msg.base);
  //           if(msg.base.sofunnew || msg.base.lejunew) {
  //             //最新动态
  //             // createZxdt(msg.base);
  //           }
  //           //精彩评论
  //           if(msg.replies && msg.replies.length) {
  //             createReplies(msg.replies,msg.base);
  //             page.find('.project-reply').removeClass('hide');
  //           }
  //           //操作
  //           page.find('.actbar').removeClass('hide');
  //           //底部菜单
  //           app.createXkbMenu(projectid,msg.base.tourl);
  //           //置业顾问
  //           // if(app.id == 'wxf086e007bcb43b69') {
  //           //   api.request.get("/global/Project/hasValidPreferen", {
  //           //     obj: {
  //           //       projectid: projectid
  //           //     }
  //           //   }).then(function(response){ var msg = response.data;
  //           //     if(msg <= 0) {
  //           //       createSaler();
  //           //     }
  //           //   })
  //           // } else {
  //           //   createSaler();
  //           // }
  //           createSaler();
  //         }
  //       });
  //     }
    
  //     //banner
  //     function createBanner(picList) {
  //       var len = picList.length;
  //       if(len > 1) {
  //         $.createElements({
  //           classes: 'banner-indicate',
  //           components: [{
  //             tag: 'ul',
  //             components: picList.map(function(){
  //               return {
  //                 tag: 'li'
  //               }
  //             })
  //           }]
  //         }, '.vpage-content .banner');
  //         var data = [];
  //         for(var i=0;i<len;i++) {
  //           data.push({
  //             classes: 'banner-img',
  //             onTap: function(){},
  //             dataIndex: i,
  //             components: [{
  //               tag: 'img',
  //               src: app._photoUrl(picList[i].picurl)
  //             }]
  //           });
  //         }
  //         var duration = 3500;
  //         var slides = new app.Slides($('.vpage-content .banner'), {
  //           mode: '',
  //           // onSnap: function(dir) {
  //           //   if (dir < 0 && this.index <= 0 ||
  //           //       dir > 0 && this.index >= data.length - 1) {
  //           //     return false;
  //           //   }
  //           // },
  //           onSnapEnd: function() {
  //             clearTimeout(_autoTimer);
  //             _autoTimer = _auto.defer(duration);
  //           },
  //           onUpdate: function(index, el) {
  //             var header = $(this.centerEl).find('.banner-img');
  //             if (header && header.length) {
  //               var idx = parseInt(header.data('index'));
  //               $('.vpage-content .banner li').removeClass('hightlight')
  //               $('.vpage-content .banner li:nth-child('+(idx+1)+')').addClass('hightlight')
  //             }
  //             // if (index < 0 || index >= data.length) {
  //             //   return false;
  //             // }
  //             index = ((index % len) + len) % len;
  //             el.empty();
  //             $.createElements(data[index], el);
  //           }
  //         });
  //         var _auto = function() {
  //           if (!slides.dragging && !slides.snapping) {
  //             slides.next();
  //             _autoTimer = _auto.defer(duration);
  //           }
  //         };
  //         var _autoTimer = _auto.defer(duration);
  //       } else {
  //         $.createElements({
  //           tag: 'img',
  //           src: app._photoUrl(picList[0].picurl)
  //         }, '.vpage-content .banner');
  //       }
  //     }
    
  //     //楼盘简介
  //     function createLpDesc(info,favorite) {
  //       $.createElements({
  //         classes: 'pro-infomation',
  //         components: [{
  //           classes: 'header-info hflexbox',
  //           components: [{
  //             classes: 'title',
  //             text: info.projectname
  //           },{
  //             classes: 'favorite ' + (favorite == 1 ? ' f2' : '' )
  //           },{
  //             onSingleTap: function() {
  //               Page.open('http://api.map.baidu.com/marker?location=' + info.latitude + ',' + info.longitude + '&title='+info.projectname+'&content='+info.projectname+'&output=html');
  //             },
  //             classes: 'navigation ' + ((info.longitude && info.latitude) ? '' : 'hide'),
  //           }]
  //         },{
  //           classes: 'info-desc hflexbox',
  //           components: [{
  //             text: '价格：' + info.price,
  //           },{
  //             onSingleTap: function() {
  //               api.request.get("/global/Project/listManagerPrice", {
  //                 obj: {
  //                   projectid: projectid,
  //                 }
  //               }).then(function(response){ var msg = response.data;
  //                 if(true) {
  //                   if(msg.total > 0) {
  //                     $.createElements({
  //                       classes: 'scrim popup-manage-price',
  //                       components: [{
  //                         classes: 'rank-wrapper',
  //                         components: [{
  //                           classes: 'info-box',
  //                           components: [{
  //                             classes: 'info-head',
  //                             text: '经理报价列表'
  //                           },{
  //                             classes: 'info-top',
  //                             components: [{
  //                               classes: 'scroll-list',
  //                               components: [{
  //                                 classes: 'rank-list',
  //                                 components: msg.list.map(function(item){
  //                                   return {
  //                                     classes: 'rank-item',
  //                                     components: [{
  //                                       classes: 'title',
  //                                       text: item.housetype
  //                                     },{
  //                                       text: '面积：' + item.area
  //                                     },{
  //                                       text: '房号：' + item.roomno
  //                                     },{
  //                                       text: '原总价：' + item.price
  //                                     },{
  //                                       html: '本周经理报价：<span>' + item.managerprice + '</span>'
  //                                     }]
  //                                   }
  //                                 })
  //                               }]
  //                             }]
  //                           },{
  //                             classes: 'info-bottom',
  //                             text: '关 闭',
  //                             onSingleTap: function() {
  //                               $('.popup-manage-price').remove();
  //                             }
  //                           }]
  //                         }]
  //                       }]
  //                     }, document.body);
  //                     new IScroll('.scroll-list');
  //                   } else {
  //                     alert('暂无经理报价');
  //                   }
  //                 }
  //               });
    
  //               api.request.get("/hfz/HfzChannelManageAction/saveManagerRecord", {
  //                 obj: {
  //                   projectid: projectid,
  //                 }
  //               }, {
  //                 mask: false
  //               }).then(function(response){ var msg = response.data;
  //               });
    
  //             },
  //             classes: 'hasmanagerprice ' + (info.hasmanagerprice?'':'hide'),
  //             text: '本周经理报价'
  //           }]
  //         },{
  //           classes: 'info-desc wy',
  //           text: '物业类型：',
  //         },{
  //           classes: 'info-desc',
  //           // html: '接待处地址：<span class="addr">' + info.address + '</span>'
  //           html: '接待处地址：' + info.address
  //         // },{
  //         //   classes: 'info-desc',
  //         //   html: '开盘时间：<span>' + info.opentime + '</span>'
  //         },{
  //           classes: 'info-desc ' + (info.discountdesc ? '' : 'hide'),
  //           html: '优惠描述：' + info.discountdesc
  //         },{
  //           classes: 'tagheader',
  //           components: [{
  //             classes: 'tagborder ' + (info.issubway==1?'':'hide'),
  //             text: commonListItem[1]
  //           },{
  //             classes: 'tagborder ' + (info.isxuequ==1?'':'hide'),
  //             text: commonListItem[2]
  //           },{
  //             classes: 'tagborder ' + (info.brand?'':'hide'),
  //             text: commonListItem[0]
  //           },{
  //             classes: 'more',
  //             text: '更多',
  //             onTap: function() {
  //               Fn.addHistoryLog(projectid,1);
  //               Page.open('./detail-more.html',{
  //                 projectid: projectid
  //               },false);
  //             }
  //           }]
  //         }]
  //       }, '.vpage-content .project-info');
    
  //       var str = '';
  //       api.listItemCache.get({
  //         titleids:[3]
  //       }).then(function(response){ var msg = response.data;
  //         msg[3].forEach(function(item){
  //           if(item.itemid == info.properties1 || item.itemid == info.properties2 || item.itemid == info.properties3 || item.itemid == info.properties4 || item.itemid == info.properties5) {
  //             str = str + item.itemtext + '、';
  //           }
  //         });
  //         if(str) {
  //           page.find('.info-desc.wy').html('物业类型：' + str.substring(0,str.length-1));
  //         }
  //       });
    
  //       page.find('.project-info').removeClass('hide');
  //       page.find('.favorite').singleTap(function(){
  //         if(page.find('.favorite').hasClass('f2')) {
  //           return;
  //         } else {
  //           api.addfavorite.get({
  //             projectid: projectid
  //           }, {mask:false}).then(function(response){ var msg = response.data;
  //             if(code == 0) {
  //               page.find('.favorite').addClass('f2');
  //             }
  //           });
  //         }
  //       });
  //     }
    
  //     //周边精彩
  //     function createZbIcons(info) {
  //       $.createElements([{
  //         // classes: 'common-header-item',
  //         // text: '周边精彩'
  //       },{
  //         classes: 'icons-item',
  //         components: [{
  //           classes: 'item-icon-txt hasafter ' + (info.streetpanorama ? '' : 'hide'),
  //           onTap: function() {
  //             Fn.addHistoryLog(projectid,3);
  //             if(projectid == 230) {
  //               Page.open('./vtour/tour.html');
  //             }else{
  //               Page.open('http://map.qq.com/#pano='+info.streetpanorama+'&heading=0&pitch=0&zoom=1');
  //             }
  //             // Page.open('./pano.html',{
  //             //   streetpanorama: info.streetpanorama
  //             // },false);
  //           },
  //           components: [{
  //             classes: 'icon jj',
  //           },{
  //             text: '实时街景'
  //           }]
  //         },{
  //           classes: 'item-icon-txt hasafter',
  //           onTap: function() {
  //             Fn.addHistoryLog(projectid,8);
  //             Page.open('../local-detail.html?latitude='+info.latitude+'&longitude='+info.longitude+'&category=美食');
  //           },
  //           components: [{
  //             classes: 'icon ms',
  //           },{
  //             text: '周边美食'
  //           }]
  //         },{
  //           classes: 'item-icon-txt hasafter',
  //           onTap: function() {
  //             Fn.addHistoryLog(projectid,8);
  //             Page.open('../local-detail.html?latitude='+info.latitude+'&longitude='+info.longitude+'&category=购物');
  //           },
  //           components: [{
  //             classes: 'icon gw',
  //           },{
  //             text: '周边购物'
  //           }]
  //         },{
  //           classes: 'item-icon-txt',
  //           onTap: function() {
  //             Fn.addHistoryLog(projectid,8);
  //             Page.open('./local-more.html',{
  //               latitude: info.latitude,
  //               longitude: info.longitude,
  //               projectid: projectid,
  //             },false);
  //           },
  //           components: [{
  //             classes: 'icon more',
  //           },{
  //             text: '更多精彩'
  //           }]
  //         }]
  //       }], '.vpage-content .project-zb');
  //       page.find('.project-zb').removeClass('hide');
  //     }
    
  //     //一网打尽
  //     function createAllSearch(info) {
  //       var data = [{
  //       //   src: 'images/icon-xkb.png',
  //       //   text: '新快网有关<span>'+info.projectname+'</span>的精彩文章集合',
  //       //   url: (app.id == 'wx723631547c0fc984' ? 'http://www.baidu.com/baidu?word='+info.projectname+'&tn=bds&cl=3&si=xkb.com.cn&ct=2097152' : '')
  //       // },{
  //         src: 'images/icon-weixin.png',
  //         text: '微信里搜索有关<span>'+info.projectname+'</span>的所有最新资讯和公众号',
  //         url: 'http://weixin.sogou.com/weixinwap?type=2&query='+info.projectname+'&city=广州&latitude='+info.latitude+'&longitude='+info.longitude
  //       },{
  //         src: 'images/icon-baidu.png',
  //         text: '全球最大中文搜索引擎的<span>'+info.projectname+'</span>搜索结果',
  //         url: 'http://m.baidu.com/s?word='+info.projectname+'&city=广州&latitude='+info.latitude+'&longitude='+info.longitude
  //       },{
  //       //   src: 'images/icon-soufang.png',
  //       //   text: '国内主流的房地产网络搜房里看<span>'+info.projectname+'</span>',
  //       //   url: (info.soufunurl ? info.soufunurl : '')
  //       // },{
  //         src: 'images/icon-txfc.png',
  //         text: ' 腾讯房产里关于<span>'+info.projectname+'</span>的新鲜资讯，首次进入需要选一下城市呦',
  //         url: info.qqurl || 'http://m.db.house.qq.com/index.php?mod=searchhouse&act=searchlist&all='+info.projectname
  //       // },{
  //       //   src: 'images/icon-kdlj.png',
  //       //   text: '在中国房地产家居网络传媒市场主流媒体口袋乐居查看<span>'+info.projectname+'</span>',
  //       //   url: info.lejuurl || 'http://m.leju.com/?site=touch&ctl=house&act=search&city=gz&keyword='+info.projectname
  //       },{
  //         src: 'images/icon-shjd.png',
  //         text: '在搜狐焦点搜索及时全面的<span>'+info.projectname+'</span>资讯',
  //         url: (info.sohuurl ? info.sohuurl : '')
  //       }];
  //       var items = data.map(function(item){
  //         return {
  //           classes: 'common-cell-item ' + (item.url ? '' : 'hide'),
  //           onTap: function() {
  //             Fn.addHistoryLog(projectid,4);
  //             if(item.url) {
  //               Page.open(item.url);
  //             }
  //           },
  //           components: [{
  //             tag: 'img',
  //             src: item.src
  //           },{
  //             classes: 'common-cell-body',
  //             components: [{
  //               classes: 'common-cell-content',
  //               components: [{
  //                 classes: 'common-cell-text',
  //                 html: item.text
  //               }]
  //             }]
  //           }]
  //         };
  //       });
  //       $.createElements([{
  //         classes: 'common-header-item',
  //         text: '一网打尽',
  //         components: [{
  //           onTap: function() {
  //             Page.open('./search-inter.html',{
  //               projectid: projectid,
  //             },false);
  //           },
  //           classes: 'more',
  //           text: '更多'
  //         }]
  //       },{
  //         components: items
  //       }], '.vpage-content .project-all');
  //       page.find('.project-all').removeClass('hide');
  //     }
    
  //     //最新动态
  //     function createZxdt(info) {
  //       var data = [];
  //       if (info.sofunnew) {
  //         data.push({
  //           text: '搜房网有关<span>'+info.projectname+'</span>最新动态信息',
  //           url: info.sofunnew
  //         });
  //       }
  //       if (info.lejunew) {
  //         data.push({
  //           text: '口袋乐居有关<span>'+info.projectname+'</span>最新动态信息',
  //           url: info.lejunew
  //         });
  //       }
  //       var items = data.map(function(item){
  //         return {
  //           classes: 'common-cell-item zxdt',
  //           onTap: function() {
  //             Fn.addHistoryLog(projectid,4);
  //             Page.open(item.url);
  //           },
  //           components: [{
  //             classes: 'common-cell-body',
  //             components: [{
  //               classes: 'common-cell-content',
  //               components: [{
  //                 classes: 'common-cell-text',
  //                 html: item.text
  //               }]
  //             }]
  //           }]
  //         };
  //       });
  //       $.createElements([{
  //         classes: 'common-header-item',
  //         text: '最新动态',
  //       },{
  //         components: items
  //       }], '.vpage-content .project-zxdt');
  //       page.find('.project-zxdt').removeClass('hide');
  //     }
    
  //     //精彩评论
  //     function createReplies(replies,info) {
  //       var items = replies.map(function(item){
  //         preloadImage(item.headimgurl);
  //         return {
  //           classes: 'reply-cell-item',
  //           components: [{
  //             tag: 'img',
  //             src: item.headimgurl || '../images/head.jpg',
  //           },{
  //             classes: 'reply-cell-body',
  //             components: [{
  //               classes: 'reply-cell-header',
  //               components: [{
  //                 classes: 'name',
  //                 text: item.name || item.nickname || '游客'
  //               },{
  //                 classes: 'time',
  //                 text: Fn.getTime(item.createtime)
  //               // },{
  //               //   classes: 'icon stamp'
  //               // },{
  //               //   classes: 'icon assist'
  //               }]
  //             },{
  //               classes: 'reply-cell-desc',
  //               text: item.content
  //             }]
  //           }]
  //         };
  //       });
  //       $.createElements([{
  //         classes: 'common-header-item hflexbox',
  //         // html: '精彩评论 <span>('+count+'评)</span>'
  //         html: '精彩评论',
  //         components: [{
  //           classes: 'comment-detail hflexbox',
  //           components: [{
  //             html: '&nbsp;('+info.replyamount+'评 '
  //           },{
  //             classes: 'assist',
  //             html: '&nbsp;&nbsp;' + info.likeamount
  //           },{
  //             classes: 'stamp',
  //             html: '&nbsp;&nbsp;' + info.dislikeamount
  //           },{
  //             text: ')'
  //           }]
  //         },{
  //           onTap: function() {
  //             Page.open('./forum.html',{
  //               projectid: projectid,
  //             },false);
  //           },
  //           classes: 'more',
  //           text: '更多'
  //         }]
  //       },{
  //         components: items
  //       }], '.vpage-content .project-reply');
  //     }
    
  //     //置业顾问
  //     function createSaler() {
  //       var showContact = false
  //       var list = []
    
  //       if(preUserObj) {
  //         this.showContact = true
  //         //判断是否经纪人
  //         if(preUserObj.agent && preUserObj.agent.state == 1 && preUserObj.agent.workstate != 0) {
  //           list.push({
  //             name: preUserObj.agent.name,
  //             mobile: preUserObj.agent.mobile,
  //             headimgurl: preUserObj.agent.headimgurl
  //           })
  //         } else if(preUserObj.teammember && preUserObj.teammember.state == 1) {
  //           list.push({
  //             name: preUserObj.teammember.name,
  //             mobile: preUserObj.teammember.mobile,
  //             headimgurl: preUserObj.team.headimgurl
  //           })
  //         } else {
  //           if(defaultUserObj && defaultUserObj.state == 1 && defaultUserObj.workstate != 0){
  //             list.push({
  //               name: defaultUserObj.name,
  //               mobile: defaultUserObj.mobile,
  //               headimgurl: defaultUserObj.headimgurl
  //             })
  //           } else {
  //             showContact = false
  //           }
  //         }
  //       } else if(defaultUserObj && defaultUserObj.state == 1 && defaultUserObj.workstate != 0) {
  //           list.push({
  //             name: defaultUserObj.name,
  //             mobile: defaultUserObj.mobile,
  //             headimgurl: defaultUserObj.headimgurl
  //           })
  //         //默认置业顾问
  //         showContact = true
  //       } else {
  //         showContact = false
  //       }
  //       if(showContact) {
  //         $.createElements([{
  //           classes: 'common-header-item hflexbox',
  //           text: '置业顾问',
  //           components: [{
  //             classes: 'saler-txt',
  //             text: '点击头像拨打电话'
  //           }]
  //         },{
  //           classes: 'saler-common-item',
  //           components: list.map(function(item,index){
  //             return {
  //               classes: 'saler-common-body',
  //               onSingleTap:function(){
  //                 location.href='tel:'+item.mobile;
  //                 return false;
  //               },
  //               components: [{
  //                 classes: 'imgheader',
  //                 components: [{
  //                   tag: 'img',
  //                   src: item.headimgurl
  //                 },{
  //                   classes: 'headbg'
  //                 }]
  //               },{
  //                 classes: 'name',
  //                 text: item.name
  //               },{
  //                 classes: 'stars',
  //                 components:_starts(5)
  //               }]
  //             }
  //           })
  //         }], '.vpage-content .project-saler');
  //         page.find('.project-saler').removeClass('hide');
  //       }
  //     }
    
  //     function _starts(num){
  //       var count = 5;
  //       var starts = [];
  //       for(var i = 1;i <= count; i++){
  //         if(num > i && num < i+1) {
  //           starts.push({
  //             classes: ('star-hl')
  //           });
  //         } else if(num < i) {
  //           starts.push({
  //             classes: ('star-dark')
  //           });
  //         } else {
  //           starts.push({
  //             classes: ('star')
  //           });
  //         }
  //       }
  //       return starts;
  //     };
    
  //     function _createBooking(title, type){
  //       var time = 59;
  //       $.createElements({
  //         classes: "booking-fixed",
  //         components: [{
  //           classes: "booking-box",
  //           components: [{
  //             classes: "booking-title",
  //             html: title
  //           },{
  //             classes: 'note-txt',
  //             html: '请您填写姓名及联系方式，专属置业顾问将很快联系您。'
  //           },{
  //             classes: "input-box i2",
  //             components: [{
  //               classes: "input-title",
  //               html: "姓名"
  //             },{
  //               classes: "inputpanel",
  //               components: [{
  //                 tag: "input",
  //                 classes: "name"
  //               }]
  //             }]
  //           },{
  //             classes: "input-box",
  //             components: [{
  //               classes: "input-title",
  //               html: "电话"
  //             },{
  //               classes: "inputpanel",
  //               components: [{
  //                 tag: "input",
  //                 classes: "mobile"
  //               }]
  //             }]
  //           },{
  //             classes: "input-box",
  //             components: [{
  //               classes: "input-title",
  //               html: "验证码"
  //             },{
  //               classes: "inputpanel",
  //               components: [{
  //                 tag: "input",
  //                 classes: "vericode"
  //               }]
  //             },{
  //               classes: "input-verify",
  //               html: "获取验证码",
  //               onTap: function(){
  //                 var fixed = $(".booking-fixed");
  //                 var dom = $(this);
  //                 if (dom.hasClass('disabled')) {
  //                   return;
  //                 }
  //                 var mobile = fixed.find(".mobile").val();
  //                 if (app.isMobile(mobile)) {
  //                   dom.addClass('disabled');
  //                   var ival = setInterval(function() {
  //                     dom.html(time + '秒');
  //                     if (time <= 0) {
  //                       time = 59;
  //                       clearInterval(ival);
  //                       dom.removeClass('disabled');
  //                       dom.html('获取验证码');
  //                     } else {
  //                       time--;
  //                     }
  //                   }, 1000);
    
  //                   api.request.get("/global/App/getHfzVericode", {
  //                     mobile: mobile,
  //                   }).then(function(response){ var msg = response.data;
  //                     if(true){
  //                       v.ui.alert('验证码已通过短信发送到您的手机，稍等一会儿哦');
  //                     }
  //                   });
  //                 } else if (mobile) {
  //                   v.ui.alert('请输入正确的手机号码');
  //                 } else {
  //                   v.ui.alert('请输入您的手机号码');
  //                 }
  //               }
  //             }]
  //           },{
  //             classes: "bts",
  //             components: [{
  //               classes: "bt",
  //               html: "取消",
  //               onTap: function(){
  //                 var fixed = $(".booking-fixed");
  //                 fixed.remove();
  //               }
  //             },{
  //               classes: "bt ok",
  //               html: "确定",
  //               onTap: function(){
  //                 var fixed = $(".booking-fixed");
  //                 var name = fixed.find(".name").val();
  //                 var mobile = fixed.find(".mobile").val();
  //                 var vericode = fixed.find(".vericode").val();
  //                 if(!name || !mobile || !vericode){
  //                   return v.ui.alert("信息不能为空");
  //                 }
  //                 if(!app.isMobile(mobile)){
  //                   return v.ui.alert("电话格式不正确");
  //                 }
  //                 session.vericode = vericode;
    
  //                 if(type == 1) {
  //                   var parames = {
  //                     obj:{
  //                       name: name,
  //                       mobile: mobile,
  //                       ispublic: 1,
  //                       projectid: projectid
  //                     }
  //                   };
  //                   if(memberopenid){
  //                     $.mixin(parames.obj,{memberopenid:memberopenid, ispublic: 2},true);
  //                   }
  //                   session.vericode = vericode;
    
  //                   api.request.get("/hfz/HfzTeamManageAction/addAppointment", parames).then(function(response){ var msg = response.data;
  //                     if(true){
  //                       v.ui.alert('预约成功');
  //                       fixed.remove();
  //                     }
  //                   });
  //                 }else {
  //                   api.request.get("/sq/my/Reserve/notice", {
  //                     obj: {
  //                       mobile: mobile,
  //                       name: name,
  //                       projectid: projectid,
  //                       agentopenid: memberopenid
  //                     }
  //                   }).then(function(response){ var msg = response.data;
  //                     if(true){
    
  //                       fixed.remove();
  //                       return v.ui.alert(msg<0?"您已经预约过了":"提交成功");
  //                     }
  //                   });
  //                 }
    
  //               }
  //             }]
  //           }]
  //         }]
  //       }, document.body);
  //     }
    
  //     page.find(".actbtn.x2").singleTap(function(){
  //       _createBooking("看房预约", 1);
  //     });
  //     page.find(".actbtn.x1").singleTap(function(){
  //       _createBooking("优惠及开盘通知", 2);
  //     });
  //   }
    
  // }
})