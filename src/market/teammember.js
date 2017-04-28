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
      var openid = query.openid ? query.openid : app.session.openid;
    
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
    
      if((type == 1 && position < 3000) || (type == 2 && position == 1)) {
        page.find('.type-status').removeClass('hide');
      }
    
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
          },
          offset: pageIndex,
          size: pageSize,
        }
        if(openid) {
          $.mixin(params.obj,{openid:openid},true);
        }
    
        if (search) {
          params.obj.keyword = search
        }
    
        if((type == 1 && position < 3000) || (type == 2 && position == 1)) {
          if (status >= 0) {
            params.obj.state = status
          }
        } else {
          params.obj.state = 1
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
                classes: 'cus-item',
                onSingleTap: function() {
                  if(obj.state == 1) {
                    if((type == 1 && obj.position < 3000) || (type == 2 && obj.position == 1)) {
                      Page.open('./teammember.html',{
                        type: type,
                        position: position,
                        openid: obj.openid
                      },false);
                    } else {
                      if((type == 1 && position == 3000) || (type == 2 && position > 1) && app.session.openid != obj.openid) {
                        return;
                      }
                      Page.open('./pro-list.html?openid='+obj.openid+'&type='+type+'&name='+encodeURIComponent(obj.name));
                    }
                  }
                },
                components: [{
                  classes: 'info-box',
                  components: [{
                    classes: 'username noicon',
                    html: obj.name + (obj.position != position ? '<span>( '+obj.positionname+' )</span>' : '')
                  },{
                    classes: 'statustxt ' + (obj.state == 0 ? 'wait ' : (obj.state == 1 ? 'accept ' : '')),
                    text: (obj.state == 0 ? '等待审核' : (obj.state == 1 ? '审核通过' : '审核失败'))
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: '电话'
                  },{
                    text: obj.mobile
                  }]
                },{
                  classes: 'info-box',
                  components: [{
                    text: (obj.state == 1 ? '通过时间' : '提交时间')
                  },{
                    text: Fn.getFullTime(obj.state == 1 ? obj.approvetime : obj.createtime)
                  }]
                // },{
                //   onSingleTap: function() {
                //     var el = $(this).parent();
                //     return v.ui.alert('（慎用）确认删除经纪人吗？', {
                //       shade: true,
                //       autoClose: false,
                //       button: true,
                //       callback: function(e) {
                //         if (e.result == 1) {
                //           //删除接口
                //           api.request.get("/hfz/HfzChannelManageAction/delAgent", {
                //             obj: {
                //               id: obj.id,
                //             }
                //           }).then(function(response){ var msg = response.data;
                //             if(true){
                //               el.remove();
                //             }
                //           });
                //         }
                //       }
                //     });
                //   },
                //   classes: 'delete ' + ((type && obj.state != 0) ? '' : 'hide')
                }, (type && obj.state == 0) ? {
                  classes: 'actpannel',
                  components: [{
                    onSingleTap: function() {
                      //通过接口
                      if(type == 1) {
                        api.request.get("/hfz/HfzMemberManageAction/checkMembers", {
                          list: [{
                            id: obj.id,
                            state: 1,
                            flag: (obj.position == 3000 ? 'agent' : 'manager')
                          }]
                        }).then(function(response){ var msg = response.data;
                          alert('审批成功');
                          location.reload();
                        });
                      } else {
                        var params = {
                          id: obj.id,
                          state: 1,
                        };
                        api.request.get("/hfz/HfzSalerProjectAction/approveSaler", {
                          obj: params
                        }).then(function(response){ var msg = response.data;
                          alert('审批成功');
                          location.reload();
                        });
                      }
                    },
                    tag: 'img',
                    src: 'images/button_accept.png'
                  },{
                    onSingleTap: function() {
                      //拒绝接口
                      if(type == 1) {
                        api.request.get("/hfz/HfzMemberManageAction/checkMembers", {
                          list: [{
                            id: obj.id,
                            state: 2,
                            flag: (obj.position == 3000 ? 'agent' : 'manager')
                          }]
                        }).then(function(response){ var msg = response.data;
                          alert('拒绝成功');
                          location.reload();
                        });
                      } else {
                        var params = {
                          id: obj.id,
                          state: 2,
                        };
                        api.request.get("/hfz/HfzSalerProjectAction/approveSaler", {
                          obj: params
                        }).then(function(response){ var msg = response.data;
                          alert('拒绝成功');
                          location.reload();
                        });
                      }
                    },
                    tag: 'img',
                    src: 'images/button_reject.png'
                  }]
                } : $.nop]
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