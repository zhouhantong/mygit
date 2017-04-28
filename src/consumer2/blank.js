"use strict";
Page.ready(function($, query) {
  
  return {

    name: "curstatus",
    
    options: {
      wxSharable: false
    },

    onRender: function() {
      var page = $('#page-curstatus');
    
      api.getAppid.get({}, {mask: false}).then(() => {
        if (!app.session.issubscribe) {
          // Page.open('http://mp.weixin.qq.com/s?__biz=MzAwODE4OTEyMg==&mid=207207435&idx=1&sn=8b4907fe7dad9c9a3c10cd49ab1f53f5#rd');
          Page.open(app.SUBS_URL, {}, true);
        } else {
          Page.open('./house-prolist.html', {}, true);
        }  
      });
    }
    
  }
})