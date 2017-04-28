"use strict";
Page.ready(function($, query) {
  
  return {
    options: {
      wx: true
    },

    onRender: function() {
      var page = this // 自动生成的代码
      api.request.get("/hfz/HfzTeamManageAction/getTeamProInfo", {
        obj: {
          projectid: parseInt(query.id)
        }
      }).then(function(response){ var msg = response.data;
        if(true){
          if(!msg || (!msg.updinfotime && !msg.information)) {
            v.ui.alert('未设置报备信息');
            !function(){
              history.go(-1)
            }.defer(1000)
          }else{
            msg.time = Fn.getFullTime(msg.updinfotime)
            msg.information = msg.information.replace(/\n/g,'<br>')
            page.tpl("pro-layer", msg, page.find('.vpage-content'));
          }
        }
      });
    }
    
  }
})