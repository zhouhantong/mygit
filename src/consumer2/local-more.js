"use strict";
Page.ready(function($, query) {
  
  return {
    
    options: {
      scroller: true,
      trademark: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-local-more');
    
      var from = query.from ? query.from : '';
    
      var latitude = query.latitude;
      var longitude = query.longitude;
      var projectid = parseInt(query.projectid);
    
      $.createElements([{
        classes: 'local-icons-bar',
        components: [{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=美食&from='+from);
          },
          components: [{
            classes: 'icon cy'
          }]
        },{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=购物&from='+from);
          },
          components: [{
            classes: 'icon gw'
          }]
        },{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=生活服务&from='+from);
          },
          components: [{
            classes: 'icon jt'
          }]
        },{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=银行&from='+from);
          },
          components: [{
            classes: 'icon yh'
          }]
        }]
      },{
        classes: 'local-icons-bar',
        components: [{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=休闲娱乐&from='+from);
          },
          components: [{
            classes: 'icon yl'
          }]
        },{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=酒店&from='+from);
          },
          components: [{
            classes: 'icon jd'
          }]
        },{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=亲子&from='+from);
          },
          components: [{
            classes: 'icon qz'
          }]
        },{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=运动健身&from='+from);
          },
          components: [{
            classes: 'icon js'
          }]
        }]
      },{
        classes: 'local-icons-bar',
        components: [{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=结婚&from='+from);
          },
          components: [{
            classes: 'icon hq'
          }]
        },{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=家装&from='+from);
          },
          components: [{
            classes: 'icon jz'
          }]
        },{
          classes: 'icon-cell',
          onTap: function() {
            Page.open('../local-detail.html?latitude='+latitude+'&longitude='+longitude+'&category=丽人&from='+from);
          },
          components: [{
            classes: 'icon lr'
          }]
        },{
          classes: 'icon-cell'
        }]
      }], '.vpage-content .icons-local');
    
      api.info.get({
        projectid: projectid
      }).then(function(response){ var msg = response.data;
        if(code == 0 && msg) {
          //底部菜单
          if(!from) {
            app.createXkbMenu(projectid,msg.base.tourl);
          }
          if(msg.base.nearbydesc) {
            $.createElements([{
              classes: 'common-header-item',
              html: '周边配套'
            },{
              classes: 'desc-text',
              html: msg.base.nearbydesc
            }], '.vpage-content .project-local');
            page.find('.vpage-content .project-local').removeClass('hide');
          }
        }
      });
    }
    
  }
})