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
      var channel = (query.channel ? query.channel : '');
    
      api.request.get("/global/Select/listItemFromCache", {
        titleids: [titleid]
      }).then(function(response){ var msg = response.data;
        if(true) {
          console.log(msg[titleid][0]);
          var json = JSON.parse(msg[titleid][0].itemtext);
    
          if(!query.hfzopenid || !query.hfzpassport || !query.hfzappid) {
            return Page.open('http://' + json.specialhost + '/consumer2/hfz-redpacket-check.html?hostname='+hostname+'&titleid='+titleid+'&channel='+channel);
          }
    
          var len = json.redpacket.length;
          var obj = json.redpacket[Math.floor(Math.random()*len)];
          Page.open(obj.host + '/consumer2/hfz-redpacket-share.html',{
            hfzopenid: query.hfzopenid,
            hfzpassport: query.hfzpassport,
            hfzappid: query.hfzappid,
            preopenid: app.session.openid,
            prepassport: app.session.passport,
            specialhost: json.specialhost,
            specialid: json.specialid,
            specialshowid: json.specialshowid,
            redpacketcode: json.redpacketcode,
            hostname: hostname,
            sharetimes: (json.sharetimes ? json.sharetimes : 3),
            preappid: app.id,
            acode: obj.acode,
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