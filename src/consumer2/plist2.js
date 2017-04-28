"use strict";
Page.ready(function($, query) {

  var self
    
  var type = parseInt(query.type) || 0;
  var housetype = parseInt(query.housetype) || 0;
  var isdiscount = parseInt(query.isdiscount) || 0;
  var hot = parseInt(query.hot) || 0;

  var pagetype = parseInt(query.pagetype) || 1;
  var pageTitles = ['', '热销好房', '特惠楼盘', '特惠房源', '秒杀专场'];
  var tmpArray = [];
  var state = 0;
  var listEl = $(".list");
  
  return {
    name: "zy-plist",
    options: {
      menu: true,
      autoRender: false,
      pagingEnabled: true,
      sharable: true
    },
    init: function(){
      self = this;

      Page.setTitle(pageTitles[pagetype]);

      if(query.check) {
        page.tpl("item-btn", {}, page.find(".topHeader"));
      }

      self.render();

    },
    onRender: function(){

      self.paging.reset().load();
    },

    onPaging: function(paging){
      if (query.check) {
        var params = {
          state: state,
          approveropenid: app.session.openid
        };
      } else {
        state = 1
        var params = {
          // type: type,
          // housetype: housetype,
          state: state
        };
        if (query.isowner) {
          $.mixin(params, {
            owneropenid: app.session.openid
          }, true);
        }
      }

      if (paging.isFirst()) {
        listEl.empty()
      }

      api.request.get('/hfz/HfzAppointmentAction/listHouse', {
        obj: params,
        offset: paging.count,
        size: paging.size
      }).then(function(response){
        var obj = response.data
        paging.done(obj.list.length, obj.total)
        if (obj.total == 0) {
          return self.tpl("noitem", {}, listEl);
        }
        obj.list.forEach(function(item) {
          if (Fn.isInarray(tmpArray, item.projectname)) {
            item.HEADER = false;
          } else {
            item.HEADER = true;
            tmpArray.push(item.projectname);
          }
          item.booknum = (item.owneropenid ? item.reportcnt : item.num);
          item.id = (item.Id ? item.Id : item.id);
          item.BTNSHOW = (state == 0 && query.check);
          item.APSTATE = (state == 1);
          self.tpl("item", item, listEl);
        })
      });
    },

    goDetail: function(event, id) {
      Page.open("./house-detail.html", {
        projectid: id,
        fromsrc: 2
      });
    },
    approveHouse: function(event, id, s) {
      api.request.get("/hfz/HfzAppointmentAction/approveHouse", {
        obj: {
          ids: id,
          state: parseInt(s)
        }
      }).then(function(obj) {
        tmpArray = [];
        self.find('.list').empty();
        self.render();
      })
    },
    selectState: function(event, id) {
      self.find('li').removeClass('selected');
      $(event.target).addClass('selected');
      self.find('.list').empty();
      tmpArray = [];
      state = parseInt(id);
      self.render();
    }
  }
  // return {
    
  //   options: {
  //     menu: true,
  //     scroller: true,
  //     trademark: true,
  //     wx: true
  //   },

  //   onRender: function() {
  //     var page = this // 自动生成的代码
  //     // var page = $('#page-zy-plist');
    
  //     var type = parseInt(query.type) || 0;
  //     var housetype = parseInt(query.housetype) || 0;
  //     var isdiscount = parseInt(query.isdiscount) || 0;
  //     var hot = parseInt(query.hot) || 0;
    
  //     var pagetype = parseInt(query.pagetype) || 1;
  //     var pageTitles = ['', '热销好房', '特惠楼盘', '特惠房源', '秒杀专场'];
  //     var tmpArray = [];
  //     var state = 0;
  //     /*
  //       pagetype
  //       1、好房列表,
  //       2、特惠楼盘,
  //       3、特惠房源,
  //       4、秒杀房源
  //     */
    
  //     //设置学区、地铁、品牌显示
  //     // getListItem(11,initPage);
    
  //     Page.setTitle(pageTitles[pagetype]);
    
  //     if(query.check) {
  //       page.tpl("item-btn", {}, page.find(".topHeader"));
  //     }
    
  //     initPage();
    
  //     function initPage(){
  //       if(query.check) {
  //         var params = {
  //           state: state,
  //           approveropenid: app.session.openid
  //         };
  //       } else {
  //         state = 1
  //         var params = {
  //           // type: type,
  //           // housetype: housetype,
  //           state: state
  //         };
  //         if(query.isowner) {
  //           $.mixin(params,{owneropenid: app.session.openid},true);
  //         }
  //       }
  //       Paging.getPaging().reset().setFactory(function(){
  //         return api.request.get('/hfz/HfzAppointmentAction/listHouse', {
  //           obj: params,
  //           offset: this.pageIndex * this.pageSize - this.pageSize,
  //           size: this.pageSize
  //         });
  //       }, function(obj){
  //         if(obj.total == 0){
  //           return page.tpl("noitem", {}, page.find(".list"));
  //         }
  //         obj.list.forEach(function(item){
  //           if(tmpArray.includes(item.projectname)) {
  //             item.HEADER = false;
  //           }else {
  //             item.HEADER = true;
  //             tmpArray.push(item.projectname);
  //           }
  //           item.booknum = (item.owneropenid ? item.reportcnt : item.num);
  //           item.id = (item.Id ? item.Id : item.id);
  //           item.BTNSHOW = (state == 0 && query.check);
  //           item.APSTATE = (state == 1);
  //           page.tpl("item", item, page.find(".list"));
  //         })
  //       }).start();
  //     }
    
  //     page.goDetail = function(event, id) {
  //       Page.open("./house-detail.html", {projectid: id,fromsrc: 2});
  //     }
    
  //     page.approveHouse = function(event, id, s) {
  //       api.request.get("/hfz/HfzAppointmentAction/approveHouse", {
  //         obj: {
  //           ids: id,
  //           state: parseInt(s)
  //         }
  //       }).then(function(obj){
  //         tmpArray = [];
  //         page.find('.list').empty();
  //         initPage();
  //       })
  //     }
    
  //     page.selectState = function(event, id) {
  //       page.find('li').removeClass('selected');
  //       $(event.target).addClass('selected');
  //       page.find('.list').empty();
  //       tmpArray = [];
  //       state = parseInt(id);
  //       initPage();
  //     }
  //   }
    
  // }
})