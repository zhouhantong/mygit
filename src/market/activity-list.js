"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-alist",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-alist');
      var projectid = query.projectid ? parseInt(query.projectid) : '';
      var keys = [];
      //取列表
      var actListEl = page.find('.act-list');
      var loading = false
      // var body = document.body;
      // var pageIndex = 0
      // var pageSize = 10
      // var pageCount = 0
      // var loading = false
      // var hasMore = true
      // $(window).on('scroll', function(event) {
      //   var bottom = body.scrollHeight - (body.scrollTop + window.innerHeight);
      //   if (bottom <= 200 && !loading && hasMore) {
      //     loadData()
      //     DEBUG && console.debug('debug');
      //   }
      // });
      //查询数据
      loadData();
      function loadData() {
        loading = true
        var params = {
          obj:{
            // offset: pageIndex,
            // size: pageSize,
            projectid: projectid,
          }
        }
        // if (pageIndex == 0) {
        //   actListEl.empty()
        // }
        api.request.get("/hfz/HfzActivityAction/listActivityByProject", params).then(function(response){ var msg = response.data;
          if(typeof(msg) != 'object') {
            $.createElements({
              style: 'margin-top: 0',
              classes: 'common-nodata-item',
              text: '未找到相关记录'
            }, actListEl)
          }
          if(typeof(msg) == 'object') {
            for(var key in msg){
              if(typeof(msg[key]) == 'object') {
                $.createElements({
                  classes: 'act-block',
                  components: [{
                    classes: 'header',
                    text: key
                  },{
                    classes: 'act-block-item',
                    components: msg[key].map(function(item,index){
                      return {
                        classes: 'act-item ' + (index == msg[key].length-1 ? 'last' : ''),
                        onSingleTap: function(){
                          Page.open('./activity-detail.html?id='+item.id)
                        },
                        components: [{
                          tag: 'img',
                          src: (item.picurl ? item.picurl : 'images/default-project.png')
                        },{
                          classes: 'rightpannel',
                          components: [{
                            classes: 'topheader',
                            components: [{
                              text: item.title
                            },{
                              text: Fn.getTime(item.publishtime)
                            }]
                          },{
                            classes: 'content',
                            text: item.brief
                          }]
                        }]
                      }
                    })
                  }]
                }, actListEl)
              }
            }
            // var size = msg.list.length
            // var total = msg.total
            // pageCount += size
            // hasMore = (size >= pageSize && (total < 0 || pageCount < total))
            // if (hasMore) {
            //   pageIndex += size
            // }
          }
          loading = false
        })
      }
    }
    
  }
})