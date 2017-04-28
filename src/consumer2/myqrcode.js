"use strict";
Page.ready(function ($, query) {

  return {
    // name: '',

    options: {
      menu: true
      // pagingEnabled: true
    },

    onRender: function () {
      var self = this


      api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo").then(function (respons) {
        var userObj = respons.data || {}
        if (userObj.agent) {
          var agent = userObj.agent;
          self.tpl('qr-detail', {hasCode: !!agent.wxqrcode}, self.find('.vpage-content'));
          self.eventbind();

          if (agent.wxqrcode) {
            var box = self.find(".codeBox");
            box.find("div").addClass("hide");
            box.style("background", "url(" + agent.wxqrcode + ") no-repeat  center center");
            box.style("background-size", "auto 100%");
          }
        }
      });
    },
    eventbind:function(){
      var self = this
      var backurl = location.protocol + '//' + location.host + '/consumer2/myqrcode.html'
      var url = app.API_URL + '?j=' +
          encodeURIComponent(JSON.stringify({
            openid: app.session.openid,
            passport: app.session.passport,
            action: "/hfz/HfzChannelManageAction/updAgentWxQrcode",
            requestParam: {
              obj: { backurl: backurl}

            }

          }));

      self.find(".qrcode-upfile").on("change", function (e) {

        var file   = event.target.files[0];
        var reader = new FileReader();
        var box    = self.find(".codeBox");

        reader.onload = function (e) {
          if ($.env.ios) {
            box.find("div").addClass("hide");
            box.style("background", "url(" + e.target.result + ") no-repeat  center center");
            box.style("background-size", "auto 100%");

          } else {
            box.find("div").addClass("hide");
            box.style("background", "url(" + e.target.result.replace('data:', 'data:image/gif;') + ") no-repeat center center");
            box.style("background-size", "auto 100%");
          }
        }
        reader.readAsDataURL(file)

        $('#_qr_form').attr('action', url)
        $('#_qr_form')[0].submit()
        v.ui.Loading.start()

      });

    }

  }
})