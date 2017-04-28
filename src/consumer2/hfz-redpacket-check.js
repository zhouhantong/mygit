"use strict";
Page.ready(function($, query) {
  
  return {

    name: "blgl-share",
    
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var type = query.type | 0;
      var channel = query.channel ? query.channel : '';
    
      if(type == 2) {
        Page.open('http://' + query.hostname + '/consumer2/thhf-red-packet.html?titleid=' + query.titleid + '&hfzopenid=' + app.session.openid + '&hfzpassport=' + app.session.passport + '&hfzappid=' + app.id + '&channel=' + channel);
      }else {
        Page.open('http://' + query.hostname + '/consumer2/hfz-red-packet.html?titleid=' + query.titleid + '&hfzopenid=' + app.session.openid + '&hfzpassport=' + app.session.passport + '&hfzappid=' + app.id + '&channel=' + channel);
      }
    }
    
  }
})