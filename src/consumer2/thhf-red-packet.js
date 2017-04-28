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
      var channel = query.channel ? query.channel : '';
    
      api.request.get("/global/Select/listItemFromCache", {
        titleids: [titleid]
      }).then(function(response){ var msg = response.data;
        if(true) {
          var json = JSON.parse(msg[titleid][0].itemtext);
    
          if(!query.hfzopenid || !query.hfzpassport || !query.hfzappid) {
            return Page.open('http://' + json.hfzhost + '/consumer2/hfz-redpacket-check.html?hostname='+hostname+'&titleid='+titleid+'&type='+query.type+'&channel='+channel);
          }
    
          var len = json.redpacket.length;
          var obj = json.redpacket[Math.floor(Math.random()*len)];
          Page.open(obj.host + '/consumer2/thhf-redpacket-share.html',{
            hfzopenid: query.hfzopenid,
            hfzpassport: query.hfzpassport,
            hfzappid: query.hfzappid,
            preopenid: app.session.openid,
            prepassport: app.session.passport,
            hfzhost: json.hfzhost,
            redpacketcode: json.redpacketcode,
            hostname: hostname,
            sharetimes: (json.sharetimes ? json.sharetimes : 3),
            titleid: titleid,
            acode: obj.acode,
            preappid: app.id,
            channel: channel,
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