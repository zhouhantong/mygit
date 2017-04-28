"use strict";
Page.ready(function ($, query) {

  return {

    name: "blgl-share",

    options: {
      scroller: true,
      wx: true
    },

    onRender: function () {
      var flag = query.flag ? query.flag : '';
      var id = parseInt(query.id);
      var rsvopenid = query.rsvopenid ? query.rsvopenid : '';
      var hostname = location.host;
      var showid = parseInt(query.showid);
      var channel = (query.channel ? query.channel : '');

      api.request.get("/hfz/HfzSpecialAction/getSpecialAndAgent", {
        obj: {
          id: id,
          agentOpenid: app.session.openid
        }
      }).then(function (response) {
        var msg = response.data;
        var special = msg.special;
        var shortUrl = special.publicizeurl;

        Page.open(shortUrl, {
          preopenid: app.session.openid,
          prepassport: app.session.passport,
          preappid: app.id,
          flag: flag,
          id: id,
          rsvopenid: rsvopenid,
          hostname: hostname,
          showid: showid,
          channel: channel
        }, true);
      });
    }

  }
})