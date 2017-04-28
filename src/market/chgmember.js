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
    
      var type = parseInt(query.type);
      var position = parseInt(query.position);
      var openid = query.openid ? query.openid : app.session.openid;
      $.storage.set(app.session.openid + app.id + 'user-select','');
    
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
    
      //全选
      page.find('.all-select').singleTap(function() {
        if($(this).hasClass('selected')) {
          $(this).removeClass('selected');
          page.find('.selectbg').removeClass('selected');
        }else{
          $(this).addClass('selected');
          page.find('.selectbg').addClass('selected');
        }
      });
    
      //确认
      $('.btn').singleTap(function() {
        var ids = [];
        page.find('.cus-item2').forEach(function(item){
          if($(item).find('.selectbg').hasClass('selected')) {
            ids.push($(item).data('id'));
          }
        });
        if(ids.length) {
          var str = ids.join(',');
          $.storage.set(app.session.openid + app.id + 'user-select',str);
          Page.open('./chgmemberconfirm.html');
        } else {
          return v.ui.alert('请先选择员工');
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
            state: 1
          },
          offset: pageIndex,
          size: pageSize,
        }
        if (search) {
          params.obj.keyword = search
        }
        if(openid) {
          $.mixin(params.obj,{openid:openid},true);
        }
        if (pageIndex == 0) {
          cusListEl.empty()
        }
    
        api.request.get("/hfz/HfzChannelManageAction/listMember", params).then(function(response){ var msg = response.data;
          if(true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'cus-nodata-item',
              text: '未找到相关记录'
            }, cusListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
              $.createElements({
                classes: 'cus-item2 ' + (obj.position < 3000 ? 'hasarrow' : ''),
                tapHighlight: true,
                onSingleTap: function(){
                  if(obj.position < 3000 && !$(event.target).hasClass('selectbg')) {
                    Page.open('./chgmember.html',{
                      type: type,
                      position: position,
                      openid: obj.openid
                    },false);
                  }
                },
                dataId: obj.id,
                components: [{
                  tapHighlight: true,
                  classes: 'selectbg',
                  onSingleTap: function() {
                    var el = $(this);
                    if(el.hasClass('selected')){
                      el.removeClass('selected');
                    }else{
                      el.addClass('selected');
                    }
                  }
                },{
                  html: obj.name + '<span>( '+obj.positionname+' )</span>'
                },{
                  text: obj.mobile
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