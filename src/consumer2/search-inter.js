"use strict";
Page.ready(function($, query) {
  
  var from = query.from ? query.from : '' // 自动生成的代码

  return {

    name: "detail",
    
    options: {
      menu: (from ? false : true),
      scroller: true,
      trademark: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-detail');
    
      var from = query.from ? query.from : '';
    
      var keyword = query.keyword ? decodeURIComponent(query.keyword) : '';
      var projectid = query.projectid ? parseInt(query.projectid) : '';
    
      if(projectid) {
        api.info.get({
          projectid: projectid
        }).then(function(response){ var msg = response.data;
          if(code == 0 && msg) {
            createAllSearch(msg.base);
          }
        });
      } else if(keyword) {
        var info = {
          projectname: keyword,
          latitude: '',
          longitude: '',
        };
        createAllSearch(info);
      }
      //一网打尽
      function createAllSearch(info) {
        var data = [{
          src: 'images/icon-xkb.png',
          text: '新快网有关<span>'+info.projectname+'</span>的精彩文章集合',
          url: (app.id == 'wx723631547c0fc984' ? 'http://www.baidu.com/baidu?word='+info.projectname+'&tn=bds&cl=3&si=xkb.com.cn&ct=2097152' : '')
        },{
          src: 'images/icon-weixin.png',
          text: '微信里搜索有关<span>'+info.projectname+'</span>的所有最新资讯和公众号',
          url: 'http://weixin.sogou.com/weixinwap?type=2&query='+info.projectname+'&city=广州&latitude='+info.latitude+'&longitude='+info.longitude
        },{
          src: 'images/icon-baidu.png',
          text: '全球最大中文搜索引擎的<span>'+info.projectname+'</span>搜索结果',
          url: 'http://m.baidu.com/s?word='+info.projectname+'&city=广州&latitude='+info.latitude+'&longitude='+info.longitude
        }];
    
        if(projectid) {
          data.push({
            src: 'images/icon-soufang.png',
            text: '国内主流的房地产网络搜房里看<span>'+info.projectname+'</span>',
            url: (info.soufunurl ? info.soufunurl : '')
          });
        }
    
        var data2 = [{
          src: 'images/icon-ajk.png',
          text: '互联房产信息服务商安居客提供的关于<span>'+info.projectname+'</span>的最新资讯',
          url: info.anjukeurl || 'http://m.anjuke.com/gz/loupan/?q='+info.projectname
        },{
          src: 'images/icon-txfc.png',
          text: ' 腾讯房产里关于<span>'+info.projectname+'</span>的新鲜资讯，首次进入需要选一下城市呦',
          url: info.qqurl || 'http://m.db.house.qq.com/index.php?mod=searchhouse&act=searchlist&all='+info.projectname
        },{
          src: 'images/icon-wyfc.png',
          text: '在房地产权威门户网易房产中搜索<span>'+info.projectname+'</span>',
          url: info.netease || 'http://m.house.163.com/gz/xf/search.html?keyword='+info.projectname
        },{
          src: 'images/icon-kdlj.png',
          text: '在中国房地产家居网络传媒市场主流媒体口袋乐居查看<span>'+info.projectname+'</span>',
          url: info.lejuurl || 'http://m.leju.com/?site=touch&ctl=house&act=search&city=gz&keyword='+info.projectname
        },{
          src: 'images/icon-shjd.png',
          text: '在搜狐焦点搜索及时全面的<span>'+info.projectname+'</span>资讯',
          url: (info.sohuurl ? info.sohuurl : '')
        },{
          src: 'images/icon-weibo.png',
          text: '关于<span>'+info.projectname+'</span>的新浪微博资讯，最主流最具人气',
          url: 'http://s.weibo.com/weibo/'+info.projectname+'?city=广州&latitude='+info.latitude+'&longitude='+info.longitude
        }];
        var c = data.concat(data2);
        var items = c.map(function(item){
          return {
            classes: 'common-cell-item ' + (item.url ? '' : 'hide'),
            onTap: function() {
              if(projectid) {
                Fn.addHistoryLogh(projectid,4);
              }
              if(item.url) {
                Page.open(item.url);
              }
            },
            components: [{
              tag: 'img',
              src: item.src
            },{
              classes: 'common-cell-body',
              components: [{
                classes: 'common-cell-content',
                components: [{
                  classes: 'common-cell-text',
                  html: item.text
                }]
              }]
            }]
          };
        });
        $.createElements([{
          classes: 'common-header-item',
          text: '一网打尽'
        },{
          components: items
        }], '.vpage-content .project-all');
        page.find('.project-all').removeClass('hide');
      }
    }
    
  }
})