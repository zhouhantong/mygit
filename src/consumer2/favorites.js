"use strict";
Page.ready(function($, query) {
  
  return {

    name: "histories",
    
    options: {
      menu: true,
      pagingEnabled: true
    },

    onRender: function() {
      var self = this
      self.loadData()
    },

    onPaging: function() {
      this.loadData()
    },

    loadData: function() {
      var self = this
      self.paging.setSize(10).start().then(function(paging) {
        var loadingEl = self.find('.loadding-bar')
        loadingEl.spin().text('')
        api.request.get('/sq/my/Favorite/list',{
          offset: paging.count,
          size: paging.size
        },{quiet: true}).then(function(result){
          var data = result.data || []
          //列表
          data.list.forEach(function(item,index){
            item.canSHOW1 = item.type == 1
            item.canSHOW2 = item.type == 2
            item.notetxt = item.housetype == 2 ? '秒杀价：' : '特惠价：'
            item.goUrl = (item.type == 2 ? './house-detail.html?projectid=' + item.projectid : './detail-new.html?projectid=' + item.projectid)
            self.tpl('house-item',item,self.find('.list'))
          })
          paging.done(data.list.length, data.total)
          // paging.done(data.list.length, -1)
          loadingEl.spin(false).text('载入更多')
          if (!paging.hasMore) {
            loadingEl.spin().text('已加载全部')
          }
        })
      })
    }
  }
})