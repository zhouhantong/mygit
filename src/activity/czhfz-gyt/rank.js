Page.ready({
	options: {
		pagingEnabled: true,
    wxShareable: false,
    autoRender: false
	},
	init: function(){
		app.wechat.SHARE_TITLE = '最IN“葛优躺”';
		app.wechat.SHARE_DESC = '最IN“葛优躺”';
		app.wechat.SHARE_TIMELINE_TITLE = '最IN“葛优躺”';
		app.wechat.SHARE_IMG_URL = `${location.origin}/activity/hfz-gyt/images/pic_share.jpg`;
		app.wechat.SHARE_LINK = `${location.origin}/activity/hfz-gyt/list.html`;
		wechat.init();

		this.paging.load();
	},
	onPaging: function(paging){
		var self = this;
		paging.start().then(paging => {
			"/activity/movie/MovieAction/postrank".GET({
        obj: {
          actcode: actCode,
          hide: 0,
          like: 100
        },
        offset: paging.count,
        size: paging.size
      }).then(obj => {
      	if (obj.total == 0) {
          return;
        }
        obj.list.forEach((item, index) => {
        	self.tpl("item", $.mixin({
            index: paging.count + index + 1,
            headimgurl: Fn.getPicUrl(item.headimgurl) || "./images/pic_share.jpg"
          }, item), self.find(".list"))
        })
      })
		})
	}
})