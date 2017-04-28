"use strict";
Page.ready(function($, query) {
  return {
    name: "zy-classify",
    options: {
      menu: true,
      sharable: true
      // autoRender: false
    },
    onRender: function(){
      var self = this;

      api.listItemCache.get({
        titleids: [7, 20150916]
      }).then(function(response) {
        var msg = response.data;
        // //初始化banner
        self.initBanner(msg[7]);

        self.initSearch();

        self.initCard(JSON.parse(msg[20150916][0].itemtext));
      });
    },
    initBanner: function(picList){
      var self = this;
      var bBanner = [];
      var sBanner = [];
      picList.forEach(function(item) {
        var tmp = {};
        var tmpStr = item.itemtext.split(',');
        tmp.picurl = tmpStr[1];
        tmp.idx = tmpStr[0];
        if (item.idx < 100) {
          bBanner.push(tmp);
        } else {
          sBanner.push(tmp);
        }
      });
      if (bBanner.length > 0) {
        self.createBanner(bBanner);
      }
      if (sBanner.length > 0) {
        // createActivites(sBanner);
      }
    },
    createBanner: function(picList){
      var self = this;
      ! function() {
        var h = Math.floor(($(document.body).offset().width * 150) / 320);
        self.find(".banner").style("height", h + "px");
      }.defer(250);
      var picUrl = '';
      var len = picList.length;
      if (len > 1) {
        $.createElements({
          classes: 'banner-indicate',
          components: [{
            tag: 'ul',
            components: picList.map(function() {
              return {
                tag: 'li'
              }
            })
          }]
        }, '.vpage-content .banner');
        var data = [];
        for (var i = 0; i < len; i++) {
          data.push({
            classes: 'banner-img',
            dataIdx: picList[i].idx,
            onTap: function() {
              if ($(this).data('idx').indexOf('http://') >= 0) {
                Page.open($(this).data('idx'));
              } else {
                Page.open('./detail-new.html?projectid=' + $(this).data('idx'));
              }
            },
            dataIndex: i,
            components: [{
              tag: 'img',
              src: picUrl + picList[i].picurl
            }]
          });
        }
        var c = new v.ui.Carousel({
          index: 0,
          length: data.length,
          mode: 'book',
          wrap: true
        }).on('update', function(event){
          var el = event.el.empty()
          var index = event.index
          if(index >= 0){
            $.createElements(data[index % data.length], el);
          }
        }).on('change', function(event){
          var idx = this.index
          var el = this.el
          el.find("li").removeClass('hightlight')
          el.find('li:nth-child('+(idx + 1)+')').addClass('hightlight')
        }).render(self.find('.banner'));
        setInterval(function(){
          if(!c.snapping && !c.dragging){
            c.next();
          }
        }, 3000)
      } else {
        $.createElements({
          onTap: function() {
            if (picList[0].idx.indexOf('http://') >= 0) {
              Page.open(picList[0].idx);
            } else {
              Page.open('./detail-new.html?projectid=' + picList[0].idx);
            }
          },
          tag: 'img',
          src: picUrl + picList[0].picurl
        }, '.vpage-content .banner');
      }
      self.find('.banner').removeClass('hide');
    },
    initSearch: function(){
      var self = this;
      $.createElements([{
        classes: "search-box",
        components: [{
          tag: "input",
          classes: "search",
          placeholder: "项目名/地产/区域"
        }]
      }, {
        classes: "searchbt",
        onTap: function() {
          var search = $(".search-box").find(".search").val();
          if (search) {
            return Page.open("./search.html", {
              search: search
            });
          }
        }
      }], self.find(".search-panel"));
    },
    initCard: function(obj){
      var self = this;
      obj.forEach(function(list) {
        $.createElements({
          classes: "hflexbox",
          components: self.createCard(list, [])
        }, self.find(".vpage-content"));
      });
    },
    createCard: function(list, components, nospace){
      var self = this;
      var width = 0;
      list.forEach(function(item) {
        width += item.width;
      })
      list.forEach(function(item, index) {
        item.style = item.style || "";
        if (width) {
          item.style += (";width:" + (item.width / (width + 20) * 100) + "%")
        }
        components.push({
          classes: "space" + Fn.getHideClassName(index == 0 && nospace)
        });
        var components_child = [];
        if (Array.isArray(item.list)) {
          item.list.forEach(function(item) {
            components_child.push({
              classes: "hflexbox",
              components: self.createCard(item, [], true)
            });
          })
        } else {
          components_child.push({
            tag: "img",
            src: item.imgurl,
            onTap: function() {
              if (item.url) Page.open(item.url);
            }
          });
        }
        components.push({
          classes: "item",
          style: item.style,
          components: components_child
        });
      });
      components.push({
        classes: "space" + Fn.getHideClassName(nospace)
      });
      return components;
    }
  }

})