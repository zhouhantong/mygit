"use strict";
Page.ready(function($, query) {
  
  return {
    
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-map');
    
      var latitude = query.latitude;
      var longitude = query.longitude;
      var streetpanorama = query.streetpanorama;
      var title = decodeURIComponent(query.title);
      // console.log('mapstatic2.html?latitude='+latitude+'&longitude='+longitude+'&title='+query.title);
      $.createElements([{
        tag: 'iframe',
        classes: 'iframe',
        frameborder: 'no',
        framemargin: '0',
        width: document.body.clientWidth + 'px',
        height: document.body.clientHeight + 'px',
        src: 'mapstatic2.html?latitude='+latitude+'&longitude='+longitude+'&title='+query.title
      },{
        classes: 'nav ' + (streetpanorama ? '' : 'hide'),
        onTap: function() {
          Page.open('./pano.html',{
            streetpanorama: streetpanorama
          },false);
        }
      }], '.vpage-content');
    
      app.sharexkb.createButtons(this.wrapperEl);
    }
    
  }
})