Page.ready(($, query) => {

	var self;
	var postid = query.postid | 0;
	var replyid = query.replyid | 0;
	var image = new Image();
	var imgScroller;

	return {
		name: "post",
		options: {
			wxShareable: false
		},
		init: function() {
			self = this;
			app.wechat.SHARE_TITLE = '最IN“葛优躺”';
			app.wechat.SHARE_DESC = '最IN“葛优躺”';
			app.wechat.SHARE_TIMELINE_TITLE = '最IN“葛优躺”';
			app.wechat.SHARE_IMG_URL = `${location.origin}/activity/hfz-gyt/images/pic_share.jpg`;
			app.wechat.SHARE_LINK = `${location.origin}/activity/hfz-gyt/list.html`;
			wechat.init();
		},
		onRender: function() {
			imgScroller = new IScroll(".imgBox");
		},
		onChange: function(e) {
			var file = e.target.files[0];
			if (!file) {
				return;
			}
			v.ui.Loading.start()
			canvasResize(file, {
				width: 600,
				height: 0,
				quality: 100,
				callback: function(data, width, height) {
					image.src = data;
					self.find('.fileimg').attr('src', data);
					imgScroller.refresh();
					v.ui.Loading.stop()
				}
			});
		},
		onSave: function() {

			var str;

			if (image.src) {
				str = Fn.getImageBase64({
					width: 600,
					height: 600,
					image: image,
					imgScroller: imgScroller,
					center: true
				});
			}

			if (replyid) {
				"/activity/movie/MovieAction/updateReplydetail".POST({
          obj: {
            actcode: actCode,
            id: replyid
          },
          bigdata: str
        }).then(() => Page.open("./detail.html", {
					postid: postid
				}, true))
			} else {
				"/activity/movie/MovieAction/reply".POST({
          obj: {
            actcode: actCode,
            postid: postid
          },
          bigdata: str
        }).then(() => Page.open("./detail.html", {
					postid: postid
				}, true))
			}
		}
	}
})