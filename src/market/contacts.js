"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-cuslist",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-cuslist');
      var projectid = query.projectid;
      var usertype = parseInt(query.type);
    
      //设置左侧滑动
      new IScroll(page.find('aside')[0]);
    
      var listEl = page.find('.list');
      var cusListEl = page.find('.cus-list');
      var searchEl = $('#search');
    
      if(usertype == 1) {
        var types = [[0,'报备'],[2,'到访'],[3,'认筹'],[4,'认购'],[5,'签约'],[6,'全款到账'],['-1','已过期'],['-2','待审核'],['-3','审核失败']];
      }else{
        var types = [[0,'未到访'],[2,'到访'],[3,'认筹'],[4,'认购'],[5,'签约'],[6,'全款到账'],['-1','已过期'],['-2','待审核'],['-3','审核失败']];
      }
      var type = 0;
      var selectname,selectmobile;
    
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
    
      //确定
      page.find('.btn').singleTap(function() {
        var data = $.storage.get(app.session.openid + app.id + 'recommend-data');
        var json = JSON.parse(data);
        console.log(selectname,selectmobile,json);
        if(selectname && selectmobile && json) {
          var obj = {
            name: selectname,
            mobile: selectmobile,
          };
          $.storage.set(app.session.openid + app.id + 'recommend-data',JSON.stringify(obj));
        }
        //返回
        Page.open('./recommend.html',{
          projectid: projectid,
          type: usertype
        },false);
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
          },
          offset: pageIndex,
          size: pageSize,
        };
    
        if(data[0] >= 0) {
          $.mixin(params.obj,{state: data[0]},true);
        }
    
        if (search) {
          $.mixin(params.obj,{keyword: search},true);
        }
    
        if (pageIndex == 0) {
          cusListEl.empty()
        }
    
        if(data[0] == -1 || data[0] == -3) {
          if(data[0] == -3) {
            $.mixin(params.obj,{approvestate: -1},true);
          }
          var action = '/hfz/HfzChannelManageAction/listExpireCustomer';
        }else {
          if(data[0] == -2) {
            $.mixin(params.obj,{approvestate: 0},true);
          }
          var action = '/hfz/HfzChannelManageAction/listCustomer';
        }
    
        api.request.get(params, {action: action}).then(function(response){ var msg = response.data;
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
                    page.find('.selectbg').removeClass('selected');
                    if(!$(this).find('.selectbg').hasClass('selected')){
                      $(this).find('.selectbg').addClass('selected');
                      selectname = obj.name;
                      selectmobile = obj.mobile;
                    }
                  }
                },
                components: [{
                  classes: 'info-box',
                  components: [{
                    classes: 'username',
                    text: obj.name,
                    components: [{
                      tag: 'span',
                      tapHighlight: true,
                      onSingleTap: function() {
                        location.href = 'tel:' + obj.mobile;
                        return;
                      },
                      classes: 'mobile',
                      text: obj.mobile
                    }]
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: '项目名称'
                  },{
                    text: obj.projectname
                  }]
                },{
                  classes: 'selectbg'
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