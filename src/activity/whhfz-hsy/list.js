Page.ready(() => {

  var self, scroller, ID;

  return {
    options: {
      autoRender: false
    },

    init: function() {
      self = this;
      app.wechat.SHARE_TITLE = SHARE_TITLE;
      app.wechat.SHARE_DESC = SHARE_DESC;
      app.wechat.SHARE_TIMELINE_TITLE = SHARE_TIMELINE_TITLE;
      app.wechat.SHARE_IMG_URL = SHARE_IMG_URL;
      app.wechat.SHARE_LINK = SHARE_LINK;

      "/activity/movie/MovieAction/counter".GET({
        actcode: actCode
      }).then(obj => {
        self.counter = obj;

        self.render();
      })
    },

    onRender: function() {
      self.tpl('stage', {}, self)

      var counters = [{
        name: "投票次数",
        count: self.counter.likecounts | 0
      }, {
        name: "访问量",
        count: self.counter.likecounts + self.counter.browscounts | 0
      }];

      app.Grid.create({
        len: counters.length,
        maxlen: 2,
        percentage: 0.5,
        parentNode: self.find(".counterBox")
      }).then(el => {
        el.find(".grid-item").forEach(function(item, index) {
          self.tpl("counter", counters[index], v(item));
        });
      })

      self.loadData();
    },

    loadData: function() {
      "/activity/movie/MovieAction/postrank".GET({
        obj: {
          actcode: actCode,
          hide: 0,
          like: 100
        },
        offset: 0,
        size: maxCount
      }).then(obj => {
        app.Grid.create({
          len: obj.total,
          maxlen: 2,
          percentage: 0.495,
          parentNode: self.find(".list")
        }).then(el => {
          el.find(".grid-item").forEach(function(item, index) {
            var data = obj.list[index] || {};
            var dom = self.tpl("item", data, v(item));
            if (data.bigimgurl) dom.show();
          });
        })
      })
    },
    onLike: function(event, id, openid) {
      "/activity/movie/MovieAction/postlike".GET({
        obj: {
          actcode: actCode,
          id: id,
          openid: openid,
          cartype: "xx2salbdeop==3"
        }
      }).then(obj => {
        return self.join().then(() => self.draw().then(() => v.ui.alert("投票成功").then(() => location.reload())))
      }).catch(e => v.ui.alert(e.response.errmsg))
    },
    onDetail: function(event, id) {
      "/activity/movie/MovieAction/postdetail".GET({
        obj: {
          actcode: actCode,
          id: id
        },
        offset: 0,
        size: 0
      }, {
        quiet: true
      })
      "/activity/movie/MovieAction/postrank".GET({
        obj: {
          actcode: actCode,
          hide: 0,
          like: 100
        },
        offset: 0,
        size: maxCount
      }).then(obj => {
        obj.list.forEach((item, index) => {
          if (item.id == id) {
            scroller = new IScroll(self.tpl("detail", v.x({
              index: index + 1,
              difflike: index == 0 ? 0 : (obj.list[index - 1].like - item.like)
            }, item), v(document.body))[0]);
            ID = setInterval(() => {
              scroller.refresh()
            }, 100);
          }
        })
      })
    },
    join: function() {
      return "/activity/comm/CommActivityAction/info".GET({
        obj: {
          acode: acode
        }
      }, {
        quiet: true
      }).then(obj => {
        if (obj.info) {
          return Promise.resolve();
        } else {
          return "/activity/comm/CommActivityAction/join".GET({
            obj: {
              acode: acode
            }
          }, {
            quiet: true
          })
        }
      })
    },
    draw: function() {
      return "/activity/comm/CommActivityAction/draw".GET({
        obj: {
          acode: acode
        }
      }, {
        quiet: true
      })
    },
    onClose: function() {
      clearInterval(ID);
      v('.scrim').remove();
    }
  }
});