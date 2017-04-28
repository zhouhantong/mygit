Page.ready({
  
  init: function() {
    app.wechat.SHARE_IMG_URL = location.protocol + '//' + location.host + '/activity/liujiao/images/share.jpg';
    app.wechat.SHARE_LINK = location.protocol + '//' + location.host + '/activity/liujiao/index.html';
    app.wechat.hideMenuItems = ["menuItem:copyUrl"];
    window.updateShare = function(score) {
      if (score > 0) {
        app.wechat.SHARE_TITLE = "我玩了" + score + "分，玩不到4000分以后请别在我面前那么嚣张！";
        app.wechat.SHARE_DESC = "我玩了" + score + "分，玩不到4000分以后请别在我面前那么嚣张！";
      } else {
        app.wechat.SHARE_TITLE = "玩不到4000分以后请别在我面前那么嚣张！"
        app.wechat.SHARE_DESC = "玩不到4000分以后请别在我面前那么嚣张！";
      }
      wechat.init();
    }
    updateShare(parseInt($.storage.get("score.v1")));
  }
  
});
