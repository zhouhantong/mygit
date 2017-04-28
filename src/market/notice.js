"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-notice",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-notice');
      var noticeListEl = page.find('.notice-list');
    
      var body = document.body;
      var pageIndex = 0
      var pageSize = 10
      var pageCount = 0
      var loading = false
      var hasMore = true
      $(window).on('scroll', function(event) {
        var bottom = body.scrollHeight - (body.scrollTop + window.innerHeight);
        if (bottom <= 200 && !loading && hasMore) {
          loadData()
          DEBUG && console.debug('debug');
        }
      });
    
      //查询数据
      loadData();
    
      function loadData(i) {
        loading = true
        var params = {
          offset: pageIndex,
          size: pageSize
        }
        if (pageIndex == 0) {
          noticeListEl.empty()
        }
        api.request.get("/xkb/biz/Notice/listByCondition", params).then(function(response){ var msg = response.data;
          if(true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'cus-nodata-item',
              text: '未找到相关记录'
            }, noticeListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
              $.createElements({
                classes: 'notice-item ' + (obj.status == 0 ? 'unread' : ''),
                components: [{
                  classes: 'info-box',
                  onTap: function(){
                    //调用接口设置成已读
                    var el = $(this).parent();
                    if(el.hasClass('unread')){
                      api.request.get("/xkb/biz/Notice/updateReadWithOpenid", {
                        ids: [obj.id]
                      }).then(function(response){ var msg = response.data;
                        if(true){
                          el.removeClass('unread');
                        }
                      });
                    }
                    var popup = new app.ModalPopup();
                    popup.open([{
                      classes: 'info-box',
                      components: [{
                        classes: 'title2',
                        html: obj.content
                      }]
                    },{
                      classes: 'hflexbox',
                      components: [{
                        classes: 'button-alert',
                        text: '好',
                        onSingleTap: function() {
                          popup.close();
                        },
                      }]
                    }]);
                  },
                  components: [{
                    text: obj.title
                  },{
                    text: Fn.getFullTime(obj.createtime)
                  }]
                },{
                  classes: 'content',
                  html: obj.content
                }]
              }, noticeListEl)
            })
            var size = msg.list.length
            var total = msg.total
            pageCount += size
            hasMore = (size >= pageSize && (total < 0 || pageCount < total))
            if (hasMore) {
              pageIndex += size
            }
          }
          loading = false
        })
      }
    
      page.find('ul > li').singleTap(function(){
        var i = parseInt($(this).data('index'));
        page.find('ul > li').forEach(function(item,index){
          $(item).removeClass('selected');
        });
        page.find('ul > li:nth-child(' + (i + 1) + ')').addClass('selected');
        pageIndex = 0;
        pageCount = 0;
        hasMore = true;
        loadData(i);
      });
    }
    
  }
})