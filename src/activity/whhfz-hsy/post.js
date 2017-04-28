Page.ready(($, query) => {

	var self;
	var postid = query.postid | 0;
	var image = new Image();
	var imgScroller;

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

			"/activity/movie/MovieAction/search".GET({
				obj: {
					actcode: actCode
				},
				size: maxCount + 1,
				offset: 0
			}).then(obj => {
				if (!postid && obj.total > maxCount) {
					return v.ui.alert("超过参数数量")
				}

				self.render();
			})
		},
		onRender: function() {
			imgScroller = new IScroll(".imgBox");
			// if(!postid){
			// 	self.find(".inputBox").show();
			// }else{
			// 	self.find(".imgBox").style("margin", "3rem auto 0 auto");
			// }
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
			var memo = self.find(".memo").val();
			var no = self.find(".no").val();

			if (!postid && (!name || !memo || !no)) {
				return v.ui.alert("信息必填");
			}

			if (!postid && !image.src) {
				return v.ui.alert("必须选择图片");
			}

			var str;

			if (image.src) {
				str = Fn.getImageBase64({
					width: 450,
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
						title: name || null,
						teachername: no || null,
						memo: memo || null
					},
					bigdata: str
				}).then(() => Page.open("./list.html", {}, true))
			} else {
				"/activity/movie/MovieAction/post".POST({
					obj: {
						actcode: actCode,
						title: name || null,
						memo: memo || null,
						teachername: no || null,
						hide: 0
					},
					bigdata: str
				}).then(obj => Page.open("./list.html", {}, true))
			}
		}
	}
})