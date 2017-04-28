"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-search",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-search');
    
      //设置左侧滑动
      new IScroll(page.find('aside')[0]);
    
      var listEl = page.find('.list');
      var cusListEl = page.find('.cus-list');
      var searchEl = $('#search');
      var agent = 'agent';
    
      //var types = [[0,'未到访'],[1,'到访'],[2,'认筹'],[3,'认购'],[4,'签约']];
      var types = [[0,'未到访'],[2,'到访'],[3,'认筹'],[4,'认购'],[5,'签约']];
      var type = 0;
    
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
    
      //搜素
      page.find('.searchbt').singleTap(function() {
        pageIndex = 0;
        pageCount = 0;
        hasMore = true;
        loadData();
      });
    
      //初始化状态列表
      initTypes();
    
      function initTypes() {
        types.forEach(function(item, index) {
          $.createElements({
            classes: 'item' + (index == type ? ' selected' : ''),
            text: item[1],
            onSingleTap: function() {
              var el = $(this)
              listEl.find('.item').removeClass('selected')
              el.addClass('selected')
              type = index
              pageIndex = 0
              pageCount = 0
              hasMore = true
              loadData()
            }
          }, listEl)
        })
      }
    
      //查询数据
      loadData();
    
      function loadData() {
        loading = true
    
        search = searchEl.val()
    
        var data = types[type];
    
        var params = {
          obj: {
            type: 1,
            mode: agent,
            // state: data
          },
          offset: pageIndex,
          size: pageSize,
        };
    
        if (search) {
          $.mixin(params.obj,{keyword: search},true);
          params.obj.state = data[0];
        }else{
          params.obj.state = data[0];
        }
    
        if (pageIndex == 0) {
          cusListEl.empty()
        }
    
        api.request.get("/hfz/HfzChannelManageAction/listCustomer", params).then(function(response){ var msg = response.data;
          if(true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'cus-nodata-item',
              text: '未找到相关记录'
            }, cusListEl)
          }
          if (true && msg.list) {
            // alert('222');
            msg.list.forEach(function(obj) {
              $.createElements({
                classes: 'cus-item',
                onSingleTap: function(){
                  Page.open('./detail.html?id=' + obj.id);
                },
                components: [{
                  classes: 'info-box',
                  components: [{
                    classes: 'username',
                    text: obj.name
                  },{
                    text: '报备时间：' + (Fn.getFullTime(obj.createtime))
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: '电话'
                  },{
                    text: obj.mobile
                  }]
                },{
                  classes: 'info-box noborder',
                  components: [{
                    text: '项目名称'
                  },{
                    text: obj.projectname
                  }]
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