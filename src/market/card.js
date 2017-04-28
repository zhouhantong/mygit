"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-card",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-card');
      var userType,position,isAgentSaler = false;
    
      api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}).then(function(response){ var msg = response.data;
        if(msg.agent || msg.saler) {
          var obj = (msg.agent ? msg.agent : msg.saler);
          userType = (msg.agent ? 1: 2);
          position = obj.position;
          isAgentSaler = ((userType == 1 && position == 3000) || (userType == 2 && position > 1));
          if(obj.state == 1) {
            if($.defined(obj.workstate) && obj.workstate == 0) {
              $.cookie.set(md5(app.session.openid + app.id + 'check-flag'), null, 1 * 60 * 60);
              Page.open('./checkstatus.html',{},true);
            }
            //信息展示
            page.find('.rightpannel .username').text(obj.name);
            page.find('.rightpannel .mobile').text('手机：'+obj.mobile);
            page.find('.rightpannel .position').text('职位：'+(obj.positionname ? obj.positionname : ''));
            if(obj.pathname) {
              page.find('.pathname').removeClass('hide');
              page.find('.pathname').text(obj.pathname);
            } else {
              page.find('.selectapart').removeClass('hide');
            }
            page.find('.bg > img').attr('src',(obj.headimgurl ? obj.headimgurl : 'images/head.jpg'));
            //操作区域
            $.createElements([{
              classes: 'item ' + (isAgentSaler ? 'hide' : ''),
              onSingleTap: function() {
                Page.open('./teammember.html',{
                  type: userType,
                  position: obj.position
                },false);
              },
              components: [{
                classes: 'logbg l1',
                text: '团队成员'
              },{
                classes: 'number n1',
                text: (obj.membercnt || 0) + '人'
              }]
            },{
              classes: 'item',
              onSingleTap: function() {
                Page.open('./notice.html');
              },
              components: [{
                classes: 'logbg l2',
                text: '我的消息'
              },{
                classes: 'number n2 ' + ((obj.newscnt && obj.newscnt > 0) ? '' : 'hide'),
                text: obj.newscnt
              }]
            },{
              classes: 'item ' + (isAgentSaler ? '' : 'hide'),
              onSingleTap: function() {
                Page.open('./pro-list.html',{
                  type: userType
                },false);
              },
              components: [{
                classes: 'logbg l3',
                text: '我的客户'
              }]
            },{
              classes: 'item ' + ((userType == 1 && obj.isLeaf == 0) ? '' : 'hide'),
              onSingleTap: function() {
                Page.open('./listcompany.html',{
                  companyid: obj.companyid
                },false);
              },
              components: [{
                classes: 'logbg l7',
                text: '业绩报表'
              }]
            },{
              classes: 'item ' + ((userType == 1 && obj.isLeaf == 0) ? '' : 'hide'),
              onSingleTap: function() {
                Page.open('./chgmember.html',{
                  type: userType,
                  position: obj.position
                },false);
              },
              components: [{
                classes: 'logbg l3',
                text: '人员调动'
              }]
            },{
              classes: 'item ' + ((userType == 1 && position == 3000) ? '' : 'hide'),
              onSingleTap: function() {
                Page.open('./chgcuslist.html');
              },
              components: [{
                classes: 'logbg l3',
                text: '我的转出客户'
              }]
            }], '.vpage-content .market-table-view');
            //查询数据
            loadData();
          }else{
            $.cookie.set(md5(app.session.openid + app.id + 'check-flag'), null, 1 * 60 * 60);
            Page.open('./checkstatus.html',{},true);
          }
        }else{
          $.cookie.set(md5(app.session.openid + app.id + 'check-flag'), null, 1 * 60 * 60);
          Page.open('./checkstatus.html',{},true);
        }
      });
    
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
    
      function loadData() {
        loading = true
    
        var params = {
          obj:{
            offset: pageIndex,
            size: pageSize,
          }
        }
    
        if (pageIndex == 0) {
          proListEl.empty()
        }
        api.request.get("/hfz/HfzChannelManageAction/getProjectPerformance", params).then(function(response){ var msg = response.data;
          if (true && msg.list) {
            msg.list.forEach(function(obj) {
              $.createElements({
                classes: 'pro-item',
                tapHighlight: true,
                onSingleTap: function() {
                  if (!$(event.target).hasClass('btn-bb')) {
                    Page.open('./pdetail.html',{
                      projectid: obj.projectid,
                      type: userType,
                      position: position
                    },false);
                    return;
                  }
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
                        text: (userType == 1 ? '报备' : '未到访')
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
                  },{
                    tapHighlight: true,
                    onSingleTap: function() {
                      Page.open('./recommend.html',{
                        projectid: obj.projectid,
                        type: userType
                      },false);
                      return;
                    },
                    classes: 'btn-bb ' + (isAgentSaler ? '' : 'hide'),
                    text: (userType == 1 ? '报备客户' : '添加客户')
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
    
      page.find('.selectapart').on('singleTap',function(){
        return Page.open('./select-apart.html');
      });
    }
    
  }
})