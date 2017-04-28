"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-plist",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-plist');
      var type = query.type ? parseInt(query.type) : '';
      var openid = query.openid ? query.openid : app.session.openid;
      var name = query.name ? query.name : '';
      var isOwner = (openid == app.session.openid);
      page.find('.common-topheader').text((name ? name + '的' : '') + '客户池');
    
      //取项目列表
      var proListEl = page.find('.pro-list');
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
      function loadData() {
        loading = true
    
        var params = {
          obj:{
          },
          offset: pageIndex,
          size: pageSize,
        }
        if(openid) {
          $.mixin(params.obj,{openid:openid},true);
        }
    
        if (pageIndex == 0) {
          proListEl.empty()
        }
        api.request.get(params, {action: (isOwner ? '/hfz/HfzChannelManageAction/getPerListByCustomer' : '/hfz/HfzChannelManageAction/getProjectPerformance')}).then(function(response){ var msg = response.data;
          if( true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              style: 'margin-top: 0',
              classes: 'common-nodata-item',
              text: '未找到相关记录'
            }, proListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
              $.createElements({
                classes: 'pro-item',
                tapHighlight: true,
                onSingleTap: function() {
                  var json = {
                    projectid: obj.projectid,
                    projectname: obj.projectname,
                    type: type,
                    openid: openid
                  };
                  Page.open('./cus-list.html?info='+encodeURIComponent(JSON.stringify(json)));
                  return;
                },
                components: [{
                  tag: 'img',
                  src: (obj.picurl150 ? obj.picurl150 : 'images/default-project.png')
                },{
                  classes: 'project-pannel',
                  components: [{
                    classes: 'name',
                    text: obj.projectname
                  },{
                    classes: 'nums',
                    text: '客户数：' + (obj.customercnt || 0) + '人' + '，待审核：' + (obj.approvingcnt || 0) + '人'
                  },{
                    classes: 'info-bar',
                    components: [{
                      classes: 'info-block',
                      components: [{
                        text: (type == 1 ? '报备' : '未到访')
                      },{
                        text: (obj.unvisitcnt || 0) + '人'
                      }]
                    },{
                      classes: 'info-block',
                      components: [{
                        text: '到访'
                      },{
                        text: (obj.visitcnt || 0) + '人'
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
                    }]
                  },{
                    classes: 'arrow'
                  }]
                }]
              }, proListEl)
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