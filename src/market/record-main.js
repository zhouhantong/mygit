"use strict";
Page.ready(function($, query) {
  
  return {
    
    options: {
      scroller: true,
      wx: true
    },

    onRender: function() {
      var page = this // 自动生成的代码
      var agent;
    
      api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}).then(function(response){ var msg = response.data;
        if(true){
          agent = msg.agent;
          if(agent){
            if(agent.workstate != 0 && agent.state == 1){
              api.request.get("/hfz/HfzAppointmentAction/getMyPerformance", {}).then(function(response){ var msg = response.data;
                if(true){
                  _createMenu(msg);
                }
              });
            }else{
              return Page.open("../market/checkstatus.html", {}, true);
            }
          }else{
            return Page.open("../market/register.html", {type: "agent"}, true);
          }
        }
      });
    
      function _createMenu(object){
    
        var hasAuth = false;
        api.request.get("/hfz/HfzChannelManageAction/getRegisterInfo", {}).then(function(response){ var msg = response.data;
          if(code == 0 && (msg.agent || msg.saler)) {
            var obj = (msg.agent ? msg.agent : msg.saler);
            var position = obj.position;
            if(obj.state == 1 && position == 200 && obj.workstate
              != 0) {
              hasAuth = true;
            }
          }
    
          var menus = [{
            name: "我的房源",
            classes: "m1",
            num: object.myproject | 0,
            url: "../consumer2/plist2.html?type=2&pagetype=3&housetype=1&isowner=1"
          },{
            name: "我的预约",
            classes: "m2",
            num: object.myappointment | 0,
            url: "./record-customer.html?pagetype=1"
          },{
            name: "我的报备",
            classes: "m3",
            num: object.myreport | 0,
            url: "./record-customer.html?pagetype=2"
          },{
            name: "成交客户",
            classes: "m4",
            num: object.myDeal | 0,
            url: "./record-customer.html?pagetype=3"
          }];
    
          if(hasAuth) {
            menus.push({
              name: "房源审核",
              classes: "m4",
              num: -1,
              url: "../consumer2/plist2.html?pagetype=3&check=1"
            });
          }
    
          menus.forEach(function(item){
            item.SHOW = true;
            if(item.num == -1) {
              item.SHOW = false;
            }
            page.tpl("menu", item, page.find(".menus"))
          })
    
    
        });
    
    
      }
    }
    
  }
})