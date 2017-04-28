"use strict";
Page.ready(function($, query) {
  
  return {

    name: "zy-plist",
    
    options: {
      menu: true,
      scroller: true,
      trademark: true,
      sharable: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-zy-plist');
    
      var type = parseInt(query.type) || 0;
      var housetype = parseInt(query.housetype) || 0;
      var isdiscount = parseInt(query.isdiscount) || 0;
      var hot = parseInt(query.hot) || 0;
    
      var pagetype = parseInt(query.pagetype) || 1;
      var pageTitles = ['', '热销好房', '特惠楼盘', '特惠房源', '秒杀专场'];
      /*
        pagetype
        1、好房列表,
        2、特惠楼盘,
        3、特惠房源,
        4、秒杀房源
      */
    
      //设置学区、地铁、品牌显示
      getListItem(11,createPage);
    
    
      var pageSize = 20,
          pageIndex = 1,
          loading = false,
          itemAll = [],
          total = 0;
    
      Page.setTitle(pageTitles[pagetype])
    
      // createPage();
    
      function createPage(){
        loading = true;
        var params = {
          offset: pageSize * pageIndex - pageSize,
          size: pageSize
        };
        if(type){
          params.type = type;
        }
        if(housetype){
          params.housetype = housetype;
        }
        if(isdiscount){
          params.isdiscount = isdiscount;
        }
        if(hot){
          params.hot = hot;
        }
        api.request.get(params, {action: (type==1?'/global/Project/search':'/global/Project/list')}).then(function(response){ var msg = response.data;
          if(true){
            loading = false;
            pageIndex++;
            total = msg.total;
            msg.list.forEach(function(item){
              itemAll.push(item);
              $.createElements(_createDOM(item), page.find(".plist"));
            });
          }
        });
      }
    
      function _createDOM(obj){
        return [{
          classes: "item",
          onSingleTap: function(event){
            // if(!$(event.target).hasClass('online-txt')){
            if(obj.cooporatetype == 100 && obj.type == 1) {
              Page.open('./house-online.html?projectid=' + obj.id);
            } else {
              if(obj.type == 1){
                return Page.open("./detail-new.html", {projectid: obj.id});
              }else{
                return Page.open("./house-detail.html", {projectid: obj.id});
              }
            }
            // }
          },
          components: [{
            tag: "img",
            classes: "item-icon",
            src: obj.picurl
          },{
            classes: "item-box",
            components: [{
              classes: "item-box-value1",
              html: obj.projectname
            },{
              classes: "item-box-value2",
              html: (obj.type == 1 ? obj.price : obj.address)
            },{
              classes: "item-box-value2",
              html: (obj.type == 1 ? obj.address : (obj.structure +" "+ obj.floorarearatio))
            },{
              classes: "item-box-value2 " + (obj.hasmanagerprice ? 'hasmanagerprice' : 'hide'),
              html: '本周经理报价'
            },{
              classes: "item-box-tags" + hide(pagetype == 3 || pagetype == 4),
              components: [{
                classes: "item-box-tag" + hide(obj.issubway==0),
                html: commonListItem[1]
              },{
                classes: "item-box-tag" + hide(obj.isxuequ==0),
                html: commonListItem[2]
              },{
                classes: "item-box-tag" + hide(obj.brand==0),
                html: commonListItem[0]
              // },{
              //   classes: "item-box-tag" + hide(obj.hasmanagerprice==0),
              //   html: '经理报价'
              }]
            },{
              classes: "item-box-prize-box" + hide(pagetype == 1 || pagetype == 2),
              components: [{
                classes: "item-box-prize-value1",
                html: "原价:¥"
              },{
                classes: "item-box-prize-value2",
                html: obj.propertyexpense
              },{
                classes: "item-box-prize-value3",
                html: (housetype==2?"秒杀价:¥":"特惠价¥")+obj.price
              }]
            },{
              classes: "booking" + hide(pagetype == 1 || pagetype == 2|| pagetype == 4),
              html: "已预约{num}人".replace("{num}", obj.owneropenid ? obj.reportcnt : obj.num)
            },{
              classes: "surplus" + hide(pagetype == 1 || pagetype == 2 || pagetype == 3),
              html: "剩{num}名额".replace("{num}", obj.maxnum - obj.num)
            }]
          },{
            classes: 'online-logo ' + ((obj.cooporatetype == 100 && obj.type == 1) ? '' : 'hide')
            // classes: 'online-txt ' + ((obj.cooporatetype == 100 && obj.type == 1) ? '' : 'hide'),
            // text: '进入线上售楼部>>',
            // onSingleTap: function() {
            //   Page.open('./house-online.html?projectid=' + obj.id);
            // }
          }]
        },{
          classes: "item-explain" + hide(pagetype == 1 || pagetype == 3 || pagetype == 4),
          components: [{
            classes: "item-explain-value",
            html: obj.discountdesc
          }]
        }]
      }
    
      var listenScroller = function() {
        if (app.scroller) {
          app.scroller.on('scrollEnd',function(){
            if( (this.y - this.maxScrollY) <=0
                && pageSize * (pageIndex-1) <= itemAll.length
                && loading == false && itemAll.length < total) {
              createPage();
            }
          },false);
        } else {
          setTimeout(listenScroller, 250);
        }
      };
      setTimeout(listenScroller, 250);
    
      function hide(obj){
        return classname(obj, "hide");
      }
    
      function classname(obj, classname){
        return obj ? " " + classname : ""
      }
    }
    
  }
})