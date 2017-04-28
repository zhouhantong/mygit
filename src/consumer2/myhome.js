"use strict";
Page.ready(function ($, query) {

  return {
    // name: '',

    options: {
      menu: true,
      // pagingEnabled: true
    },

    onRender: function () {
      var self = this

      var list = [
        api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}),
        api.request.get("/hfz/HfzReportAction/getTeamRoleInfo", {}),
        api.request.get("/hfz/HfzAppAction/queryPointUser", {})
      ];

      //api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function (response) {
      //self.userObj = response.data
      Promise.all(list).then(function(response) {
        self.userObj = response[0].data;
        var roleObj  = response[1] || {};
            roleObj  = roleObj.data||{ id:0,roleid:0 };
        //积分,砖石
        var pointObj = response[2]||{};
            pointObj = pointObj.data||{cash:0,balance:0};

        self.hasGxxmRole = roleObj.roleid==10;//有管辖项目权限
        self.gxxmRoleId = roleObj.id

        if(self.userObj.agent) {
          if(self.userObj.agent.state == 1) {
            aha.client.createDownloadBar()

            //审核通过
            self.agent = self.userObj.agent
            self.isSaler = self.userObj.isSaler
            self.isTeamLeader = (self.userObj.teammember && self.userObj.teammember.position == 1)
            self.isTeamMember = (self.userObj.teammember && self.userObj.teammember.position == 0)

            //开店失败(有team,teammember==null)
            self.teamState = (self.userObj.team ||{state:-1}).state;

            var tmpClass = ''
            var tmpText = ''
            if(self.isSaler) {
              if(self.isTeamLeader) {
                tmpClass = 'dz'
                tmpText = '我是驻场、店长'
              } else if(self.isTeamMember) {
                tmpClass = 'dy'
                tmpText = '我是驻场、店员'
              } else {
                tmpClass = 'dz'
                tmpText = '我是驻场'
              }
            } else if(self.isTeamLeader) {
              tmpClass = 'dz'
              tmpText = '我是店长'
            } else if(self.isTeamMember) {
              tmpClass = 'dy'
              tmpText = '我是店员'
            }
            self.tpl('info-layer',$.mixin(self.agent,{
              typeClass: (self.agent.type == 1 ? 'zy' : (self.agent.type == 2 ? '' : 'rz')), //hide
              ZYRZ: (self.agent.type == 3 && !self.userObj.isCchrApproving),
              RZING: (self.agent.type == 3 && self.userObj.isCchrApproving),
              identityClass: tmpClass,
              identity: tmpText,
              userinfo: encodeURIComponent(JSON.stringify({
                mobile: self.agent.mobile,
                name: self.agent.name
              })),
              pointsNum:pointObj.balance,
              cashNum:pointObj.cash,
              isTeamMember:self.isTeamMember
            },true), self.find('.info-layer'))

            self.wd_link =(self.isTeamLeader ? '../market/wd-leaderhome.html' : (self.isTeamMember ? '../market/wd-memberhome.html' : ''))
            self.wd_link = self.teamState==0?"../market/open-shop.html":(self.teamState==2?"../market/open-shop-fail.html":self.wd_link);//人工审核判断
            self.tpl('function-layer',{
              AGENT:true,
              REGISTER: true,
              ISAPP: aha.isReady,
              XSJL: self.userObj.isSaleManager,
              isValidLeader: self.userObj.isValidLeader,
              ISFLEX: (!self.userObj.isValidLeader && !self.isTeamLeader && !self.isTeamMember) || aha.isReady,
              ISOPEN: (self.isTeamLeader || self.isTeamMember || self.teamState != -1),
              ISSALER: self.isSaler,
              KPI: self.agent.type == 1,
              WDLINK:self.wd_link,
              GXXM:self.hasGxxmRole,
              isTeamMember:self.isTeamMember,
              NOBORDERTOP: !aha.isReady && !(self.isTeamLeader || self.isTeamMember || self.teamState != -1)
            }, self.find('.function-layer'))
            if(self.params.open && self.userObj.isValidLeader){
              self.openWd()
            }
          } else {
            self.tpl('top-layer',{}, self.find('.top-layer'))
            self.tpl('function-layer',{ISAPP: aha.isReady}, self.find('.function-layer'))
            self.tpl('status-layer',{
              notetxt: (self.userObj.agent.state == 0 ? '审核中，请耐心等待' : '审核失败，请联系管理员')
            }, self.find('.vpage-content'))
            self.tpl('reg-layer2',{agentType:self.userObj.agent.type}, self.find('.vpage-content'))
          }
        } else {
          //非注册经纪人
          self.tpl('top-layer',{}, self.find('.top-layer'))
          self.tpl('function-layer',{ISAPP: aha.isReady}, self.find('.function-layer'))
          self.tpl('reg-layer',{}, self.find('.function-layer'))
        }
        self.tpl('exceptions',{}, self.find('.vpage-content'))
      })
    },

    reregister: function(el,type) {
      var self = this
      api.request.get('/hfz/HfzChannelManageAction/delManager', {
        obj: {
          id: self.userObj.agent.id
        }
      }).then(function (response) {
        Page.open('./register-agent.html?type='+type)
      })
    },

    gxxm: function(){
      var self = this
      var items = []

      api.request.get('/hfz/HfzReportAction/listTeamRoleProject', {
        obj: {
          teamroleid:self.gxxmRoleId
        }
      }).then(function (response) {
        var obj = response.data
        obj.list.forEach(function (item,idx) {

          items.push({
            classes:"gxxm-list-item",
            dataId:idx,
            components: [
              {text:idx+1},
              {
                  classes:"pad-l",
                  text:item.projectname
              },
              {
                classes:"opt-box",
                components:[
                  { classes:"color-"+item.state,
                    text:item.state==0?"待审核":item.state==1?"已通过":"被拒绝"
                  },
                  {
                    classes:item.state==2?"opt-close":"hide",
                    tag:"img",
                    src:"./images/icon_close.png",
                    onSingleTap:function(){
                        var el = this;
                        api.request.get('/hfz/HfzReportAction/delTeamRoleProject', {
                          obj: {  id:item.id}
                        }).then(function (response) {
                            if(response.data>0){
                              $(".gxxm-list-item[data-id='"+idx+"']").remove();
                            }
                        });
                    }
                  }
                ]
              }
            ]
          })
        })

        createxmItems(items);
      })


      function createxmItems(items){
        var defalutEl = {
          classes:"gxxm-nodata",
          text:"暂无记录"
        };
        items = items.length>0?items:[defalutEl];

        var el = v.$({
          classes: 'popup-open-layer',
          components: [{
            classes:"gxxm-box",
            components: [
                {
                  classes:"gxxm-header",
                  text:"管辖项目列表"
                },
                {
                    classes:"gxxm-list",
                    components:items
                },
                {
                    classes:"gxxm-bottom",
                    components: [{
                        classes:"gxxm-bottom-bt",
                        text:"+添加一个管辖项目",
                        onSingleTap:function(){
                          Page.open('../market/pm-prolist.html');
                          el.remove();
                        }
                    }]
                },
                {
                  classes:"close-bt",
                  tag:"img",
                  src:"./images/icon_close.png",
                  onSingleTap: function() {
                    el.remove()
                  }
                }
            ]
          }]
        },document.body);
      }
    },
    openWd: function() {
      var self = this
      $.createElements({
        classes: 'popup-open-layer',
        components: [{
          classes: 'open-layer',
          components: [{
            classes: 'title',
            text: '开店协议'
          },{
            components: [{
              classes: 'view-layer',
              html: '为共同构建诚信、透明的网络消费环境，共同维护公平、规范的网络经营秩序，共同促进好房子系统的健康持续发展，本店（本人）特向广大网民及好房子承诺如下：<br>一、不发布、不传播、不推广任何有关微信的违规信息，并积极举报此类违规信息；<br>二、 积极接受广大网民及好房子的监督，严格遵守、积极维护好房子信用体系的各项规则；<br> 三、 若本店违反好房子信用体系的各项规则，本店愿意接受好房子的相应处理措施，并承担因此引发的相关责任。 <br>本店郑重承诺：本店将始终恪守上述承诺，不进行任何形式的违规操作。'
            }]
          },{
            classes: 'act-bar',
            components: [{
              text: '取消',
              onSingleTap: function() {
                !function(){
                  $('.popup-open-layer').remove()
                  return
                }.defer(200)
              }
            },{
              text: '同意',
              onSingleTap: function() {
                api.request.get("/hfz/HfzTeamManageAction/saveTeam", {
                  obj: {
                    teamname: self.userObj.agent.name
                  }
                }).then(function (response) {
                  $('.popup-open-layer').remove()

                  var msg = response.data ||{state:0}
                  if(msg.state==1) {
                    v.ui.alert('开店成功').then(function () {
                      Page.open('../market/wd-leaderhome.html')
                      location.reload()
                    })
                  }else{
                    Page.open('../market/open-shop.html')
                    location.reload()
                  }
                });
              }
            }]
          }]
        }]
      },document.body)
    },

    onOpenContact: function (event) {
      if (aha.isReady) {
        aha.openContact()
      }
    },

    onOpenRecommendCustomer: function (event) {
      if (aha.isReady) {
        aha.openRecommendCustomer()
      }
    }

  }
})