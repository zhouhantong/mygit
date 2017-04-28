"use strict";
Page.ready(function($, query) {

  return {

    name: "common-hfzlist",

    options: {
      wx: true
    },

    onRender: function() {
      var page = $('#page-common-hfzlist');
      var baseUrl = location.protocol + '//' + location.host;

      if($.storage.get("tap-special-index")){
        var type = $.storage.get("tap-special-index");
      } else {
        var type = 1;
      }

      //设置初始
      $('.special-header > li:nth-child(' + type + ')').addClass('selected');

      $('.special-header > li').singleTap(function(){
        var i = parseInt($(this).data('index'));
        $('.special-header > li').forEach(function(item,index){
          $(item).removeClass('selected');
        });
        $('.special-header > li:nth-child(' + i + ')').addClass('selected');
        pageIndex = 0;
        pageCount = 0;
        hasMore = true;
        type = i;
        $.storage.set("tap-special-index",i);
        loadData();
      });

      var specialListEl = page.find('.special-list');

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
          },
          offset: pageIndex,
          size: pageSize,
        };

        if (pageIndex == 0) {
          specialListEl.empty()
        }

        if (type == 1) {
          $.mixin(params.obj,{status: 3},true);
        } else if (type == 2) {
          $.mixin(params.obj,{status: 4},true);
        } else if (type == 3) {
          $.mixin(params.obj,{status: 2},true);
        }

        api.request.get("/hfz/HfzSpecialAction/list4Wechat", params).then(function(response){ var msg = response.data;
          if(true && msg.total == 0 && pageIndex == 0) {
            $.createElements({
              classes: 'common-nohfz-item',
              text: '未找到相关记录'
            }, specialListEl)
          }
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
              var url = obj.banner;
              if(url.indexOf('//') < 0) {
                url += baseUrl;
              }
              if(type == 1 && !$.defined(obj.state)) {
                if(obj.agentid || obj.isjoin > 0) {
                  var component = {
                    classes: 'special-btn',
                    text: '申请',
                    onSingleTap: function() {
                      api.request.get("/hfz/HfzCqblAction/agentRegisterByUser", {
                        obj: {
                          specialid: obj.id,
                          agentid: obj.agentid
                        }
                      }).then(function(response){ var msg = response.data;
                        if(true) {
                          v.ui.alert('申请成功');
                          location.reload();
                        }
                      });
                    }
                  }
                } else {
                  var component = {
                    classes: 'special-btn',
                    text: '注册',
                    onSingleTap: function() {
                      Page.open('./common-hfz-register.html?id='+obj.id)
                    }
                  }
                }
              } else {
                var component = {
                  classes: 'special-txt ' + (obj.state == 1 ? 'cj' : (obj.state == 2 ? 'shsb' : (obj.state == 0 ? 'dsh' : 'wcj'))),
                  text: (obj.state == 1 ? '已参加' : (obj.state == 2 ? '审核失败' : (obj.state == 0 ? '待审核' : '未参加')))
                }
              }
              $.createElements({
                classes: 'special-box',
                tapHighlight: true,
                onSingleTap: function() {
                  if (!$(event.target).hasClass('special-btn') && obj.state == 1) {
                    Page.open('./common-hfz-info.html',{
                      id: obj.id
                    },false);
                  }
                },
                components: [{
                  tag: 'img',
                  src: url
                },{
                  classes: 'special-item',
                  components: [{
                    classes: 'leftpannel',
                    components: [{
                      html: obj.name + '&nbsp;&nbsp;&nbsp;&nbsp;' + (obj.projectname || '')
                    },{
                      text: '时间：' + Fn.getTime(obj.begindate) + ' 至 ' + Fn.getTime(obj.enddate)
                    }]
                  },{
                    classes: 'rightpannel',
                    components: [component]
                  }]
                }]
              }, specialListEl)
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