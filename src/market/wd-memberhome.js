"use strict";
Page.ready(function ($, query) {

  return {
    name: 'wd-memberhome',

    options: {
      pagingEnabled: true,
      wxSharable: false
    },

    isAgent: false,
    leaderOpenid: '',
    teamuuid: '',

    onRender: function () {
      var self = this
      api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function (response) {
        self.userObj = response.data
        if(!self.userObj.team) {
          v.ui.alert('您还没有开通微店').then(function(){
            Page.open('../consumer2/myhome.html')
          });
        }

        if(self.userObj.agent && self.userObj.agent.state == 1 && self.userObj.agent.workstate != 0 && self.userObj.agent.type != 3){
          self.isAgent = true
        }
        self.leaderOpenid = self.userObj.teammember.leaderopenid 

        app.wechat.SHARE_TITLE = '这是'+self.userObj.teammember.leadername+'的好房子微店';
        app.wechat.SHARE_DESC = '这是'+self.userObj.teammember.leadername+'的好房子微店';
        app.wechat.SHARE_TIMELINE_TITLE = '这是'+self.userObj.teammember.leadername+'的好房子微店';
        app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/consumer2/house-team-prolist.html?fopenid='+(self.isAgent ? app.session.openid : self.leaderOpenid)+'&memberopenid='+app.session.openid+'&teamuuid='+self.userObj.team.teamuuid;
        self.teamuuid = self.userObj.team.teamuuid;

        self.tpl('header-layer',self.userObj.teammember,self.find('.header-layer'))
        self.tpl('common-share-icon',{},self.find('.vpage-content'))
        self.loadData()
        app.wechat.SHARE_CALLBACK_OK = function(type){
          $('.home-share-note').addClass('hide')
          if(self.userObj.team.teamuuid) {
            api.request.get('/hfz/HfzTeamManageAction/addShareLog',{
              obj: {
                openid: app.session.openid,
                teamuuid: self.userObj.team.teamuuid
              },
            },{quiet: true}).then(function(result){
            })
          }
        }

        wechat.init();
      })
    },

    onPaging: function() {
      this.loadData()
    }, 

    loadData: function() {
      var self = this
      var listEl = self.find('.list')

      self.paging.setSize(10).start().then(function(paging) {
        var loadingEl = self.find('.loadding-bar')
        loadingEl.spin().text('')
        api.request.get('/hfz/HfzTeamManageAction/listProject',{
          obj: {
            followed: 1
          },
          offset: paging.count,
          size: paging.size
        },{quiet: true}).then(function(result){
          var data = result.data || []
          //列表
          data.list.forEach(function(item){
            item.fopenid = (self.isAgent ? app.session.openid : self.leaderOpenid)
            item.memberopenid = (self.isAgent ? app.session.openid : self.leaderOpenid)
            item.teamuuid = self.teamuuid
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

  }
})