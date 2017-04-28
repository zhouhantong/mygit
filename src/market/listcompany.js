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
      var type = parseInt(query.type);
      var position = parseInt(query.position);
      var companyid = query.companyid;
    
      var cusListEl = page.find('.cus-list');
      var searchEl = $('#search');
      var status = '';
    
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
    
        search = searchEl.val()
    
        var params = {
          obj:{
            preid: companyid
          },
          offset: pageIndex,
          size: pageSize,
        }
    
        if (search) {
          params.obj.keyword = search
        }
    
        if (status) {
          params.obj.orderProperty = status
        }
    
        if (pageIndex == 0) {
          cusListEl.empty()
        }
    
        api.request.get("/hfz/HfzCompanyManageAction/listCompanyByOwner", params).then(function(response){ var msg = response.data;
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
                onSingleTap: function() {
                  if(obj.isleaf == 0) {
                    Page.open('./listcompany.html',{
                      companyid: obj.id
                    },false);
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
                    text: '客户总数'
                  },{
                    text: (obj.customercnt || 0) + '人'
                  }]
                },{
                  classes: 'common-info-bar',
                  components: [{
                    classes: 'info-block',
                    components: [{
                      text: '到访'
                    },{
                      text: (obj.visitcnt || 0) + '人'
                    }]
                  },{
                    classes: 'info-block',
                    components: [{
                      text: '认筹'
                    },{
                      text: (obj.pledgedcnt || 0) + '人'
                    }]
                  },{
                    classes: 'info-block',
                    components: [{
                      text: '认购'
                    },{
                      text: (obj.subscribecnt || 0) + '人'
                    }]
                  },{
                    classes: 'info-block',
                    components: [{
                      text: '签约'
                    },{
                      text: (obj.dealcnt || 0) + '人'
                    }]
                  },{
                    classes: 'info-block',
                    components: [{
                      text: '全款到账'
                    },{
                      text: (obj.paidcnt || 0) + '人'
                    }]
                  }]
                },{
                  classes: 'arrow ' + (obj.isleaf == 0 ? '' : 'hide')
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
        status = this.value;
      });
    }
    
  }
})