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
      var json = (query.info ? query.info : {});
      var timestamp = Date.parse(new Date());
      var openid = json.openid ? json.openid : app.session.openid;
    
      page.find('.common-topheader').text(json.projectname);
    
      //设置左侧滑动
      new IScroll(page.find('aside')[0]);
    
      var listEl = page.find('.list');
      var cusListEl = page.find('.cus-list');
      var searchEl = $('#search');
    
      if(json.type && json.type == 1) {
        var types = [[0,'报备'],[2,'到访'],[3,'认筹'],[4,'认购'],[5,'签约'],[6,'全款到账'],['-1','已过期'],['-2','待审核'],['-3','审核失败'],['-4','项目公客']];
        var times = [['createtime','提交时间'],['visittime','到访时间'],['pledgetime','认筹时间'],['subscribetime','认购时间'],['dealtime','签约时间'],['paidtime','全款到账时间'],['expiretime','过期时间'],['createtime','提交时间'],['createtime','提交时间'],['createtime','提交时间']];
      }else{
        var types = [[0,'未到访'],[2,'到访'],[3,'认筹'],[4,'认购'],[5,'签约'],[6,'全款到账'],['-1','已过期'],['-2','待审核'],['-3','审核失败']];
        var times = [['createtime','提交时间'],['visittime','到访时间'],['pledgetime','认筹时间'],['subscribetime','认购时间'],['dealtime','签约时间'],['paidtime','全款到账时间'],['expiretime','过期时间'],['createtime','提交时间'],['createtime','提交时间']];
      }
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
    
        var search = searchEl.val()
    
        var data = types[type];
        var time = times[type];
    
        var params = {
          obj: {
            projectid: json.projectid
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
        if(openid) {
          $.mixin(params.obj,{openid:openid},true);
        }
    
        if (pageIndex == 0) {
          cusListEl.empty()
        }
    
        if(data[0] == -1 || data[0] == -3) {
          if(data[0] == -3) {
            $.mixin(params.obj,{approvestate: -1},true);
          }
          var action = '/hfz/HfzChannelManageAction/listExpireCustomer';
        }else if(data[0] == -4) {
          var action = '/hfz/HfzChannelManageAction/listPublicCustomer';
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
                    Page.open('./detail.html?id=' + obj.id + ((data[0] == -1 || data[0] == -3) ? '&expire=1' : ''));
                    return;
                  }
                },
                components: [{
                  classes: 'info-box',
                  components: [{
                    classes: 'username',
                    text: obj.name,
                    components: [{
                      tag: 'span',
                      classes: ((json.type == 2 && obj.type == 1 && obj.agentname) ? '' : 'hide'),
                      text: obj.agentname
                    }]
                  // },{
                  //   classes: 'statustxt over ' + ((obj.reservetime && obj.reservetime < timestamp) ? '' : 'hide'),
                  //   text: '过期'
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
                    text: time[1]
                  },{
                    text: Fn.getFullTime(obj[time[0]])
                  }]
                },{
                }, data[0] == -4 ? {
                  classes: 'info-box',
                  components: [{
                    text: '状态'
                  },{
                    text: (obj.state >= 0 ? app.COMMON_AWARD_TYPES[obj.state] : '')
                  }]
                } : $.nop,{
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
    }
    
  }
})