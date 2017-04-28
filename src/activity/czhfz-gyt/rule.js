Page.ready({
	options: {
		wxShareable: false
	},
	init: function() {
		var self = this;
		app.wechat.SHARE_TITLE = '最IN“葛优躺”';
		app.wechat.SHARE_DESC = '最IN“葛优躺”';
		app.wechat.SHARE_TIMELINE_TITLE = '最IN“葛优躺”';
		app.wechat.SHARE_IMG_URL = `${location.origin}/activity/hfz-gyt/images/pic_share.jpg`;
		app.wechat.SHARE_LINK = `${location.origin}/activity/hfz-gyt/list.html`;
		wechat.init();
	}
})