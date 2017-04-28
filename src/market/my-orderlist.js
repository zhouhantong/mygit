"use strict";
Page.ready(function ($, query) {

  return {
    name: 'my-orderlist',

    options: {
      pagingEnabled: true
    },
    isFrozen: false,
    teamRole: 0, //1队长,0队员,
    hasTeam: false,
    onRender: function () {
      var self = this

      api.request.get('/hfz/HfzChannelManageAction/getRegisterInfo', {}).then(function (response) {
        self.userObj = response.data
        
        if(self.userObj.teammember && (self.userObj.team.state==1 ||self.userObj.team.state==3)){
          self.hasTeam = true
          if(app.session.openid == self.userObj.teammember.leaderopenid ){
            self.teamRole = 1
          }
        }
        if(self.userObj.team){
          self.isFrozen = (self.userObj.team.state==3)
        }
        self.loadData()
      })
    },

    onPaging: function() {
      this.loadData()
    }, 

    loadData: function() {
      var self = this
      self.paging.setSize(10).start().then(function(paging) {
        var loadingEl = self.find('.loadding-bar')
        loadingEl.spin().text('')
        api.request.get('/hfz/HfzTeamManageAction/listAppointment',{
          offset: paging.count,
          size: paging.size
        },{quiet: true}).then(function(result){
          var data = result.data || []
          //列表
          data.list.forEach(function(item){
            item.memo = item.memo || "";
            item.state = item.issubmit == 1 ? "已报备" : (item.isrecommend == 1 ? "已推荐" : (item.isrecommend == 2 ? "推荐失败" : "未推荐"));
            item.SHOWBTN = (self.hasTeam && self.isFrozen == false && item.isrecommend == 0)
            item.ROLE = self.teamRole == 1
            self.tpl('item-layer',item,self.find('.list'))
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

    recommend: function(event, id) {
      var self = this
      api.request.get("/hfz/HfzTeamManageAction/rcmdAppointment", {
        obj: {
          id: id | 0
        }
      }).then(function (response) {
        // var stext = self.teamRole == 1 ? "已报备" : "已推荐"
        self.paging.reset()
        self.find('.list').empty()
        self.loadData()  
      });  
    }  

  }
})