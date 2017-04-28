Page.ready(() => {

  var self;
  var scrimDom;
  var bts = [{
    name: "人气排行",
    fn: './rank.html'
  }, {
    name: "我要报名",
    fn: "*onMainPage"
  }, {
    name: "我的主页",
    fn: "*onMainPage"
  }, {
    name: "活动规则",
    fn: './rule.html'
  }];

  return {
    options: {
      pagingEnabled: true,
      wxShareable: false,
      autoRender: false
    },

    init: function() {
      self = this;
      app.wechat.SHARE_TITLE = '最IN“葛优躺”';
      app.wechat.SHARE_DESC = '最IN“葛优躺”';
      app.wechat.SHARE_TIMELINE_TITLE = '最IN“葛优躺”';
      app.wechat.SHARE_IMG_URL = `${location.origin}/activity/hfz-gyt/images/pic_share.jpg`;
      app.wechat.SHARE_LINK = `${location.origin}/activity/hfz-gyt/list.html`;
      wechat.init();

      scrimDom = self.tpl('scrim', {}, $(document.body));
      page.tpl('stage', {}, page);
      ! function() {
        scrimDom.remove();
      }.defer(3000)

      "/activity/movie/MovieAction/counter".GET({
        actcode: actCode
      }).then(obj => {
        self.counter = obj;

        self.render();
      })
    },

    onRender: function(){
      app.Grid.create({
        len: bts.length,
        maxlen: 4,
        percentage: 0.24,
        parentNode: self.find(".bts")
      }).then(el => {
        el.find(".grid-item").forEach(function(item, index) {
          self.tpl("bt", bts[index], $(item));
        });
      })

      var counters = [{
        name: "参与人数",
        count: self.counter.posttotal || 0
      }, {
        name: "累积投票",
        count: self.counter.likecounts || 0
      }, {
        name: "围观数",
        count: self.counter.browscounts || 0
      }]

      app.Grid.create({
        len: counters.length,
        maxlen: 3,
        percentage: 0.33,
        parentNode: self.find(".counterBox")
      }).then(el => {
        el.find(".grid-item").forEach(function(item, index) {
          self.tpl("counter", counters[index], $(item));
        });
      })

      self.paging.load()
    },
    onPaging: function(paging){
      paging.start().then(paging => {
        return "/activity/movie/MovieAction/search".GET({
          obj: {
            actcode: actCode,
            hide: 0
          },
          offset: paging.count,
          size: paging.size
        })
      }).then(obj => {
        if (obj.total == 0) {
          return;
        }
        var list = obj.list;
        list = list.sort(function() {
          return Math.random() > .5 ? -1 : 1;
        })
        app.Grid.create({
          len: list.length,
          maxlen: 2,
          percentage: 0.49,
          parentNode: page.find(".list")
        }).then(el => {
          el.find(".grid-item").forEach(function(item, index) {
            var cache = list[index];
            if(cache){
              var el = self.tpl("item", $.mixin({
                bigimgurl: Fn.getPicUrl(cache.bigimgurl)
              }, cache), $(item));
            }
          })
        })
      })
    },
    onMainPage: function(){
      "/activity/movie/MovieAction/search".GET({
        obj: {
          actcode: actCode,
          openid: app.session.openid
        },
        offset: 0,
        size: 1
      }).then(obj => {
        if (obj.total > 0) {
          Page.open("./detail.html", {
            postid: obj.list[0].id
          });
        } else {
          Page.open("./post.html");
        }
      })
    },
    onSearch: function(){
      var search = page.find(".search").val()
      if (search) {
        "/activity/movie/MovieAction/search".GET({
          obj: {
            actcode: actCode,
            hide: 0,
            keyword: search.replace("号", "")
          },
          offset: 0,
          size: 1
        }).then(obj => {
          if (obj.total > 0) {
            Page.open("./detail.html", {
              postid: obj.list[0].id
            })
          } else {
            v.ui.alert("没有查询结果")
          }
        })
      }else{
        v.ui.alert("请输入搜索词")
      }
    }
  }
});