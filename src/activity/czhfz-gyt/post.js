Page.ready(($, query) => {

	var self;
	var postid = query.postid | 0;
	var image = new Image();
	var imgScroller;

	return {
		options: {
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

			"/activity/movie/MovieAction/search".GET({
				obj: {
					actcode: actCode,
					openid: app.session.openid
				},
				size: 1,
				offset: 0
			}).then(obj => {
				if (!postid && obj.total > 0) {
					return Page.open("./detail.html", {
						postid: obj.list[0].id
					}, true)
				}

				self.render();
			})
		},
		onRender: function() {
			imgScroller = new IScroll(".imgBox");
			if(!postid){
				self.find(".inputBox").show();
			}else{
				self.find(".imgBox").style("margin", "3rem auto 0 auto");
			}
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
			var name = self.find(".name").val();
			var mobile = self.find(".mobile").val();
			var memo = self.find(".memo").val();

			if (!postid && (!name || !mobile || !memo)) {
				return v.ui.alert("信息必填");
			}

			if (!postid && !Fn.isMobile(mobile)) {
				return v.ui.alert("电话号码格式不正确")
			}

			if (!postid && !image.src) {
				return v.ui.alert("必须选择图片");
			}

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

			if (postid) {
				"/activity/movie/MovieAction/updatePostdetail".POST({
					obj: {
						id: postid,
						actcode: actCode,
						// title: name,
						// mobile: mobile,
						// memo: memo
					},
					bigdata: str
				}).then(() => Page.open("./detail.html", {
					postid: postid
				}, true))
			} else {
				"/activity/movie/MovieAction/post".POST({
					obj: {
						actcode: actCode,
						title: name,
						mobile: mobile,
						memo: memo,
						hide: 0
					},
					bigdata: str
				}).then(obj => Page.open("./detail.html", {
					postid: obj
				}, true))
			}
		}
	}
})