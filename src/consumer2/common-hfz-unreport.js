"use strict";
Page.ready(function($, query) {
  
  return {

    name: "personal-hfz",
    
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-personal-hfz');
      var id = parseInt(query.id);
      var isagent = query.isagent;
    
      var orderListEl = page.find('.order-list');
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
    
      loadData();
      function loadData() {
        loading = true
    
        var params = {
          obj: {
            specialid: id,
            reportstate: 0
          },
          offset: pageIndex,
          size: pageSize,
        };
    
        if (pageIndex == 0) {
          orderListEl.empty()
        }
    
        api.request.get("/hfz/HfzCustomerAction/listSpecialCustomer", params).then(function(response){ var msg = response.data;
          if(true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'common-nohfz-item',
              text: '暂无预约'
            }, orderListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
              $.createElements({
                classes: 'order-item',
                components: [{
                  classes: 'leftpannel',
                  components: [{
                    text: '姓名：' + obj.name
                  },{
                    text: '电话：' + obj.mobile
                  },{
                    text: '提交时间：' + Fn.getFullTime(obj.createtime)
                  }]
                },{
                  onSingleTap: function() {
                    if(isagent) {
                      Page.open('../market/recommend.html?info='+encodeURIComponent(JSON.stringify({name:obj.name,mobile:obj.mobile}))+'&projectid='+obj.projectid+'&type=1');
                    } else {
                      Page.open('../market/checkstatus.html');
                    }
                  },
                  classes: 'rightpannel r2',
                  text: '一键报备'
                }]
              }, orderListEl)
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