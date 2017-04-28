"use strict";
Page.ready(function($, query) {
  
  return {
    
    options: {
      wx: true
    },

    onRender: function() {
      var page = $('');
    
      var pageSize = 20,
          pageIndex = 1,
          loading = false,
          itemAll = 0;
    
      createPage();
    
      function createPage(){
        loading = true;
        var params = {
          offset: pageIndex * pageSize - pageSize,
          size: pageSize
        };
        api.request.get("/hfz/HfzCqblAction/myAppointmentList", params).then(function(response){ var msg = response.data;
          if(true){
            loading = false;
            if(msg.total > 0) {
              pageIndex++;
              itemAll = itemAll + msg.list.length;
              createCommonItem(msg.list,'.vpage-content .list');
            }else{
              $.createElements({
                classes: 'common-nodata-item',
                style: 'margin-top: 0',
                text: '暂无记录'
              }, '.vpage-content .list');
            }
          }
        });
      }
    
      function createCommonItem(list, selector) {
        var el = $(selector);
        var components = [];
        list.forEach(function(item,index) {
          components.push({
            classes: 'appoint-list-item',
            components: [{
              classes: 'topheader',
              components: [{
                classes: 'name',
                text: '姓名：' + item.name
              },{
                onSingleTap: function() {
                  location.href = 'tel:' + item.mobile;
                  return;
                },
                classes: 'mobile',
                text: item.mobile
              }]
            },{
              classes: 'time',
              text: '提交时间：' + Fn.getFullTime(item.createtime)
            },{
              onSingleTap: function() {
                Page.open('http://htjkgc.cq.winhante.com/marketies/rc/recommend-zy.html?info=' + encodeURIComponent(JSON.stringify({name:item.name,mobile:item.mobile})),{},true);
              },
              classes: 'btn-bb',
              text: '报备'
            }]
          });
        });
        $.createElements(components, el);
      }
    
      $(window).on('scroll', function() {
        var body = document.body;
        var bottom = body.scrollHeight - (body.scrollTop + window.innerHeight);
        if (bottom <= 200
            && pageSize * (pageIndex-1) <= itemAll
                  && loading == false
                  && itemAll > 0) {
          createPage();
        }
      });
    }
    
  }
})