"use strict";
Page.ready(function ($, query) {

  return {
    name: 'my-notice',

    options: {
      pagingEnabled: true
    },

    onRender: function () {
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
        api.request.get('/hfz/HfzTeamManageAction/listMyNotice',{
          offset: paging.count,
          size: paging.size
        },{quiet: true}).then(function(result){
          var data = result.data || []
          //列表
          data.list.forEach(function(item){
            switch(item.type) {
              case 100010:
                item.btntxt = '预约列表'
                item.link = './my-orderlist.html'
                break
              case 100201:
                item.btntxt = '已推荐'
                item.link = './cus-management.html'
                break
              case 100303:
                item.btntxt = '已失败'
                item.link = '../open-shop-fail.html'   
                break
              case 100302:
                item.btntxt = '我的微店'
                item.link = './wd-leaderhome.html'
                break
              case 100021:
              case 100221:
                item.btntxt = '已到访'
                item.link = './cus-management.html?type=2'
                break
              case 100031:
              case 100231:
                item.btntxt = '已成交'
                item.link = './cus-management.html?type=3' 
                break
              case 100011:
              case 100012:
              case 100211:
              case 100212:
                item.btntxt = '已报备'
                item.link = './cus-management.html?type=1'
                break
              case 100331:
                item.btntxt = '未报备'
                item.link = './cus-management.html?type=0'   
                break                                     
            }
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

    }

  }
})