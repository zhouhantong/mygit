"use strict";
Page.ready(function($, query) {
  
  return {

    name: "histories",
    
    options: {
      menu: true,
      scroller: true,
      trademark: true,
      wx: true
    },

    onRender: function() {
      var page = $('#page-histories');
    
      var pageSize = 20,
          pageIndex = 1,
          loading = false,
          itemAll = 0;
    
      var houseListEl = page.find('.list');
    
      createPage();
    
      function createPage() {
        loading = true;
        var obj = {
          offset: pageIndex * pageSize - pageSize,
          size: pageSize
        }
        api.request.get("/sq/my/Reserve/list", obj).then(function(response){ var msg = response.data;
          loading = false;
          if(msg.total == 0) {
            $.createElements({
              classes: 'common-nodata-item notop',
              text: '暂无记录'
            }, '.vpage-content');
          } else {
            pageIndex++;
            itemAll = itemAll + msg.list.length;
    
            msg.list.forEach(function(house) {
              var tags = []
              var date = new Date(house.createtime);
              var m = date.getMonth() + 1;
              m <= 9 ? m = '0' + m : m;
              d = date.getDate();
              d <= 9 ? d = '0' + d : d;
              h = date.getHours();
              h <= 9 ? h = '0' + h : h;
              m2 = date.getMinutes();
              m2 <= 9 ? m2 = '0' + m2 : m2;
              s = date.getSeconds();
              s <= 9 ? s = '0' + s : s;
              // return date.getFullYear() + '-' + m + '-' + d + ' ' + h + ':' + m2 + ':' + s;
              $.createElements({
                classes: 'house-item',
                onSingleTap: function(event){
                  if (!$(event.target).hasClass('value')){
                    if(house.type == 2) {
                      Page.open('./house-detail.html?projectid=' + house.projectid);
                    } else {
                      Page.open('./detail.html?projectid=' + house.projectid);
                    }
                  }
                },
                components: [
                  {classes: 'info-box', components: [
                    {classes: 'time ',html:m+'月'+d+'日'+'<br>'+h+':'+m2},
                    {classes: 'img', style: house.picurl ? 'background-image: url(' + house.picurl + ')' : ''},
                    {classes: 'content', components: [
                      {classes: 'title', text: house.projectname},
                      {
                        classes: 'box-item',
                        components: [{
                          text: '置业顾问：'
                        },{
                          tag: 'img',
                          src: (house.agentimgurl ? location.protocol + '//' + location.host + house.agentimgurl : 'images/head.jpg')
                        },{
                          text: house.agentname || ''
                        }]
                      },
                      {classes: 'value', onSingleTap:function(){
                        location.href='tel:'+house.mobile;
                        return;
                      }, text: house.mobile || ''}
                    ]},
                    {classes: 'arrow'}
                  ]},
                  // {classes: 'tag-box' + (tags.length ? '' : ' hide'), components: [
                  //   {classes: 'tag', components:[
                  //     {text: tags.join(' | ')}
                  //   ]}
                  // ]}
                ]
              }, houseListEl)
            })
    
          }
        });
      }
    
      var listenScroller = function() {
        if (app.scroller) {
          app.scroller.on('scrollEnd',function(){
              if( (this.y - this.maxScrollY) <=0
                  && pageSize * (pageIndex-1) <= itemAll
                  && loading == false
                  && itemAll > 0) {
                createPage();
              }
          },false);
        } else {
          setTimeout(listenScroller, 100);
        }
      };
      setTimeout(listenScroller, 100);
    }
    
  }
})