"use strict";
Page.ready(function ($, query) {

  var page
  var listEl
  var searchEl
  var idx = 0

  return {
    name: 'cus-prolist',

    options: {
      wx: true,
      pagingEnabled: true
    },

    onRender: function () {
      page = this // 自动生成的代码
      listEl = page.find('.list');
      searchEl = $('#search');

      init();

      function init() {
        // var list = [{
        //       action: "/hfz/HfzChannelManageAction/getRegisterInfo",
        //       params: {
        //         obj: {
        //           openid: app.session.openid
        //         }
        //       }
        //     },{
        //       action: '/hfz/HfzTeamManageAction/getNewCustCnt'
        //     }];
        // Page.magic({
        //   list: list
        // }).then(function(datas){
        //   userObj = datas[0].msg
        //   numObj = datas[1].msg
        //   if(userObj.team && userObj.team.state == 3) {
        //     teamState = false
        //   }
        //   if(userObj.team && (userObj.team.state == 1 || userObj.team.state == 3) && userObj.teammember && userObj.teammember.position == 1) {
        //     //队长
        //     usertype = 1
        //   }else {
        //     usertype = 2
        //   }
        page.paging.reset().load()
        // });
      }

      //搜素
      page.find('.searchbt').singleTap(function () {
        idx = 0
        page.paging.reset().load()
      });

    },

    onPaging: function (paging) {
      var search = searchEl.val()

      if (paging.isFirst()) {
        listEl.empty()
      }

      var params = {
        agentid: "1",
        mode: "SALER",
        menuid: "weiuserlist"
      }

      if (search) {
        params.projectname = search
      }

      var aciton = '/hfz/HfzChannelManageAction/listProject'

      paging.start().then(function (paging) {
        api.request.get(aciton, {
          obj: params,
          offset: paging.count,
          size: paging.size
        }).then(function (response) {
          var obj = response.data
          paging.done(obj.list.length, obj.total)

          if (obj.total == 0) {
            page.tpl("noitem", {}, listEl);
            return;
          }

          obj.list.forEach(function (item) {
            item.bgcolor = (idx % 2 == 0 ? 'b1' : 'b2')
            item.PROJECTNAME = encodeURIComponent(item.projectname)
            page.tpl("pro-item", item, listEl)
            idx++
          })
        })
      })
    }

  }
})