"use strict";
Page.ready(function ($, query) {

  var teamState = true //false表示冻结状态

  return {
    name: 'wd-projectmanager',

    options: {
      pagingEnabled: true,
      autoRender: false
    },

    sOptin: 0,
    sortName: 'commission',

    init: function () {
      var self = this
      '/hfz/HfzChannelManageAction/getRegisterInfo'.GET().then(obj => {
        self.userObj = obj || {};
        if(self.userObj.team && self.userObj.team.state == 3){
          teamState = false;
        }
        self.render();
      })
    },

    onRender: function () {
      var self = this

      self.tpl('tab-layer', {}, self.find('.tab-layer'))
      self.tpl('search-layer', {}, self.find('.search-layer'))
      self.tpl('actsort-layer', {}, self.find('.actsort-layer'))
      self.tpl('common-home-icon', {}, self.find('.vpage-content'))

      self.loadData()
    },

    onPaging: function() {
      this.loadData()
    },     

    loadData: function() {
      var self = this
      var listEl = self.find('.list')

      var search = self.find('#search').val()
      var params = {}

      if(search) {
        params.projectname = search
      }
      params.sortname = self.sortName
      if(self.sOptin == 1) {
        params.followed = 1
      }
      self.paging.setSize(10).start().then(function(paging) {
        var loadingEl = self.find('.loadding-bar')
        loadingEl.spin().text('')
        api.request.get('/hfz/HfzTeamManageAction/listProject',{
          obj: params,
          offset: paging.count,
          size: paging.size
        },{quiet: true}).then(function(result){
          var data = result.data || []
          //列表
          data.list.forEach(function(item){
            item.picurl = Fn.getPicUrl(item.picurl)
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
            item.HIDE = (self.sOptin == 0)
            item.FREEZE = !teamState
            if(self.userObj.agent.type == 2) {
              item.commission = item.commission2
            }
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

    changeTab: function(event, type) {
      var self = this
      if($(event.target).hasClass('selected')) {
        return
      }
      self.find('.tab-layer > div').removeClass('selected')
      $(event.target).addClass('selected')
      if(type == 'a') {
        self.sOptin = 0
      } else {   
        self.sOptin = 1
      }
      self.reloadData()
    },

    search: function() {
      var self = this
      self.reloadData()   
    },

    sortList: function(event,type) {
      var self = this
      self.find('.actsort-layer .btn').removeClass('selected')
      $(event.target).closest('.btn').addClass('selected')
      self.sortName = type
      self.reloadData()    
    },   

    reloadData: function() {
      var self = this
      self.paging.reset()
      self.find('.list').empty()
      self.loadData()       
    },

    follow: function(event, id) {
      var self = this
      if($(event.target).hasClass('selected')) {
        api.request.get("/hfz/HfzTeamManageAction/unfollowProject", {
          obj: {
            ids: id | 0
          }
        }).then(function (response) {
          $(event.target).removeClass('selected')
        });
      } else {
        api.request.get("/hfz/HfzTeamManageAction/followProject", {
          obj: {
            ids: id | 0
          }
        }).then(function (response) {
          $(event.target).addClass('selected')
        });
      }
    },

    top: function(event, id) {
      var self = this
      api.request.get("/hfz/HfzTeamManageAction/topAllocated", {
        obj: {
          projectid: id | 0
        }
      }).then(function (response) {
        self.reloadData()
      });      
    }, 

    del: function(event, id) {
      var self = this
      api.request.get("/hfz/HfzTeamManageAction/unfollowProject", {
        obj: {
          ids: id | 0
        }
      }).then(function (response) {
        $(event.target).closest('.item-layer').remove()
      });  
    },


  }
})