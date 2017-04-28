"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-detail",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-detail');
      var listEl = page.find('.list');
    
      var id = query.id;
      //? parseInt(query.id) : ''11;
    
      // var data = {
      //   name: 'test',
      //   mobile: '18221202115',
      //   createtime: 121212121212,
      //   state: 0,
      // };
    
      //客户信息
      api.request.get("/hfz/HfzChannelManageAction/getAgentInfo", {
        obj: {
          id: id
        }
      }).then(function(response){ var msg = response.data;
       if(true) {
    
      $.createElements([{
        classes: 'info-box2',
        components: [{
          text: msg.name
        },{
          classes: 'statustxt ' + (msg.state == 0 ? 'wait' : (msg.state == 1 ? 'accept' : '')),
          text: (msg.state == 0 ? '等待审核' : (msg.state == 1 ? '审核通过' : '审核失败'))
        },{},{
          onSingleTap: function() {
            return v.ui.alert('（慎用）删除经纪人会删除经纪人推荐的客户信息，确认删除吗？', {
              shade: true,
              autoClose: false,
              button: true,
              callback: function(e) {
                if (e.result == 1) {
                  //删除接口
                  api.request.get("/hfz/HfzChannelManageAction/delAgent", {
                    obj: {
                      id: id,
                    }
                  }).then(function(response){ var msg = response.data;
    
                  });
    
                }
              }
            });
          },
          classes: 'delete',
          text: '删除'
        }]
      },{
        classes: 'info-box',
        components: [{
          text: '电话'
        },{
          text: msg.mobile
        }]
      },{
        classes: 'info-box',
        components: [{
          text: (msg.state == 1 ? '通过时间' : '提交时间')
        },{
          text: Fn.getFullTime(msg.state == 1 ? msg.createtime2 : msg.createtime)
        }]
      }], '.infopannel');
    
      //待审核用户增加操作项
      if(msg.state == 0) {
        $.createElements([{
          onSingleTap: function() {
    
          //通过接口
            api.request.get("/hfz/HfzChannelManageAction/approveAgent", {
              obj: {
                id: id,
                state: 1
              }
            }).then(function(response){ var msg = response.data;
    
            });
    
          },
          tag: 'img',
          src: 'images/button_accept.png'
        },{
          onSingleTap: function() {
            //拒绝接口
            api.request.get("/hfz/HfzChannelManageAction/approveAgent", {
              obj: {
                id: id,
                state: 2
              }
            }).then(function(response){ var msg = response.data;
    
            });
          },
          tag: 'img',
          src: 'images/button_reject.png'
        }], '.actpannel');
      }
        }
      });
    }
    
  }
})