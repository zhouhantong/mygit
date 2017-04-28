"use strict";
Page.ready(function($, query) {

    var self;
  /*var fopenid = (query.fopenid ? query.fopenid : '')
   var memberopenid = (query.memberopenid ? query.memberopenid : '')
   var teamuuid = (query.teamuuid ? query.teamuuid : '')*/
    var fopenid = "oZc8us6WTC88tILnVOnLNgH4aW14"
    var memberopenid = "oZc8us6WTC88tILnVOnLNgH4aW14"
    var teamuuid ="25c513a5-399d-4a88-9e8b-370cd84b1b4f"
    var userObj
    var listEl = $('.list')

    var popup = $('.appointment-popup2')
    var count = 59
    var projectid

    var defaultObj = {
        picUrl: 'images/online/bg_head.jpg',
        address: '未知'
    }

    var ival

    return {
        options: {
            autoRender: false,
            pagingEnabled: true,
            wxSharable: false
        },

        init: function() {
            self = this;
            Promise.all([
                api.request.get("/global/Select/listItemFromCache", {
                    titleids: [20160422]
                }, {
                    ljsonp: true,
                    jdomain: 'g.justhante.com',
                    japi: "/qc-webapp/qcapi.do"
                }),
                api.request.get('/hfz/HfzTeamManageAction/saveTeamClickLog', {
                    obj: {
                        teamuuid: teamuuid
                    }
                })
            ]).then(function(obj) {
                var msg = obj[0].data;
                if (msg[20160422] && msg[20160422].length > 0) {
                    var json = JSON.parse(msg[20160422][0].itemtext)
                    json.forEach(function(item) {
                        if (item.appid == app.id) {
                            defaultObj.picUrl = item.picUrl
                            defaultObj.address = item.address
                        }
                    })
                }

                api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
                    obj: {
                        openid: fopenid
                    }
                }).then(function(resposne) {
                    userObj = resposne.data

                    self.find('.header-top').removeClass('hide')
                    self.find('.header-top > img').attr('src', defaultObj.picUrl)

                    self.find('.header-top .info > img').attr('src', userObj.teammember.headimgurl)
                    // self.find('.header-top .t1').html(userObj.teammember.leadername + '<span></span>好房子微店')
                    self.find('.header-top .t1').append($.$([{
                        classes: 'ellipsis',
                        html: userObj.teammember.leadername
                    },{
                        tag: "span"
                    },{
                        html: "好房子微店"
                    }]))
                    self.find('.header-top .right > div').html(defaultObj.address)
                    // self.find('.header-top .layer').vendor('width', self.find('.header-top .t1').offset().width + 'px')

                    app.wechat.SHARE_TITLE = '这是' + userObj.teammember.leadername + '的好房子微店';
                    app.wechat.SHARE_DESC = '这是' + userObj.teammember.leadername + '的好房子微店';
                    app.wechat.SHARE_TIMELINE_TITLE = '这是' + userObj.teammember.leadername + '的好房子微店';
                    app.wechat.SHARE_CALLBACK_OK = function(type) {
                        if (teamuuid) {
                            api.request.get("/hfz/HfzTeamManageAction/addShareLog", {
                                obj: {
                                    openid: app.session.openid,
                                    teamuuid: teamuuid
                                }
                            }, {
                                mask: false
                            }).then(function(response) {
                                var msg = response.data;

                            });
                        }
                    }
                    //自己加的
                    api.request.get("/hfz/HfzTeamManageAction/listCity",{
                        obj:{
                            appid:app.session.appid
                        }
                    }).then(function(citys){

                        self.tpl("city-layer", {}, self.find(".header-top"));
                        var d, e = self.find(".city-layer .select-layer");
                        citys.data.list.forEach(function (a, c) {
                            var f = a.id==setting.appid ? "checked" : "";
                            c % 3 == 0 &&
                            (d = self.tpl("city-item", {}, e)),
                                d.append(v.jsx("div", {
                                    class: "city-select " + f,
                                    "v-link": "*selctCity " + a.id
                                }, a.name))
                        })
                    })
                    //============
                    wechat.init();

                    self.render();
                });

            });

            popup.find('.cancel').singleTap(function() {
                popup.addClass('hide');
            });

            //发送验证码 按钮
            popup.find('.btn-vericode').singleTap(function() {
                if (popup.find('.btn-vericode').hasClass('disabled')) {
                    return;
                }
                var mobile = $('#telnum').val();
                if (Fn.isMobile(mobile)) {

                    popup.find('.btn-vericode').addClass('disabled');
                    ival = window.setInterval(function() {
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
                    }).then(function(response) {
                        var msg = response.data;
                        v.ui.alert('验证码已通过短信发送到您的手机，稍等一会儿哦');
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

                if (!name || !mobile) {
                    return v.ui.alert('所有项均为必填项');
                }
                if (!Fn.isMobile(mobile)) {
                    return v.ui.alert('请输入正确的手机号码');
                }
                if (!vericode) {
                    return v.ui.alert('请输入短信验证码');
                }
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
                    $('#vericode').val('')
                    v.ui.alert('预约成功');
                    popup.addClass('hide');
                });
            });
        },
        //自己加的
        onRender: function() {

            self.paging.load();
        },
        selctCity: function (b, c) {
            var d = this;
            d.find(".city-select").removeClass("checked"),
                $(b.target).addClass("checked"),
                d.sAppid = c,
                app.wechat.SHARE_LINK = location.protocol + "//" +
                    location.host + "/consumer2/house-team-prolist.html?fopenid=" +
                    app.session.openid +
                    "&memberopenid=" + app.session.openid +
                    "&teamuuid=" + teamuuid +
                    "&appid=" + d.sAppid,
                wechat.init(),
                d.paging.reset(),
                d.find(".list").empty(),
                d.loadData(c)
        },
        onPaging:function(){
            this.loadData()
        },
        loadData:function(c){
            api.request.get('/hfz/HfzTeamManageAction/listProject', {
                obj: {
                    followed: 1,
                    appid:c
                },
                offset: self.paging.count,
                size: self.paging.size
            }).then(function(response) {
                var obj = response.data;

                self.paging.done(obj.list.length, obj.total)
                self.find('.header-top .left > div').html(obj.total)
                if (obj.total == 0) {
                    self.tpl("noitem", {}, self.find(".list"));
                    return;
                }
                // self.find(".btimg").removeClass('hide')
                obj.list.forEach(function(item) {
                    item.ISXUEQU = (item.isxuequ == 1)
                    item.ISSUBWAY = (item.issubway == 1)
                    item.BRAND = (item.brand)
                    item.ONLINE = (item.cooporatetype == 100)
                    self.tpl("item", item, self.find(".list"));
                })
            })
        },
      /* onRender: function() {

       self.paging.load();
       },

       onPaging: function(paging) {
       if (paging.isFirst()) {
       listEl.empty()
       }
       var params = {
       obj: {
       teamuuid: teamuuid
       }
       }

       api.request.get('/hfz/HfzTeamManageAction/listSeledProject', {
       obj: {
       teamuuid: teamuuid
       },
       offset: paging.count,
       size: paging.size
       }).then(function(response) {
       var obj = response.data;
       paging.done(obj.list.length, obj.total)
       self.find('.header-top .left > div').html(obj.total)
       if (obj.total == 0) {
       self.tpl("noitem", {}, self.find(".list"));
       return;
       }
       self.find(".btimg").removeClass('hide')
       obj.list.forEach(function(item) {
       item.ISXUEQU = (item.isxuequ == 1)
       item.ISSUBWAY = (item.issubway == 1)
       item.BRAND = (item.brand)
       item.ONLINE = (item.cooporatetype == 100)
       self.tpl("item", item, self.find(".list"));
       })
       })
       },*/
        goOnline: function(event, id, type) {
            if (parseInt(type) == 100) {
                var url = './house-online.html'
            } else {
                var url = './detail-new.html'
            }
            Page.open(url, {
                fopenid: fopenid,
                memberopenid: memberopenid,
                projectid: id,
                teamuuid: teamuuid
            })
        },
        book: function(event, id) {
            projectid = parseInt(id)
            this.appointment()
        },
        appointment: function() {
            popup.removeClass('hide')
            clearInterval(ival);
            popup.find('.btn-vericode').removeClass('disabled');
            popup.find('.btn-vericode').html('免费获取验证码');
            popup.find('#telnum').val("");
            popup.find('#mname').val("");
            popup.find('#vericode').val("");
        }
    }
    // return {

    //   onRender: function() {
    //     var page = this // 自动生成的代码
    //     var fopenid = (query.fopenid ? query.fopenid : '')
    //     var memberopenid = (query.memberopenid ? query.memberopenid : '')
    //     var teamuuid = (query.teamuuid ? query.teamuuid : '')
    //     var userObj
    //     var listEl = page.find('.list')

    //     var popup = $('.appointment-popup2')
    //     var count = 59
    //     var projectid

    //     //设置分享链接
    //     // setShareUrl(query);

    //     var defaultObj = {
    //       picUrl: 'images/online/bg_head.jpg',
    //       address: '未知'
    //     }

    //     api.request.get("/global/Select/listItemFromCache", {
    //       titleids:[20160422]
    //     }, {
    //       ljsonp: true,
    //       jdomain: 'g.justhante.com',
    //       japi: "/qc-webapp/qcapi.do"
    //     }).then(function(response){ var msg = response.data;
    //       if(msg[20160422] && msg[20160422].length > 0) {
    //         var json = JSON.parse(msg[20160422][0].itemtext)
    //         json.forEach(function(item){
    //           if(item.appid == app.id) {
    //             defaultObj.picUrl = item.picUrl
    //             defaultObj.address = item.address
    //           }
    //         })
    //       }

    //       api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
    //         obj: {
    //           openid: fopenid
    //         }
    //       }).then(function(resposne){
    //         userObj = resposne.data

    //         page.find('.header-top').removeClass('hide')
    //         page.find('.header-top > img').attr('src', defaultObj.picUrl)

    //         page.find('.header-top .info > img').attr('src',userObj.teammember.headimgurl)
    //         page.find('.header-top .t1').html(userObj.teammember.leadername + '<span></span>好房子微店')
    //         page.find('.header-top .right > div').html(defaultObj.address)
    //         page.find('.header-top .layer').vendor('width',page.find('.header-top .t1').offset().width + 'px')

    //         app.wechat.SHARE_TITLE = '这是'+userObj.teammember.leadername+'的好房子微店';
    //         app.wechat.SHARE_DESC = '这是'+userObj.teammember.leadername+'的好房子微店';
    //         app.wechat.SHARE_TIMELINE_TITLE = '这是'+userObj.teammember.leadername+'的好房子微店';
    //         /* app.wxjsapk.init() */;

    //         initPage()
    //       });

    //     });

    //     function initPage(){

    //       listEl.empty()

    //       var params = {
    //         obj: {
    //           teamuuid: teamuuid
    //         }
    //       };

    //       Paging.getPaging().reset().setFactory(function(){
    //         params.offset = this.pageIndex * this.pageSize - this.pageSize
    //         params.size = this.pageSize
    //         return api.request.get('/hfz/HfzTeamManageAction/listSeledProject', params);
    //       }, function(obj){
    //         page.find('.header-top .left > div').html(obj.total)
    //         if(obj.total == 0){
    //           page.tpl("noitem", {}, page.find(".list"));
    //           return;
    //         }
    //         page.find(".btimg").removeClass('hide')
    //         obj.list.forEach(function(item){
    //           item.ISXUEQU = (item.isxuequ == 1)
    //           item.ISSUBWAY = (item.issubway == 1)
    //           item.BRAND = (item.brand)
    //           item.ONLINE = (item.cooporatetype == 100)
    //           page.tpl("item", item, page.find(".list"));
    //         })
    //       }).start();
    //     }

    //     page.goOnline = function(event, id, type) {
    //       if(parseInt(type) == 100) {
    //         var url = './house-online.html'
    //       }else {
    //         var url = './detail-new.html'
    //       }
    //       Page.open(url,{
    //         fopenid: fopenid,
    //         memberopenid: memberopenid,
    //         projectid: id,
    //         teamuuid: teamuuid
    //       })
    //     }

    //     page.book = function(event,id) {
    //       projectid = parseInt(id)
    //       appointment()
    //     }

    //     //预约
    //     function appointment() {
    //       popup.removeClass('hide')
    //     }

    //     popup.find('.cancel').singleTap(function(){
    //       popup.addClass('hide');
    //     });

    //     //发送验证码 按钮
    //     popup.find('.btn-vericode').singleTap(function() {
    //       if(popup.find('.btn-vericode').hasClass('disabled')) {
    //         return;
    //       }
    //       var mobile = $('#telnum').val();
    //       if (app.isMobile(mobile)) {

    //         popup.find('.btn-vericode').addClass('disabled');
    //         var ival = window.setInterval(function(){
    //           popup.find('.btn-vericode').html(count+'秒后重新获取');
    //           if(count <= 0) {
    //             count = 59;
    //             clearInterval(ival);
    //             popup.find('.btn-vericode').removeClass('disabled');
    //             popup.find('.btn-vericode').html('免费获取验证码');
    //           }else {
    //             count--;
    //           }
    //         },1000);

    //         api.request.get("/global/App/getHfzVericode", {
    //           mobile: mobile
    //         }).then(function(response){ var msg = response.data;
    //           v.ui.alert(code === 0 ? '验证码已通过短信发送到您的手机，稍等一会儿哦' : msg);
    //         });
    //       } else if (mobile) {
    //         return v.ui.alert('请输入正确的手机号码');
    //       } else {
    //         return v.ui.alert('请输入手机号码');
    //       }
    //     });

    //     popup.find('.submit').singleTap(function() {
    //       var name = $('#mname').val();
    //       var mobile = $('#telnum').val();
    //       var vericode = $('#vericode').val();

    //       if(!name || !mobile) {
    //         return v.ui.alert('所有项均为必填项');
    //       }
    //       if(!app.isMobile(mobile)) {
    //         return v.ui.alert('请输入正确的手机号码');
    //       }
    //       if (!vericode) {
    //         return v.ui.alert('请输入短信验证码');
    //       }
    //       var parames = {
    //         obj:{
    //           name: name,
    //           mobile: mobile,
    //           ispublic: 1,
    //           projectid: projectid
    //         }
    //       };
    //       if(memberopenid){
    //         $.mixin(parames.obj,{memberopenid:memberopenid, ispublic: 2},true);
    //       }
    //       session.vericode = vericode;

    //       api.request.get("/hfz/HfzTeamManageAction/addAppointment", parames).then(function(response){ var msg = response.data;
    //         $('#vericode').val('')
    //         if(true){
    //           v.ui.alert('预约成功');
    //           popup.addClass('hide');
    //         }
    //       });
    //     });

    //     app.wechat.SHARE_CALLBACK_OK = function(type){
    //       if(teamuuid) {
    //         api.request.get("/hfz/HfzTeamManageAction/addShareLog", {
    //           obj: {
    //             openid: app.session.openid,
    //             teamuuid: teamuuid
    //           }
    //         }, {
    //           mask: false
    //         }).then(function(response){ var msg = response.data;

    //         });
    //       }
    //     }
    //   }

    // }
})