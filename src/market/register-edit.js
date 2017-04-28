"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-register",
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-market-register');
    
        $.createElements([{
            classes: 'img-area',
            components: [
                {
                    tag: 'input',
                    type: 'file',
                    accept: 'image/*',
                    name: 'fileinput',
                    classes: 'file-input',
                }, {
                    tag: 'img',
                    src: 'images/upload.png',
                    classes: 'upload-img'
                }
            ]
        }
        ], '#_qr_file');
        if (window.File && window.FileList && window.FileReader && window.Blob) {
            page.find('.file-input').on('change', getFiles);
        } else {
            v.ui.alert('浏览器不支持');
        }
        function getFiles(event) {
    
            var file = event.target.files[0];
            var reader = new FileReader();
            var img = $(event.target).siblings(".upload-img")[0];
            var remove = $(event.target).closest('.img-area');
            reader.onload = function (e) {
                if ($.env.ios) {
                    img.src = e.target.result;
                } else {
                    img.src = e.target.result.replace('data:', 'data:image/gif;');
                }
            }
            reader.readAsDataURL(file);
        }
    
        api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {
            obj: {
              openid: app.session.openid
            }
        }).then(function(response){ var msg = response.data;
            if (true) {
              var agent = msg.agent
              if(!agent) {
                return Page.open('../consumer2/myhome.html')
              }
              page.find("#mname").val(agent.name);
              page.find("#memo").val(agent.remark);
            }
        });
    
        // 提交申请
        page.find('.next-button').singleTap(function () {
            var name = $('#mname').val();
            var memo = $('#memo').val();
    
            if(!name) {
              return v.ui.alert('姓名为必填项');
            }
    
            var parames = {
              obj: {
                name: name,
                remark: memo,
              }
            };
            var reguri = '/hfz/HfzChannelManageAction/updateAgent';
    
            var backurl = location.protocol + '//' + location.host + '/consumer2/myhome.html';
    
            var url = app.API_URL + '?j=' +
              encodeURIComponent(JSON.stringify({
                  openid: app.session.openid,
                  passport: app.session.passport,
                  action: reguri,
                  requestParam: {
                    obj: parames.obj
                  },
                  backurl: backurl
              }));
            $('#_reg_form').attr('action', url);
            $('#_reg_form')[0].submit();
            app.loading.start();
        });
    }
    
  }
})