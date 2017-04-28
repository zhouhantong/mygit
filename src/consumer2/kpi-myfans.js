"use strict";
Page.ready(function ($, query) {

  return {
    name: 'kpi-myfans',

    options: {
      // menu: true
      pagingEnabled: true
    },
    type: 0,

    onRender: function () {
      var self = this
      api.request.get('/hfz/KpiAction/getUserData', {}).then(function (response) {
        self.userObj = response.data
        self.listEl = self.find('.list')
        self.tpl('select-layer',self.userObj,self.find('.select-layer'))
        self.loadData()
      })
    },

    onPaging: function() {
      this.loadData()
    },

    loadData: function() {
      var self = this
      self.action = (self.type == 0 ? '/hfz/KpiAction/getFansList' : '/hfz/KpiAction/getDailySubList')
      self.paging.setSize(10).start().then(function(paging) {
        var loadingEl = self.find('.loadding-bar')
        loadingEl.spin().text('')
        api.request.get(self.action,{
          obj: {
            openid: app.session.openid
          },
          offset: paging.count,
          size: paging.size
        },{quiet: true}).then(function(result){
          var data = result.data || []
          //列表
          if(paging.count == 0 && self.type == 1) {
            self.tpl('item-layer3',self.userObj,self.listEl)
          }
          data.list.forEach(function(item,index){
            if(self.type == 0) {
              item.atime = Fn.getFullTime(item.createtime)
              self.tpl('item-layer',item,self.listEl)
            }else {
              self.tpl('item-layer2',item,self.listEl)
            }
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

    changeTab: function(event,type){
      var self = this
      if($(event.target).hasClass('selected')) {
        return
      }
      self.find('.select-bar > div').removeClass('selected')
      $(event.target).addClass('selected')
      if(type == 'a') {
        self.type = 0
      } else {   
        self.type = 1
      }
      self.paging.reset()
      self.listEl.empty()
      self.loadData()     
    }

  }
})