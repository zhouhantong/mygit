"use strict";
Page.ready(function($, query) {
  
  return {
    name: 'house-statement',

    options: {
    },

    onRender: function() {
      var self = this

      api.request.get('/hfz/HfzCommAction/getDisclaimer', {
        obj: {
          wxappid: app.session.appid
        }
      }).then(function (response) {
        self.data = response.data
        self.tpl('detail',self.data, self.find('.vpage-content'))
      })

    }
    
  }
})