"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-search2",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-search2');
    
      var cusListEl = page.find('.cus-list');
      var searchEl = $('#search');
      var ids = $.storage.get(app.session.openid + app.id + 'user-select');
      var agentid;
      var state = 1;
      var mode = 'byManager';
    
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
    
      //确认分配
      page.find('.btn').singleTap(function() {
        //console.log(agentid,ids);
        //接口调用
        var parames = {
          obj:{
            agentid: agentid,
            ids: ids
          }
        }
        api.request.get("/hfz/HfzChannelManageAction/changeAgent", parames).then(function(response){ var msg = response.data;
          if(true){
    
          }
        });
      });
    
      //搜素
      page.find('.searchbt').singleTap(function() {
        pageIndex = 0;
        pageCount = 0;
        hasMore = true;
        loadData();
      });
    
      //查询数据
      loadData();
      function loadData() {
        loading = true
    
        search = searchEl.val()
    
        var params = {
          obj:{
            state: state,
            mode: mode,
            exclude: id
          },
          offset: pageIndex,
          size: pageSize,
        }
        if (search) {
          params.obj.keyword = search
        }
    
        if (pageIndex == 0) {
          cusListEl.empty()
        }
    
        api.request.get("/hfz/HfzChannelManageAction/listAgent", params).then(function(response){ var msg = response.data;
          if(true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'cus-nodata-item',
              text: '未找到相关记录'
            }, cusListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
              $.createElements({
                classes: 'cus-item2',
                onSingleTap: function(){
                  page.find('.selectbg').removeClass('selected');
                  if(!$(this).find('.selectbg').hasClass('selected')){
                    $(this).find('.selectbg').addClass('selected');
                    agentid = $(this).data('id');
                  }
                },
                dataId: obj.id,
                components: [{
                  classes: 'selectbg'
                },{
                  text: obj.name
                },{
                  text: obj.mobile
                },{
                  text: app.COMMON_AWARD_TYPES[obj.type]
                },{
                  text: obj.projectname
                }]
              }, cusListEl)
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
    }
    
  }
})