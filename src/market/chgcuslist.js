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
      var status = -1;
    
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
    
      //查询数据
      loadData();
    
      function loadData() {
        loading = true
    
        var search = searchEl.val()
    
        var params = {
          obj: {},
          offset: pageIndex,
          size: pageSize,
        }
    
        if (search) {
          $.mixin(params.obj,{keyword: search},true);
        }
    
        if (pageIndex == 0) {
          cusListEl.empty()
        }
    
        api.request.get("/hfz/HfzChannelManageAction/listPublicCustomer", params).then(function(response){ var msg = response.data;
          if(true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'cus-nodata-item',
              text: '未找到相关记录'
            }, cusListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
              $.createElements({
                classes: 'cus-item',
                tapHighlight: true,
                onSingleTap: function(){
                  if (!$(event.target).hasClass('mobile')) {
                    Page.open('./detail.html?id=' + obj.id);
                    return;
                  }
                },
                components: [{
                  classes: 'info-box',
                  components: [{
                    classes: 'username',
                    text: obj.name
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: '电话'
                  },{
                    tapHighlight: true,
                    onSingleTap: function() {
                      location.href = 'tel:' + obj.mobile;
                      return;
                    },
                    classes: 'mobile',
                    text: obj.mobile
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: '项目名称'
                  },{
                    text: obj.projectname
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: '状态'
                  },{
                    text: (obj.state >= 0 ? app.COMMON_AWARD_TYPES[obj.state] : '')
                  }]
                },{
                  classes: 'arrow'
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
    
      page.find('select').on('change', function() {
        $(this).parent().find('div.text-value').text(this.options[this.selectedIndex].innerHTML);
        status = parseInt(this.value);
      });
    }
    
  }
})