"use strict";
Page.ready(function($, query) {

  var banners = [];
  var idx = 0;
  var colors = ['#C18536','#003866','#006837']

  return {
    name: 'zy-plist3',
    
    options: {
      menu: true,
      scroller: true,
      trademark: true,
      wx: true,
      pagingEnabled: true,
      sharable: true
    },

    onRender: function() {
      //初始化banner
      api.listItemCache.get({
        titleids: [20151203]
      }).then(response => {
        banners = response.data[20151203].map(item => {
          var tmpStr = item.itemtext.split('[##]');
          return { img: tmpStr[0], url: tmpStr[1] }
        })
        this.initBanners(banners);
      });

      this.paging.load()
    },

    onPaging: function (paging) {
      var listEl = this.find(".list");
      if (paging.isFirst()) {
        listEl.empty()
      }
      paging.start().then(paging => {
        api.request.get('/hfz/HfzAppointmentAction/listHouse', {
          obj: {
            state: 1
          },
          offset: paging.count,
          size: paging.size
        }).then(response => {
          var obj = response.data
          paging.done(obj.list.length, obj.total)
          
          if (obj.total == 0) {
            return this.tpl("noitem", {}, listEl);
          }
          obj.list.forEach(function (item) {
            item.time = this.getRTime(item.deadline);
            item.GROUPBG = ('./images/plist-bg' + (idx % 3) + '.png');
            item.IMGSRC = item.picurl;
            item.textcolor = colors[idx % 3];
            item.id = (item.Id ? item.Id : item.id);
            idx++;
            this.tpl("item", item, this.find(".list"));
          })
        })
      })
    },

    initBanners: function (picList) {
      (() => {
        var h = Math.floor((window.innerWidth * 100) / 320);
        this.find(".banner").style("height", h + "px");
        // this.find('aside').style('top',h + 1 + "px");
        // this.find('.vpage-content').style('margin-top',h + 1 + "px");
        // this.find('aside').removeClass('hide');
      }).defer(250);
      var picUrl = '';
      var len = picList.length;
      if (len > 1) {
        $.createElements({
          classes: 'banner-indicate',
          components: [{
            tag: 'ul',
            components: picList.map(function () {
              return {
                tag: 'li'
              }
            })
          }]
        }, '.vpage-content .banner');
      }

      var data = [];
      for (var i = 0; i < len; i++) {
        data.push({
          classes: 'banner-img',
          dataIdx: picList[i].idx,
          dataUrl: picList[i].url,
          onSingleTap: function () {
            if ($(this).data('url')) {
              Page.open($(this).data('url'));
            }
          },
          dataIndex: i,
          components: [{
            tag: 'img',
            src: picUrl + picList[i].img
          }]
        });
      }
      var duration = 5000;
      var _auto = function () {
        if (!slides.dragging && !slides.snapping) {
          slides.next();
          _auto.defer(duration);
        }
      };
      var slides = new v.ui.Carousel({
        wrap: true,
        enabled: (data.length > 1)
      }).on('change', function () {
        if (this.enabled) {
          _auto.cancel()
          _auto.defer(duration)
        }
      }).on('update', function (event) {
        var header = $(this.centerEl).find('.banner-img');
        if (header && header.length) {
          var idx = parseInt(header.data('index'));
          $('.vpage-content .banner li').removeClass('hightlight')
          $('.vpage-content .banner li:nth-child(' + (idx + 1) + ')').addClass('hightlight')
        }
        $(this.leftEl).vendor('z-index', '1');
        var index = ((event.index % len) + len) % len;
        event.el.empty().append(v.$(data[index]));
      }).render($('.vpage-content .banner'));
    },

    getRTime: function (time) {
      var timestamp = new Date().getTime();
      var t = time - timestamp;
      if (t > 24 * 60 * 60 * 1000) {
        return '剩 ' + Math.ceil(t / (24 * 60 * 60 * 1000)) + ' 天'
      } else if (t > 60 * 60 * 1000) {
        return '剩 ' + Math.ceil(t / (60 * 60 * 1000)) + ' 小时'
      } else if (t > 60 * 1000) {
        return '剩 ' + Math.ceil(t / (60 * 1000)) + ' 分钟'
      } else {
        return '剩 ' + Math.ceil(t / (1000)) + ' 秒'
      }
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
  //     var banners = [];
  //     var idx = 0;
  //     var colors = ['#C18536','#003866','#006837']
    
  //     initPage();
    
  //     function initPage(){
  //       Paging.getPaging().reset().setFactory(function(){
  //         return api.request.get('/hfz/HfzAppointmentAction/listHouse', {
  //           obj: {
  //             state: 1,
  //           },
  //           offset: this.pageIndex * this.pageSize - this.pageSize,
  //           size: this.pageSize
  //         });
  //       }, function(obj){
  //         if(obj.total == 0){
  //           return page.tpl("noitem", {}, page.find(".list"));
  //         }
  //         obj.list.forEach(function(item){
  //           item.time = getRTime(item.deadline);
  //           item.GROUPBG = ('./images/plist-bg'+(idx%3)+'.png');
  //           item.IMGSRC = app._photoUrl(item.picurl);
  //           item.textcolor = colors[idx%3];
  //           item.id = (item.Id ? item.Id : item.id);
  //           idx++;
  //           page.tpl("item", item, page.find(".list"));
  //         })
  //       }).start();
  //     }
    
  //     //初始化banner
  //     api.listItemCache.get({
  //       titleids:[20151203]
  //     }).then(function(response){ var msg = response.data;
  //       msg[20151203].forEach(function(item){
  //         var tmpStr = item.itemtext.split('[##]');
  //         banners.push({
  //           img: tmpStr[0],
  //           url: tmpStr[1]
  //         });
  //       });
  //       initBanners(banners);
  //     });
    
  //     function initBanners(picList) {
  //       !function(){
  //         var h = Math.floor(($.env.screen.width * 100) / 320);
  //         page.find(".banner").style("height", h + "px");
  //         // page.find('aside').style('top',h + 1 + "px");
  //         // page.find('.vpage-content').style('margin-top',h + 1 + "px");
  //         // page.find('aside').removeClass('hide');
  //       }.defer(250);
  //       var picUrl = '';
  //       var len = picList.length;
  //       if(len > 1) {
  //         $.createElements({
  //           classes: 'banner-indicate',
  //           components: [{
  //             tag: 'ul',
  //             components: picList.map(function(){
  //               return {
  //                 tag: 'li'
  //               }
  //             })
  //           }]
  //         }, '.vpage-content .banner');
  //       }
    
  //       var data = [];
  //       for(var i=0;i<len;i++) {
  //         data.push({
  //           classes: 'banner-img',
  //           dataIdx: picList[i].idx,
  //           dataUrl: picList[i].url,
  //           onSingleTap: function() {
  //             if($(this).data('url')) {
  //               Page.open($(this).data('url'));
  //             }
  //           },
  //           dataIndex: i,
  //           components: [{
  //             tag: 'img',
  //             src: picUrl + picList[i].img
  //           }]
  //         });
  //       }
  //       var duration = 5000;
  //       var slides = new app.Slides($('.vpage-content .banner'), {
  //         mode: '',
  //         onSnapEnd: function() {
  //           clearTimeout(_autoTimer);
  //           _autoTimer = _auto.defer(duration);
  //         },
  //         onUpdate: function(index, el) {
  //           var header = $(this.centerEl).find('.banner-img');
  //           if (header && header.length) {
  //             var idx = parseInt(header.data('index'));
  //             $('.vpage-content .banner li').removeClass('hightlight')
  //             $('.vpage-content .banner li:nth-child('+(idx+1)+')').addClass('hightlight')
  //           }
  //           $(this.leftEl).vendor('z-index','1');
  //           index = ((index % len) + len) % len;
  //           el.empty();
  //           $.createElements(data[index], el);
  //         }
  //       });
  //       var _auto = function() {
  //         if (!slides.dragging && !slides.snapping) {
  //           slides.next();
  //           _autoTimer = _auto.defer(duration);
  //         }
  //       };
  //       if(data.length > 1) {
  //         var _autoTimer = _auto.defer(duration);
  //       } else {
  //         slides.snapping = true;
  //       }
  //       var _autoTimer = _auto.defer(duration);
  //     }
    
    
  //     function getRTime(time) {
  //       var timestamp = new Date().getTime();
  //       var t = time - timestamp;
  //       if(t > 24 * 60 * 60 * 1000) {
  //         return '剩 ' + Math.ceil(t/(24 * 60 * 60 * 1000)) + ' 天'
  //       }else if(t > 60 * 60 * 1000) {
  //         return '剩 ' + Math.ceil(t/(60 * 60 * 1000)) + ' 小时'
  //       }else if(t > 60 * 1000){
  //         return '剩 ' + Math.ceil(t/(60 * 1000)) + ' 分钟'
  //       }else {
  //         return '剩 ' + Math.ceil(t/(1000)) + ' 秒'
  //       }
  //     }
  //   }
    
  // }
})