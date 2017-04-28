"use strict";
Page.ready(function($, query) {
  
  return {
    name: "blgl-share",
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var titleid = parseInt(query.titleid);
      var hostname = location.host;
    
      api.request.get("/global/Select/listItemFromCache", {
        titleids: [titleid]
      }).then(function(response){ var msg = response.data;
        if(true) {
          var json = JSON.parse(msg[titleid][0].itemtext);
          var len = json.redpacket.length;
          var obj = json.redpacket[Math.floor(Math.random()*len)];
          Page.open(obj.host + '/consumer2/write-redpacket-share.html',{
            preopenid: app.session.openid,
            prepassport: app.session.passport,
            preappid: app.id,
            specialhost: json.specialhost,
            redpacketcode: json.redpacketcode,
            hostname: hostname,
            sharetimes: (json.sharetimes ? json.sharetimes : 3),
            acode: obj.acode,
            titleid: titleid,
            j: JSON.stringify({
              openid: app.session.openid,
              passport: app.session.passport
            })
          },true);
        }
      });
    }
    
  }
})