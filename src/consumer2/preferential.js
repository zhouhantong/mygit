"use strict";
Page.ready(function($, query) {
  
  return {
    name: 'zy-preferential',
    
    options: {
      menu: true,
      scroller: true,
      trademark: true,
      wx: true
    },

    onRender: function() {
      var page = this // 自动生成的代码
      var page = $('#page-zy-preferential');
    
      function init(){
        api.listItemCache.get({
          titleids:[7]
        }).then(function(response){ var msg = response.data;
          //初始化banner
          _initBanner(msg[7]);
    
          _initSearch();
    
          if("Promise" in window && "all" in Promise && "then" in Promise.prototype){
            _usePromise();
          }else{
            _useSimple();
          }
        });
      }
    
      function _usePromise(){
        Promise.all([api.request.get('/global/Project/search', {
          isdiscount: 1,
          offset: 0,
          size: 2
        }),api.request.get('/hfz/HfzAppointmentAction/listHouse', {
          // type: 2,
          // housetype: 1,
          state: 1,
          offset: 0,
          size: 2
        }),api.request.get('/global/Project/list', {
          type: 2,
          housetype: 2,
          offset: 0,
          size: 2
        })]).then(function(datas){
          _createMenus(datas[0].msg.list, datas[1].msg.list, datas[2].msg.list);
        });
      }
    
      function _useSimple(){
        api.request.get("/global/Project/search", {
          isdiscount: 1,
          offset: 0,
          size: 2
        }).then(function(response){ var msg = response.data;
          if(true){
            var list1 = msg.list.slice(0,2);
            api.request.get("/hfz/HfzAppointmentAction/listHouse", {
              // type: 2,
              // housetype: 1,
              state: 1,
              offset: 0,
              size: 2
            }).then(function(response){ var msg = response.data;
              if(true){
                var list2 = msg.list.slice(0,2);
                api.request.get("/global/Project/list", {
                  type: 2,
                  housetype: 2,
                  offset: 0,
                  size: 2
                }).then(function(response){ var msg = response.data;
                  if(true){
                    var list3 = msg.list.slice(0,2);
                    _createMenus(list1, list2, list3);
                  }
                });
              }
            });
          }
        });
      }
    
      function _initBanner(picList) {
        var bBanner = [];
        var sBanner = [];
        picList.forEach(function(item) {
          var tmp = {};
          var tmpStr = item.itemtext.split(',');
          tmp.picurl = tmpStr[1];
          tmp.idx = tmpStr[0];
          if(item.idx < 100) {
            bBanner.push(tmp);
          } else {
            sBanner.push(tmp);
          }
        });
        if(bBanner.length > 0) {
          createBanner(bBanner);
        }
        if(sBanner.length > 0) {
          // createActivites(sBanner);
        }
      }
      //banner
      function createBanner(picList) {
        !function(){
          var h = Math.floor((window.innerWidth * 150) / 320);
          page.find(".banner").style("height", h + "px");
        }.defer(250);
        var picUrl = '';
        var len = picList.length;
        if(len > 1) {
          $.createElements({
            classes: 'banner-indicate',
            components: [{
              tag: 'ul',
              components: picList.map(function(){
                return {
                  tag: 'li'
                }
              })
            }]
          }, '.vpage-content .banner');
          var data = [];
          for(var i=0;i<len;i++) {
            data.push({
              classes: 'banner-img',
              dataIdx: picList[i].idx,
              onTap: function() {
                Page.open('./detail.html?projectid='+$(this).data('idx'));
              },
              dataIndex: i,
              components: [{
                tag: 'img',
                src: picUrl + picList[i].picurl
              }]
            });
          }
          var duration = 5000;
          var _auto = function() {
            if (!slides.dragging && !slides.snapping) {
              slides.next();
              _auto.defer(duration);
            }
          };
          var slides = new v.ui.Carousel({
            wrap: true
          }).on('change', function() {
            _auto.cancel()
            _auto.defer(duration);
          }).on('update', function(event) {
            var header = $(this.centerEl).find('.banner-img');
            if (header && header.length) {
              var idx = parseInt(header.data('index'));
              $('.vpage-content .banner li').removeClass('hightlight')
              $('.vpage-content .banner li:nth-child('+(idx+1)+')').addClass('hightlight')
            }
            // if (index < 0 || index >= data.length) {
            //   return false;
            // }
            $(this.leftEl).vendor('z-index','1');
            var index = ((event.index % len) + len) % len;
            event.el.empty().append(data[index]);
          }).render($('.vpage-content .banner'));
        } else {
          $.createElements({
            onTap: function() {
              Page.open('./detail.html?projectid='+picList[0].idx);
            },
            tag: 'img',
            src: picUrl + picList[0].picurl
          }, '.vpage-content .banner');
        }
        page.find('.banner').removeClass('hide');
      }
      //活动
      function createActivites(picList) {
        var len = picList.length;
        var data = [];
        var groupData = [];
        var tmp = [];
        for(var i=0;i<len;i++) {
          tmp.push(picList[i]);
          if(i % 2 == 1 || i == len - 1) {
            groupData.push(tmp);
            tmp = [];
          }
        }
        for(var i=0;i<groupData.length;i++) {
          data.push({
            classes: 'hflexbox',
            style: 'height: 83px',
            components: groupData[i].map(function(item) {
              return {
                onTap: function() {
                  if(item.idx == -1) {
                    Page.open('./rank.html');
                  } else if(item.idx == -2){
                    Page.open('./news.html');
                  } else {
                    Page.open('./detail.html?projectid='+item.idx);
                  }
                },
                tag: 'img',
                src: item.picurl
              }
            })
          });
        }
        var duration = 5000;
        var _auto = function() {
          if (!slides.dragging && !slides.snapping) {
            slides.next();
            _auto.defer(duration);
          }
        };
        var slides = new v.ui.Carousel({
          wrap: true,
          enabled: (data.length > 1)
        }).on('change', function() {
          if (this.enabled) {
            _auto.cancel()
            _auto.defer(duration);
          }
        }).on('update', function(event) {
          $(this.leftEl).vendor('z-index','1');
          var index = Math.abs(event.index) % data.length;
          event.el.empty().append(data[index]);
        }).render($('.vpage-content .activities'));
        page.find('.activities').removeClass('hide');
      }
    
      function _initSearch(){
        $.createElements([{
          classes: "search-box",
          components: [{
            tag: "input",
            classes: "search",
            placeholder: "项目名/地产/区域"
          }]
        },{
          classes: "searchbt",
          onTap: function(){
            var search = $(".search-box").find(".search").val();
            if(search){
              return Page.open("./search.html", {search: search});
            }
          }
        }], page.find(".search-panel"));
      }
    
      function _createMenus(list1, list2, list3){
        $.createElements({
          classes: "preferential-menu-box",
          components: [{
            classes: "preferential-menu",
            components: [{
              classes: "title-icon one",
              components: [{
                tag: "img",
                src: "./images/preferential-menu1.png"
              },{
                classes: "title-name",
                html: query.title1 || "特惠楼盘"
              }]
            },{
              classes: "preferential-menu-bt one",
              onTap: function(e){
                Page.open("./plist.html", {type: 1, pagetype: 2, isdiscount: 1});
              },
              components: list1.map(function(item){
                return {
                  classes: "preferential-menu-item",
                  onTap: function(){
                    // Page.open("./detail.html", {projectid: item.id});
                  },
                  components: [{
                    tag: "img",
                    classes: "preferential-menu-item-img",
                    src: item.picurl
                  },{
                    classes: "preferential-menu-item-valuebox",
                    components: [{
                      classes: "preferential-menu-item-value",
                      html: item.projectname
                    },{
                      classes: "preferential-menu-item-value small",
                      html: item.discounttag.split(",")[0]
                    }]
                  }]
                }
              })
            }]
          },{
            classes: "preferential-menu",
            components: [{
              classes: "title-icon two",
              components: [{
                tag: "img",
                src: "./images/preferential-menu2.png"
              },{
                classes: "title-name",
                html: query.title2 || "特惠房源"
              }]
            },{
              classes: "preferential-menu-bt two",
              onTap: function(e){
                Page.open("./plist2.html", {type: 2, pagetype: 3, housetype: 1});
              },
              components: list2.map(function(item){
                return {
                  classes: "preferential-menu-item",
                  onTap: function(e){
                    // Page.open("./house-detail.html", {projectid: item.id});
                  },
                  components: [{
                    tag: "img",
                    classes: "preferential-menu-item-img",
                    src: item.picurl
                  },{
                    classes: "preferential-menu-item-valuebox",
                    components: [{
                      classes: "preferential-menu-item-value",
                      html: item.projectname
                    },{
                      classes: "preferential-menu-item-value small",
                      html: item.structure +" "+  item.discounttag.split(",")[0]
                    }]
                  }]
                }
              })
            }]
          },{
            classes: "preferential-menu",
            components: [{
              classes: "title-icon three",
              components: [{
                tag: "img",
                src: "./images/preferential-menu3.png"
              },{
                classes: "title-name",
                html: query.title3 || "秒杀专场"
              }]
            },{
              classes: "preferential-menu-bt three",
              onTap: function(){
                Page.open("./plist.html", {type: 2, pagetype: 4, housetype: 2});
              },
              components: list3.length > 0 ? list3.map(function(item){
                return {
                  classes: "preferential-menu-item",
                  onTap: function(e){
                    // Page.open("./house-detail.html", {projectid: item.id});
                  },
                  components: [{
                    tag: "img",
                    classes: "preferential-menu-item-img",
                    src: item.picurl
                  },{
                    classes: "preferential-menu-item-valuebox",
                    components: [{
                      classes: "preferential-menu-item-value",
                      html: item.projectname
                    },{
                      classes: "preferential-menu-item-value small",
                      html: "秒杀价:¥" + item.price
                    }]
                  }]
                }
              }) :[{
                tag: "img",
                src: "./images/icon1.jpg"
              }]
            }]
          }]
        }, page.find(".vpage-content"));
      }
    
      function hide(obj){
        return classname(obj, "hide");
      }
    
      function classname(obj, classname){
        return obj ? " " + classname : ""
      }
    
      init();
    }
    
  }
})