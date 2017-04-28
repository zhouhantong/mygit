"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-pdetail",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-pdetail');
      var projectid = parseInt(query.projectid);
      var type = parseInt(query.type);
      var position = parseInt(query.position);
      var isAgentSaler = ((type == 1 && position == 3000) || (type == 2 && position > 1));
    
      api.request.get("/hfz/HfzChannelManageAction/getPerformance", {
        obj: {
          projectid: projectid
        }
      }).then(function(response){ var msg = response.data;
        if(true){
          if(isAgentSaler) {
            page.find('.sbtn-bar').removeClass('hide');
            page.find('.next-button').text(type == 1 ? '报备客户' : '添加客户');
          }
          if(msg.picurl) {
            page.find('.banner').removeClass('hide');
            page.find('.banner > img').attr('src',msg.picurl);
          }
          //信息
          $.createElements({
            classes: 'project-pannel p2',
            components: [{
              classes: 'name',
              text: msg.projectname
            },{
              classes: 'project-block',
              components: [{
                classes: (msg.projectmission ? '' : 'hide'),
                text: '项目佣金政策：' + msg.projectmission
              },{
                classes: (msg.onomastion ? '' : 'hide'),
                text: '项目CALL客术语：' + msg.onomastion
              },{
                classes: (msg.recordcycle ? '' : 'hide'),
                text: '报备客户过期时间：' + msg.recordcycle + ' 天'
              },{
                classes: (msg.visitedcycle ? '' : 'hide'),
                text: '到访客户过期时间：' + msg.visitedcycle + ' 天'
              }]
            },{
              classes: 'nums',
              text: '客户数：' + (msg.customercnt || 0) + '人' + '，待审核：' + (msg.approvingcnt || 0) + '人'
            },{
              classes: 'info-bar',
              components: [{
                classes: 'info-block',
                components: [{
                  text: (type == 1 ? '报备' : '未到访')
                },{
                  text: (msg.unvisitcnt || 0) + '人'
                }]
              },{
                classes: 'info-block',
                components: [{
                  text: '到访'
                },{
                  text: (msg.visitcnt || 0) + '人'
                }]
              },{
                classes: 'info-block',
                components: [{
                  text: '认购'
                },{
                  text: (msg.subscribecnt || 0) + '人'
                }]
              },{
                classes: 'info-block',
                components: [{
                  text: '签约'
                },{
                  text: (msg.dealcnt || 0) + '人'
                }]
              }]
            }]
          },'.vpage-content .infopannel');
          //操作区域
          $.createElements([{
            classes: 'item',
            onSingleTap: function() {
              Page.open('./activity-list.html?projectid='+projectid);
            },
            components: [{
              classes: 'logbg l4',
              text: '活动消息'
            }]
          },{
            classes: 'item',
            onSingleTap: function() {
              var json = {
                projectid: projectid,
                projectname: msg.projectname,
                type: type
              };
              Page.open('./cus-list.html?info='+encodeURIComponent(JSON.stringify(json)));
            },
            components: [{
              classes: 'logbg l5',
              text: '项目客户'
            }]
          },{
            classes: 'item',
            onSingleTap: function() {
              var json = {
                projectid: projectid,
                projectname: msg.projectname,
                type: type,
                position: position
              };
              Page.open('./performance.html?info='+encodeURIComponent(JSON.stringify(json)));
            },
            components: [{
              classes: 'logbg l6',
              text: '项目报表'
            }]
          }], '.vpage-content .market-table-view');
        }
      });
    
      page.find('.next-button').singleTap(function() {
        Page.open('./recommend.html?projectid='+projectid+'&type='+type);
      });
    }
    
  }
})