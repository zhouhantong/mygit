"use strict";
Page.ready(function ($, query) {

  return {
    name: 'kpi-perrank',

    options: {
      // menu: true
      pagingEnabled: true
    },

    onRender: function () {
      var self = this
      
      api.request.get('/hfz/KpiAction/getUserData', {}).then(function (response) {
        self.userObj = response.data
        self.tpl('info-layer',self.userObj,self.find('.info-layer'))
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
        api.request.get('/hfz/KpiAction/getUserRankList',{
          offset: paging.count,
          size: paging.size
        },{quiet: true}).then(function(result){
          var data = result.data || []
          //列表
          data.list.forEach(function(item,index){
            item.index = paging.count + index + 1
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

  }
})