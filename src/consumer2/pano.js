"use strict";
Page.ready(function($, query) {
  
  return {

    name: "map",
    
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-map');
    
      var src = 'http://map.qq.com/#pano='+query.streetpanorama+'&heading=0&pitch=0&zoom=1';
    
      $.createElements([{
        tag: 'iframe',
        classes: 'iframe',
        frameborder: 'no',
        framemargin: '0',
        width: document.body.clientWidth + 'px',
        height: document.body.clientHeight + 'px',
        src: src
      }], '.vpage-content');
    
      app.sharexkb.createButtons(this.wrapperEl);
    }
    
  }
})