"use strict";
Page.ready(function($, query) {
  
  return {
    name: "market-adetail",
    options: {
      wx: true
    },

    onRender: function() {
      // if(!DEBUG) app.wxjsapk.hideOptionMenu = true;
      var page = $('#page-market-adetail');
      var id = query.id ? parseInt(query.id) : '';
    
      api.request.get("/hfz/HfzActivityAction/getActivityInfo", {
        obj: {
          id: id
        }
      }).then(function(response){ var msg = response.data;
        var json = JSON.parse(msg.json);
        if(json.title) {
          $.createElements([{
            tag: 'h2',
            text: json.title
          },{
            classes: 'time',
            text: Fn.getTime(msg.publishtime)
          }],'.vpage-content');
        }
        json.content.forEach(function(item){
          switch(item.flag) {
            case 1:
              $.createElements([{
                classes: 'content',
                html: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+item.c
              }],'.vpage-content');
              break;
            case 2:
              $.createElements([{
                tag: 'img',
                src: item.purl
              }],'.vpage-content');
              break;
            case 3:
              $.createElements([{
                classes: 'timeline hflexbox',
                components: [{
                  classes: 'line',
                },{
                  classes: 'date',
                  text: item.c
                },{
                  classes: 'line'
                }]
              }],'.vpage-content');
              break;
          }
        });
      })
    }
    
  }
})