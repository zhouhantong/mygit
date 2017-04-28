"use strict";
Page.ready(function($, query) {
  
  var from = query.from ? query.from : '' // 自动生成的代码

  return {
    
    options: {
      menu: (from ? false : true),
      scroller: true,
      wx: true
    },

    onRender: function() {
      var projectid = Number(query.projectid);
    
      var from = query.from ? query.from : '';
    
      if(!projectid){
        return v.ui.alert('非法访问',{shade:true,autoClose:false});
      }
    
      var sectionid,postid,likeamount,dislikeamount;
    
      var page = $('#page-forum');
    
      var backtop = $('.backtop');
    
      backtop.tap(function(){
        app.scroller.scrollTo(0,0,500);
        app.scroller.refresh();
      });
    
      api.getpostbyprojectid.get({
        projectid: projectid
      }).then(function(response){ var msg = response.data;
        if(code < 0){
          return v.ui.alert('非法访问',{shade:true,autoClose:false});
        }
        var post = msg.post || {};
        postid = post.id;
        sectionid = post.sectionid;
        likeamount = post.likeamount;
        page.find('.forum-like .like .memo').html((likeamount || 0)+'人');
        dislikeamount = post.dislikeamount;
        page.find('.forum-like .nolike .memo').html((dislikeamount || 0)+'人');
        createPage();
    
        page.find('.forum-like .like-button.like').singleTap(function(){
          var dom = $(this);
          like(dom,postid, 1);
        });
    
        page.find('.forum-like .like-button.nolike').singleTap(function(){
          var dom = $(this);
          like(dom,postid, 2);
        });
    
        page.find('.submit').singleTap(submit);
      });
    
      function like(dom, postid, type){
        api.likeforum.get({
          postid: postid,
          type: type
        }, {mask:false}).then(function(response){ var msg = response.data;
          if(code == 0 && msg){
            if(type==1){
              likeamount++;
              page.find('.forum-like .like .memo').html((likeamount || 0)+'人');
              page.find('.forum-like .like .prompt').removeClass('hide');
            }else if(type==2){
              dislikeamount++;
              page.find('.forum-like .nolike .memo').html((dislikeamount || 0)+'人');
              page.find('.forum-like .nolike .prompt').removeClass('hide');
            }
            dom.removeClass('close');
          }else{
            v.ui.alert("今天已经发表过态度");
          }
        });
      }
    
    
      function submit(){
        var content = page.find('.reply').val();
        if(!content){
          return v.ui.alert('请添加评论');
        }
        api.reply.get({
          postid: postid,
          sectionid: sectionid,
          obj: {
            content: content
          }
        }).then(function(response){ var msg = response.data;
          if(true){
            location.reload();
          }
        });
      }
    
      var data = [];
      var dateArray = [];
      var pageSize = 20,
          pageIndex = 1,
          loading = false,
          itemAll = [],
          index = 1;
    
      function createPage(){
        var list = [];
        loading = true;
        api.replylist.get({
            postid : postid,
            offset: pageIndex * pageSize - pageSize,
            size: pageSize
          }).then(function(response){ var msg = response.data;
            loading = false;
            pageIndex++;
            if(true){
              msg.list.forEach(function(item){
                itemAll.push(item);
                list.push({
                  url: item.headimgurl || 'images/head.jpg',
                  nickname: item.name || item.nickname || '游客',
                  date: Fn.getTime2(item.createtime),
                  content: item.content
                });
              });
    
              $.createElements(list.map(function(item){
                var dom = {
                  classes: 'reply-item',
                  components: [{
                    classes: 'item-left',
                    components: [{
                      tag: 'img',
                      src: item.url,
                      classes: 'user-img'
                    }]
                  },{
                    classes: 'item-center',
                    components: [{
                      classes: 'user-name',
                      html: item.nickname
                    },{
                      classes: 'reply-date',
                      html: item.date,
                    },{
                      classes: 'reply-content',
                      html: item.content
                    }]
                  }]
                };
                return dom;
              }),page.find('.reply-list'));
    
              if(list.length) {
                page.find('.common-block.mtop').removeClass('hide');
              }
            }
        });
      }
    
      var listenScroller = function() {
        if (app.scroller) {
          app.scroller.on('scrollEnd',function(){
            if( (this.y - this.maxScrollY) <=0
                && pageSize * (pageIndex-1) <= itemAll.length
                && loading == false) {
              createPage();
            }
            if($.env.screen.height + this.y - 200 <= 0){
              if(backtop.hasClass('out')){
                backtop.removeClass('out');
                backtop.addClass('in');
                backtop.removeClass('hide');
              }
            }else{
              if(backtop.hasClass('in')){
                backtop.removeClass('in');
                backtop.addClass('out');
                backtop.addClass('hide');
              }
            }
          },false);
        } else {
          setTimeout(listenScroller, 250);
        }
      };
      setTimeout(listenScroller, 250);
    }
    
  }
})