"use strict";
Page.ready(function($, query) {
  
  return {
    
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
        api.request.get('/sq/my/Brows/list',{
          offset: paging.count,
          size: paging.size
        },{quiet: true}).then(function(result){
          var data = result.data || []
          //列表
          data.list.forEach(function(item,index){
            var date = new Date(item.createtime)
            var m = date.getMonth() + 1
            m <= 9 ? m = '0' + m : m
            var d = date.getDate()
            d <= 9 ? d = '0' + d : d
            var h = date.getHours()
            h <= 9 ? h = '0' + h : h
            var m2 = date.getMinutes()
            m2 <= 9 ? m2 = '0' + m2 : m2
            var s = date.getSeconds()
            s <= 9 ? s = '0' + s : s
            item.time = m+'月'+d+'日'+'<br>'+h+':'+m2
            item.canSHOW1 = item.type == 1
            item.canSHOW2 = item.type == 2
            item.notetxt = item.housetype == 2 ? '秒杀价：' : '特惠价：'
            if(item.cooporatetype == 100 && item.type == 1) {
              item.goUrl = v.url.build({projectid: item.projectid}, "/consumer2/house-online.html");
            } else {
              if(item.type == 1){
                item.goUrl = v.url.build({projectid: item.projectid}, "/consumer2/detail-new.html");
              }else{
                item.goUrl = v.url.build({projectid: item.projectid}, "/consumer2/house-detail.html");
              }
            }
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