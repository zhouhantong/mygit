"use strict";
Page.ready(function($, query) {

  var self, listEl;
  
  return {
    options: {
      menu: false,
      pagingEnabled: true,
      scroller: true,
      autoRender: false
    },

    init: function(){
      self = this;
      self.loadInfo()

    },
    onRender: function() {

      listEl = self.find(".list")
      self.paging.reset().load()

      self.countData.forEach(function(item) {
        self.tpl('count-item', item, self.find('.count-layer'))
      })

      self.hitbox = self.find(".ex-hintbox");
      self.find("#balance").on("change", function (e) {
        var val = $(this).val();
        if(val>0){
          self.hitbox.html("兑换"+val+"钻石需要"+val*100+"积分")
        }else{
          self.hitbox.html("");
        }
      })

    },
    loadInfo:function(){
      api.request.get('/hfz/HfzAppAction/queryPointUser', {
        obj: {}
      }).then(function (response) {
        var data = response.data||{cash:0,balance:0,total:0,consume:0,id:0};
        self.savaId = data.id;
        self.balance = data.balance

        self.countData = [{
          type: "diamond",
          name: "钻石总数",
          count: data.cash,
          suffix: "钻石"
        },{
          type: "balance",
          name: "积分余额",
          count: data.balance,
          suffix: "积分"
        },{
          type: "points",
          name: "总积分",
          count:  data.total,
          suffix: "积分"
        },{
          type: "converted",
          name: "已兑换",
          count:  data.consume,
          suffix: "已兑换"
        }]
        
        self.tpl('stage', {balance:data.balance}, self)
        self.render();

      }).catch(function(e) {
        console.log(e)
      });
    },
    loadData: function (paging) {
      var self = this
      var listEl = self.find(".list");

      if (paging.isFirst()) {
        listEl.empty()
        self.find('.btn-bar').addClass('hide')
      }


      self.paging.setSize(10).start().then(function (paging) {
        var loadingEl = self.find('.loadding-bar')
        loadingEl.spin().text('')

        api.request.get('/hfz/HfzAppAction/queryHistory', {
          obj: {},
          offset: paging.count,
          size: paging.size
        }).then(function (response) {
          var obj = response.data
          paging.done(obj.list.length, obj.total)

          if (obj.total > 0) {
            self.find('.btn-bar').removeClass('hide')
          }

          obj.list.forEach(function (item) {
            item.time = Fn.getTime(item.createtime)
            item.points = item.points/100;
            self.tpl("history-items", item, listEl)
          })

          loadingEl.spin(false).text('载入更多')
          if (!paging.hasMore) {
            loadingEl.spin().text('已加载全部')
          }
        }).catch(function(e){

        })
      })
    },
    exChange:function(){
      var balance = self.find('#balance').val()

      if(!balance || balance<1){
        return v.ui.alert('兑换数量请输入大于0的整数');
      }
      if(balance>200){
        return v.ui.alert('单次最多兑换200个钻石');
      }
      if(balance%1!=0){
        return v.ui.alert('兑换钻石数量必须为整数个');
      }
      if(balance*100 > self.balance){
        return v.ui.alert('积分余额不足');
      }

      var params={
        balance:balance*100,
        id:self.savaId.toString()
      }
      api.request.get("/hfz/HfzAppAction/savePointUser", {
        obj: params
      }).then(function (response) {
        v.ui.alert('操作成功').then(function(){
          Page.open('./points-convert.html')
        })

      }).catch(function(e){
        v.ui.alert('操作失败').then(function(){
          Page.open('./points-convert.html')
        })
      })
    },
    onPaging: function(paging){
      this.loadData(paging)
    }
    
  }
})