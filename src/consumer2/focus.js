"use strict";
Page.ready(function($, query) {
  
  return {
    
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-focus');
    
      var url = query.url;
    
      $.createElements([{
        tag: 'iframe',
        classes: 'iframe',
        frameborder: 'no',
        framemargin: '0',
        width: document.body.clientWidth + 'px',
        height: document.body.clientHeight + 'px',
        src: url
      },{
        id: 'focus-note',
        classes: 'focus-note',
        components: [{
          classes: 'zz',
        },{
          classes: 'btnote',
          components: [{
            classes: 'arrow',
          },{
            classes: 'logo'
          },{
            classes: 'note-txt'
          }]
        }]
      }], '.vpage-content');
    
      var count = 3;
    
      var ival = window.setInterval(function(){
        $('.note-txt').html('已经搜索到项目官方微信！<span>'+(count--)+'</span>秒以后，点击左上角蓝色小字即可关注！')
      },1000);
    
      (function() {
        clearInterval(ival);
        $('#focus-note').remove();
        Page.open(url);
      }).defer(4000);
    }
    
  }
})