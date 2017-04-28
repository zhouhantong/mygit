"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-loginpc",
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-loginpc');
    
      var uuid = query.uuid;
    
      page.find('.next-button').singleTap(function() {
        api.request.get("/global/Qqcms/rootLogin", {
          obj: {
            uuid: uuid
          }
        }).then(function(response){ var msg = response.data;
          if(true) {
            page.find('.next-button').addClass('hide');
            alert('登录成功');
          }
        });
      });
    }
    
  }
})