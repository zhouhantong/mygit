"use strict";
Page.ready(function ($, query) {

    return {
        name: 'wd-leaderhome',

        options: {
            //wxSharable: false,
            pagingEnabled: true,
            wxSharable: false,
            sharable: true
        },

        onRender: function () {
            /*var self = this
             api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function (response) {
             self.userObj = response.data
             if(!self.userObj.team) {
             v.ui.alert('您还没有开通微店').then(function(){
             Page.open('../consumer2/myhome.html')
             });
             }
             if(self.userObj.teammember && self.userObj.teammember.newsubmit > 0) {
             self.userObj.teammember.HASNEWKY = true
             }
             if(self.userObj.team && self.userObj.team.newmembers > 0) {
             self.userObj.teammember.HASNEWDY = true
             }

             app.wechat.SHARE_TITLE = `这是${self.userObj.teammember.leadername}的好房子微店`;
             app.wechat.SHARE_DESC = `这是${self.userObj.teammember.leadername}的好房子微店`;
             app.wechat.SHARE_TIMELINE_TITLE = `这是${self.userObj.teammember.leadername}的好房子微店`;
             app.wechat.SHARE_LINK = `${location.protocol}//${location.host}/consumer2/house-team-prolist.html?fopenid=${app.session.openid}&memberopenid=${app.session.openid}&teamuuid=${self.userObj.team.teamuuid}`;

             wechat.init();

             self.tpl('header-layer',self.userObj.teammember,self.find('.header-layer'))
             self.tpl('common-share-icon',{},self.find('.vpage-content'))
             self.loadData()
             app.wechat.SHARE_CALLBACK_OK = function(type){
             $('.home-share-note').addClass('hide')
             if(self.userObj.team.teamuuid) {
             api.request.get('/hfz/HfzTeamManageAction/addShareLog',{
             obj: {
             teamuuid: self.userObj.team.teamuuid
             },
             },{quiet: true}).then(function(result){
             })
             }
             }
             //======================
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
             //============================
             })*/
            var b = this;
            b.tpl('search-layer', {}, b.find('.search-layer'));
            b.sAppid = setting.appid, Promise.all([api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}), api.request.get("/hfz/HfzTeamManageAction/listCity")]).then(function (c) {
                if (b.userObj = c[0].msg, b.citys = c[1].msg, b.userObj.team || v.ui.alert("您还没有开通微店").then(function () {
                        Page.open("../consumer2/myhome.html")
                    }), b.userObj.teammember && b.userObj.teammember.newsubmit > 0 && (b.userObj.teammember.HASNEWKY = !0), b.userObj.team && b.userObj.team.newmembers > 0 && (b.userObj.teammember.HASNEWDY = !0), app.wechat.SHARE_TITLE = "这是" + b.userObj.teammember.leadername + "的好房子微店", app.wechat.SHARE_DESC = "这是" + b.userObj.teammember.leadername + "的好房子微店", app.wechat.SHARE_TIMELINE_TITLE = "这是" + b.userObj.teammember.leadername + "的好房子微店", app.wechat.SHARE_LINK = location.protocol + "//" + location.host + "/consumer2/house-team-prolist.html?fopenid=" + app.session.openid + "&memberopenid=" + app.session.openid + "&teamuuid=" + b.userObj.team.teamuuid + "&appid=" + b.sAppid, wechat.init(), b.tpl("header-layer", b.userObj.teammember, b.find(".header-layer")), b.tpl("common-share-icon", {}, b.find(".vpage-content")), b.loadData(), app.wechat.SHARE_CALLBACK_OK = function (c) {
                        a(".home-share-note").addClass("hide"), b.userObj.team.teamuuid && api.request.get("/hfz/HfzTeamManageAction/addShareLog", {obj: {teamuuid: b.userObj.team.teamuuid}}, {quiet: !0}).then(function (a) {
                        })
                    }, b.citys.total) {
                    b.tpl("city-layer", {}, b.find(".header-layer"));
                    var d, e = b.find(".city-layer .select-layer");
                    b.citys.list.forEach(function (a, c) {
                        var f = a.id == b.sAppid ? "checked" : "";
                        c % 3 == 0 && (d = b.tpl("city-item", {}, e)), d.append(v.jsx("div", {
                            class: "city-select " + f,
                            "v-link": "*selctCity " + a.id
                        }, a.name))
                    })
                }
            })
        },

        onPaging: function() {
            this.loadData()
        },
        selctCity: function (b, c) {
            var d = this;
            d.find(".city-select").removeClass("checked"), $(b.target).addClass("checked"), d.sAppid = c, app.wechat.SHARE_LINK = location.protocol + "//" + location.host + "/consumer2/house-team-prolist.html?fopenid=" + app.session.openid + "&memberopenid=" + app.session.openid + "&teamuuid=" + d.userObj.team.teamuuid + "&appid=" + d.sAppid, wechat.init(), d.paging.reset(), d.find(".list").empty(), d.loadData()
        },
        onDidShare: function() {
            var self = this
            $('.home-share-note').addClass('hide')
            if(self.userObj.team.teamuuid) {
                api.request.get('/hfz/HfzTeamManageAction/addShareLog',{
                    obj: {
                        teamuuid: self.userObj.team.teamuuid
                    },
                },{quiet: true}).then(function(result){
                })
            }
        },

        loadData: function() {
            var self = this
            var listEl = self.find('.list')
            var search = self.find('#search').val();
            self.paging.setSize(10).start().then(function(paging) {
                var loadingEl = self.find('.loadding-bar')
                loadingEl.spin().text('')
                api.request.get('/hfz/HfzTeamManageAction/listProject',{
                    obj: {
                        followed: 1,
                        appid: self.sAppid,
                        projectname:search
                    },
                    offset: paging.count,
                    size: paging.size
                },{quiet: true}).then(function(result){
                    var data = result.data || []
                    //列表
                    data.list.forEach(function(item){
                        item.fopenid = app.session.openid
                        item.memberopenid = app.session.openid
                        item.teamuuid = self.userObj.team.teamuuid
                        item.picurl = Fn.getPicUrl(item.picurl)
                        item.ONLINE = item.cooporatetype == 100
                        if(item.displaytype == 10) {
                            //专场
                            item.logoClass = 'zc'
                        } else if(item.displaytype == 20) {
                            //主打
                            item.logoClass = 'zd'
                        } else if (item.cooporatetype == 100) {
                            //线上售楼部
                            item.logoClass = 'online'
                        } else if(item.havediscount == 1) {
                            //特价房
                            item.logoClass = 'tj'
                        } else {
                            item.logoClass = 'hide'
                        }
                        item.ISHIDE = item.logoClass == 'hide'
                        item.cooporateHide = item.cooporatetype == 300
                        item.specialHide = item.specialid > 0
                        item.BBKH = self.userObj.team.state == 3
                        item.GG = item.hasinfo == 0
                        /* if(self.userObj.agent.type == 2) {
                         item.commission = item.commission2
                         }*/
                        self.tpl('item-layer',item,listEl)
                    })
                    paging.done(data.list.length, data.total)
                    // paging.done(data.list.length, -1)
                    loadingEl.spin(false).text('载入更多')
                    if (!paging.hasMore) {
                        loadingEl.spin().text('已加载全部')
                    }
                })
            })
        },

        goCusProject: function(event, id, projectname) {
            var str = encodeURIComponent(JSON.stringify({projectid:id, projectname: projectname}));
            Page.open('./cus-management.html?project='+str)
        },

        goBbCus: function(event, id, projectname) {
            if($(event.target).closest('.btn').hasClass('disabled')) {
                return
            }
            var str = encodeURIComponent(JSON.stringify({projectid:id, projectname: projectname}));
            Page.open('./cus-add.html?project='+str)
        },

        goGgDetail: function(event, id, type) {
            if(parseInt(type) == 0) {
                return
            }else {
                Page.open('./bbpro-detail.html?id='+id)
            }
        },

        setCommission: function(event, id) {
            $.createElements({
                classes: 'popup-track-layer2',
                components: [{
                    classes: 'track-layer',
                    components: [{
                        classes: 'track-title',
                        text: '店员推荐奖励设置'
                    },{
                        classes: 'track-item',
                        components: [{
                            tag: 'label',
                            html: '奖金：'
                        },{
                            tag: 'input',
                            id: 'money',
                            value: '',
                            placeholder: '0.00元'
                        }]
                    },{
                        classes: 'close-bar',
                        components: [{
                            classes: 'btn b1',
                            text: '取消',
                            onSingleTap: function() {
                                !function(){
                                    $('.popup-track-layer2').remove()
                                    return
                                }.defer(200)
                            }
                        },{
                            classes: 'btn',
                            text: '保存',
                            onSingleTap: function() {
                                event.stopPropagation();
                                var money = $('#money').val()
                                if(!money) {
                                    return v.ui.alert('请填写奖金');
                                }
                                if(money <= 0) {
                                    return v.ui.alert('奖励金额必须大于0');
                                }
                                api.request.get("/hfz/HfzTeamManageAction/updateTeamProComm", {
                                    obj: {
                                        projectid: parseInt(id),
                                        myprocommission: money
                                    }
                                }).then(function (response) {
                                    var msg = response.data;
                                    if (true) {
                                        $('.popup-track-layer2').remove()
                                        v.ui.alert('操作成功').then(function() {
                                            location.reload()
                                        })
                                    }
                                });
                            }
                        }]
                    }]
                }]
            },document.body)
        },

        xmjc: function() {
            var self = this
            api.request.get("/hfz/HfzTeamManageAction/listSeledProjectCombo", {
                obj: {
                    teamuuid: self.userObj.team.teamuuid
                }
            }).then(function (response) {
                var msg = response.data;

                $.createElements({
                    classes: 'popup-appeal-layer',
                    components: [{
                        classes: 'appeal-layer',
                        components: [{
                            classes: 'appeal-title',
                            text: '我要纠错'
                        },{
                            components: [{
                                classes: 'view-layer',
                                components: [{
                                    tag: 'label',
                                    text: '纠错项目'
                                },{
                                    classes: 'text-value'
                                },{
                                    tag: 'select',
                                    components: [{
                                        tag: 'option',
                                        id: -1,
                                        text: ''
                                    }].concat(msg.map(function(item,index) {
                                        return {
                                            tag: 'option',
                                            value: item.id,
                                            text: item.projectname
                                        };
                                    }))
                                }]
                            },{
                                classes: 'view-layer',
                                components: [{
                                    tag: 'label',
                                    text: '备注内容：'
                                },{
                                    tag: 'textarea',
                                    rows: '5'
                                }]
                            }]
                        },{
                            classes: 'act-bar',
                            components: [{
                                text: '取消',
                                onSingleTap: function() {
                                    !function(){
                                        $('.popup-appeal-layer').remove()
                                        return
                                    }.defer(200)
                                }
                            },{
                                text: '提交',
                                onSingleTap: function() {
                                    event.stopPropagation();
                                    var type = $('select')[0].value;
                                    var content = $('textarea').val();
                                    if(!type || type < 0) {
                                        return v.ui.alert('请选择纠错项目');
                                    }
                                    if(!content) {
                                        return v.ui.alert('备注内容不能为空');
                                    }

                                    api.request.get("/hfz/HfzCommAction/addError", {
                                        obj: {
                                            projectid: parseInt(type),
                                            content: content
                                        }
                                    }).then(function (response) {
                                        var msg = response.data;
                                        $('.popup-appeal-layer').remove()
                                        return v.ui.alert('操作成功')
                                    });
                                }
                            }]
                        }]
                    }]
                },document.body)
                $('select').on('change', function() {
                    $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
                });
            });
        },

        shareNote: function() {
            v.$({
                classes: 'home-share-note',
                onSingleTap: function() {
                    $(this).remove()
                },
                components: [{
                    classes: 'home-share-arrow'
                }]
            }, document.body);
        },

        yjgl: function() {
            v.ui.alert('暂未开放')
        },
        search: function() {
            var self = this
            self.reloadData()
        },
        reloadData: function() {
            var self = this
            self.paging.reset()
            self.find('.list').empty()
            self.loadData()
        }
    }
})