"use strict";
Page.ready(function($, query) {
  
  return {
    
    options: {
      wx: true
    },

    onRender: function() {
      var page = this // 自动生成的代码
      var rcmdcustid = query.id ? parseInt(query.id) : ''
    
        api.request.get("/hfz/HfzTeamManageAction/getCustomerInfo", {
          obj: {
            id: rcmdcustid
          }
        }).then(function(response){ var msg = response.data;
          if(true){
            page.tpl("cus-item-layer", msg, page.find('.info-layer'));
            if(msg.memo) {
              page.tpl("gf-layer", msg, page.find('.info-layer'));
            }
            page.tpl("gj-layer", msg, page.find('.info-layer'));
    
            page.tpl("bar-layer", {}, page.find('.bar-layer'));
    
            if(msg.followuplist.length) {
              msg.followuplist.forEach(function(item){
                item.time = Fn.getFullTime(item.createtime)
                page.tpl("gj-list-layer", item, page.find('.gj-list-layer'));
              })
            } else {
              page.tpl("noitem", {}, page.find('.gj-list-layer'));
            }
    
            if(msg.projectlist.length) {
              msg.projectlist.forEach(function(item) {
                item.isSelected1 = (item.issubmit == 1)
                item.isSelected2 = (item.isvisit == 1)
                item.isSelected3 = (item.isdeal == 1)
                item.isSelected1 ? item.time1 = Fn.getTime(item.submittime) : ''
                item.isSelected2 ? item.time2 = Fn.getTime(item.visittime) : ''
                item.isSelected3 ? item.time3 = Fn.getTime(item.dealtime) : ''
                page.tpl("bb-list-layer", item, page.find('.bb-list-layer'));
              })
            }
    
          }
        });
    
      page.goMobile = function(event, mobile) {
        location.href = 'tel:' + mobile
        return
      }
    
      page.showType = function(event, type) {
        page.find('.bar-layer > div').removeClass('selected')
        if(!$(event.target).hasClass('selected')) {
          $(event.target).addClass('selected')
        }
        if(type == 'a') {
          page.find('.gj-list-layer').removeClass('hide')
          page.find('.bb-list-layer').addClass('hide')
        }else {
          page.find('.gj-list-layer').addClass('hide')
          page.find('.bb-list-layer').removeClass('hide')
        }
      }
    
      page.submitGJ = function() {
        var content = page.find('textarea').val()
        if(!content) {
          return v.ui.alert('请先输入跟进内容');
        }
        api.request.get("/hfz/HfzTeamManageAction/addCustFollowup", {
          obj: {
            rcmdcustid: rcmdcustid,
            content: content
          }
        }).then(function(response){ var msg = response.data;
          if(true){
            v.ui.alert('添加成功');
            !function(){
              location.reload()
            }.defer(1000)
          }
        });
      }
    }
    
  }
})