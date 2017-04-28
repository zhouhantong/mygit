Page.ready(($, query) => {

  var self, post, banners = [],
    carousel,scrimDom;

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

      "/activity/movie/MovieAction/postdetail".GET({
        obj: {
          actcode: actCode,
          id: query.postid
        },
        offset: 0,
        size: 1000
      }).then(obj => {
        post = obj.post;
        banners.push(post);
        banners = banners.concat(obj.reply.list);
        self.render();
      })
    },
    onRender: function() {
      self.tpl('stage', v.x({
        isSelf: post.openid == app.session.openid
      }, post), self);

      carousel = new v.ui.Carousel({
        index: 0,
        length: banners.length,
        mode: 'book'
      }).on('update', event => {
        var el = event.el.empty();
        var index = event.index;
        if (index >= 0) {
          var item = banners[index % banners.length]
          self.tpl('banner', v.x({
            aidx: post.aidx,
            bigimgurl: Fn.getPicUrl(item.bigimgurl)
          }, item), el).tap(() => {
            if (item.openid != app.session.openid) {
              wechat.previewImage({
                current: Fn.getPicUrl(item.bigimgurl),
                urls: banners.map(function(banner) {
                  return Fn.getPicUrl(banner.bigimgurl);
                })
              })
              return;
            }
            if (item.aidx) {
              Page.open("./post.html", {
                postid: item.id
              })
            } else {
              Page.open("./reply.html", {
                replyid: item.id,
                postid: post.id
              })
            }
          })
        }
      }).render(self.find('.banner'))

      self.find(".left").tap(function(){
        carousel.prev();
      });
      self.find(".right").tap(function(){
        carousel.next();
      });

      self.paging.load();
    },
    onPaging: function(paging) {
      paging.start().then(paging => {
        return "/activity/movie/MovieAction/getTextReplyList".GET({
          obj: {
            actcode: actCode,
            postid: query.postid
          },
          offset: paging.count,
          size: paging.size
        })
      }).then(obj => {
        if (obj.total == 0) {
          return;
        }
        obj.list.forEach(function(item) {
          self.tpl("replyText", $.mixin({
            date: Fn.getTime(item.createtime),
            nickname: item.nickname || "游客",
            headimgurl: item.headimgurl || "./images/pic_share.jpg"
          }, item), self.find(".list"));
        })
        page.find(".replyTextBox").removeClass("hide")
      })
    },
    onLike: function() {
      "/activity/movie/MovieAction/postlike".GET({
          obj: {
            actcode: actCode,
            id: post.id,
            openid: post.openid
          }
        }).then(obj => v.ui.alert("投票成功").then(() => location.reload()))
        .catch(e => v.ui.alert(e.response.errmsg))
    },
    onMainPage: function() {
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
    onReply: function(event) {
      Page.open("./reply.html", {
        postid: post.id
      });
    },
    onOpenSendText: function() {
      v(document.body).append(
        <div class='scrim popup-box-info'>
	    		<div class="box-info">
	    			<div class="box-input">
	    				<textarea id="xname"></textarea>
	    			</div>
	    			<div class="sbtn-bar">
	    				<div class="sbtn-common" v-link="*onClose">取消</div>
	    				<div class="sbtn-common" v-link="*onSendTextReply">确定</div>
	    			</div>
	    		</div>
	    	</div>
      )
      scrimDom = v('.popup-box-info');
    },
    onClose: function() {
      scrimDom.remove();
    },
    onSendTextReply: function() {
      var content = scrimDom.find('#xname').val();
      if (!content) {
        return v.ui.alert("请填写内容");
      }
      "/activity/movie/MovieAction/sendTextReply".GET({
        obj: {
          actcode: actCode,
          postid: post.id,
          content: content
        }
      }).then(() => {
        v.ui.alert("评论成功").then(() => location.reload())
      })
    }
  }
})