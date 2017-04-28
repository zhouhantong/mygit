/**
 * Created by cator on 7/29/16.
 */
"use strict";
Page.ready(function($, query) {

  return {

    options: {
    },

    init() {
      this.find('.mp-name').text("“" + (query.name || "好房子") + "”")
    }
  }

})
