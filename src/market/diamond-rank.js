"use strict";
Page.ready(function($, query) {

  var self, listEl

  return {
    options: {
      menu: false,
      autoRender: false,
      scroller: true,
      pagingEnabled: true
    },

    init: function() {
      self = this;
      self.render();
    },

    onRender: function() {
      self = this
      self.tpl('stage', {}, self);
      listEl = self.find(".list")
      self.listType="1";
      self.rankIndex=1;
      self.lastTotal=0;

      //self.paging.load();
      self.paging.reset().load()
      self.getSelfRank()
    },

    onPaging: function(paging) {

      if (paging.isFirst()) {
        listEl.empty();
      }
      this.loadData(paging)


    },
    getSelfRank:function(){

      api.request.get('/hfz/HfzAppAction/queryRanking', {
        obj: {}
      }).then(function (response) {
        var data = response.data;
        data.rankType="积分"

        self.find(".fixed-item").remove()
        self.tpl('fixed-item', data, self.el);
      })
    },
    getSelfCashRank:function(){

      api.request.get('/hfz/HfzAppAction/queryDiamondsRanking', {
        obj: {}
      }).then(function (response) {
        var data = response.data;
        data.rankType="钻石"

        self.find(".fixed-item").remove()
        self.tpl('fixed-item', data, self.el);
      })
    },

    loadData:function(paging){
      //queryAlluser


      self.paging.setSize(10).start().then(function (paging) {
        var loadingEl = self.find('.loadding-bar')
        loadingEl.spin().text('')

        var startIndex = paging.count

        api.request.get('/hfz/HfzAppAction/queryAlluser', {
          obj: {type:self.listType},
          offset: paging.count,
          size: paging.size
        }).then(function (response) {

          var obj = response.data
          paging.done(obj.list.length, obj.total)


          if (obj.total > 0) {
            self.find('.btn-bar').removeClass('hide')
          }else{
              self.tpl("noitem", {}, listEl);
              return;
          }



          obj.list.forEach(function(item, index){

            item.rankType=self.isCash?"钻石":"积分"
            item.total= self.isCash?item.cash:item.total

            var idx;
            if(self.lastTotal ==item.total){
              idx = self.rankIndex;
            }else {
              idx = startIndex + index + 1;
              if(idx!=1){
                  idx=idx;
              }
              self.rankIndex = idx
            }

            self.lastTotal=item.total


            self.tpl("item", v.mixin({
                index: idx,
                HIDE_INDEX: idx <= 3
              }, item), listEl)
            })

          loadingEl.spin(false).text('载入更多')
          if (!paging.hasMore) {
            loadingEl.spin().text('已加载全部')
          }
        }).catch(function(e){

        })
      })
    },
    totalRank:function(e){

      if(self.listType!="1"){
        self.find(".head-bt div").removeClass("cust-tap").get(0).addClass("cust-tap");

        self.listType ="1"
        self.isCash =false
        self.rankIndex=1
        self.lastTotal=0

        self.getSelfRank()
        self.paging.reset().load()
      }
    },
    cashRank:function(e){
      if(self.listType!="2"){
        self.find(".head-bt div").removeClass("cust-tap").last().addClass("cust-tap");

        self.listType ="2"
        self.isCash =true
        self.rankIndex=1
        self.lastTotal=0

        self.getSelfCashRank()
        self.paging.reset().load()
      }
    }
  }
})