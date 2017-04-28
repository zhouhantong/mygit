(function() {
  app.Grid = {
    create: function(options) {
      var opts = v.mixin({}, options)
      return new Promise(function(resolve, reject) {
        try {
          if (opts.percentage > 1) {
            opts.percentage += "%"
          } else {
            opts.percentage = (opts.percentage * 100) + "%"
          }

          var grid = [];
          var row = {};
          var components = [];

          var len = Math.floor(Fn.div(opts.len, opts.maxlen));
          if (opts.len % opts.maxlen > 0) {
            len++;
          }
          opts.len = len;

          for (var i = 0; i < opts.len; i++) {
            row = {
              classes: "hflexbox",
              style: "box-align: start; -webkit-box-align: start"
            };
            components = [];
            for (var y = 0; y < opts.maxlen; y++) {
              components.push({
                classes: "grid-item",
                width: (i == (opts.len - 1) && opts.maxlen == 1 && opts.len % opts.maxlen == 0) ? "100%" : opts.percentage
              })
              if (y != (opts.maxlen - 1)) {
                components.push({
                  flex: 1
                })
              }
            };
            row.components = components;
            grid.push(row);
          };
          var els = v.$(grid, opts.parentNode);
          els.items = els.find(".grid-item");
          resolve(els);
        } catch (e) {
          console.debug(e)
          reject();
        }
      })
    }
  }
})()